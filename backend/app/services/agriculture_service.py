import math
import datetime
from typing import List, Dict, Any, Optional

from app.models.agriculture import (
    CropProfile,
    AgriculturalPlot,
    HourlyIrrigationWindow,
    GddAccumulationPoint,
    AgroMicroclimateResponse
)
from app.data.seed_data import SEED_CROPS, SEED_AGRICULTURAL_PLOTS
from app.clients.fortyguard_client import fortyguard_client

class AgricultureService:
    def __init__(self):
        self.crops: Dict[str, CropProfile] = {
            c["id"]: CropProfile(**c) for c in SEED_CROPS
        }
        self.plots: Dict[str, AgriculturalPlot] = {
            p["id"]: AgriculturalPlot(**p) for p in SEED_AGRICULTURAL_PLOTS
        }

    def get_crops(self) -> List[CropProfile]:
        return list(self.crops.values())

    def get_plots(self) -> List[AgriculturalPlot]:
        return list(self.plots.values())

    @staticmethod
    def calculate_daily_gdd(t_max: float, t_min: float, t_base: float, t_upper: float = 35.0) -> float:
        """
        Modified Sine / Single-Triangle GDD method:
        GDD = max(0, ((min(t_max, t_upper) + max(t_min, t_base)) / 2.0) - t_base)
        """
        adj_max = min(t_max, t_upper)
        adj_min = max(t_min, t_base)
        avg_temp = (adj_max + adj_min) / 2.0
        return round(max(0.0, avg_temp - t_base), 2)

    @staticmethod
    def calculate_hourly_et0(t_c: float, rh_pct: float, solar_wm2: float) -> float:
        """
        Hourly FAO-56 Penman-Monteith / Hargreaves solar-derived ET0 approximation (mm/hr).
        """
        # Solar net radiation contribution (1 W/m^2 approx 0.0014 mm/hr equivalent evaporation)
        rad_evap = (solar_wm2 / 1000.0) * 0.45
        
        # Vapor pressure deficit factor
        sat_vp = 0.6108 * math.exp((17.27 * t_c) / (t_c + 237.3)) # kPa
        act_vp = sat_vp * (rh_pct / 100.0)
        vpd = max(0.1, sat_vp - act_vp)
        
        thermal_evap = 0.015 * (t_c + 10.0) * vpd
        et0 = round(max(0.02, rad_evap + thermal_evap), 3)
        return et0

    async def get_plot_analytics(self, plot_id: str) -> AgroMicroclimateResponse:
        plot = self.plots.get(plot_id)
        if not plot:
            plot = list(self.plots.values())[0]

        crop = self.crops.get(plot.crop_id) or list(self.crops.values())[0]

        # Fetch real-time / microclimate environmental params for plot coordinates
        env_data = await fortyguard_client.get_env_params(plot.latitude, plot.longitude)
        current_temp = float(env_data.get("temperature_celsius", 36.0))

        # 1. Generate 24-Hour Diurnal & Irrigation Efficiency Window
        hourly_windows: List[HourlyIrrigationWindow] = []
        daily_et0_sum = 0.0

        for h in range(24):
            # Diurnal temperature and solar curves
            diurnal_factor = math.sin((h - 9) * math.pi / 12)
            t_h = round(current_temp + (diurnal_factor * 6.5), 1)
            rh_h = round(max(15.0, min(80.0, 42.0 - (diurnal_factor * 25.0))), 1)
            
            if 6 <= h <= 19:
                sun_sin = math.sin((h - 6) * math.pi / 13)
                solar_h = round(max(0.0, sun_sin * 900.0), 1)
            else:
                solar_h = 0.0

            et0_h = self.calculate_hourly_et0(t_h, rh_h, solar_h)
            daily_et0_sum += et0_h

            # Evaporation Loss Risk & Recommendation Scoring
            if solar_h > 400.0 or t_h >= 38.0:
                risk = "Extreme"
                eff_score = max(10.0, 100.0 - (solar_h / 10.0) - (t_h * 1.2))
                is_recommended = False
            elif solar_h > 150.0 or t_h >= 32.0:
                risk = "High"
                eff_score = 45.0
                is_recommended = False
            elif 5 <= h <= 8:
                risk = "Low"
                eff_score = 92.0 # Prime dawn window
                is_recommended = True
            elif 20 <= h <= 23 or 0 <= h <= 4:
                risk = "Low"
                eff_score = 88.0 # Nocturnal window
                is_recommended = True
            else:
                risk = "Moderate"
                eff_score = 65.0
                is_recommended = False

            hourly_windows.append(HourlyIrrigationWindow(
                hour_label=f"{h:02d}:00",
                hour=h,
                temperature_c=t_h,
                relative_humidity_pct=rh_h,
                solar_irradiance_wm2=solar_h,
                et0_mm_per_hour=et0_h,
                evaporation_loss_risk=risk,
                is_recommended_window=is_recommended,
                efficiency_score=round(eff_score, 1)
            ))

        # 2. Compute GDD Accumulation & Crop Phenology Forecast
        gdd_forecast: List[GddAccumulationPoint] = []
        accumulated_gdd = 0.0
        
        # Generate simulation from planting date (~45 days)
        start_date = datetime.date.fromisoformat(plot.planting_date)
        total_days = 60

        for day_idx in range(1, total_days + 1):
            d_date = start_date + datetime.timedelta(days=day_idx)
            # Seasonal slight temperature rise
            daily_tmax = 34.0 + (day_idx * 0.15) + (math.sin(day_idx) * 2.5)
            daily_tmin = 20.0 + (day_idx * 0.10) + (math.cos(day_idx) * 2.0)
            
            d_gdd = self.calculate_daily_gdd(daily_tmax, daily_tmin, crop.base_temp_c, crop.max_temp_c)
            accumulated_gdd += d_gdd

            pct_m = accumulated_gdd / crop.gdd_to_maturity
            if pct_m < 0.15:
                stage = "Germination / Emergence"
            elif pct_m < 0.45:
                stage = "Vegetative Growth"
            elif pct_m < 0.70:
                stage = "Flowering & Fruit Set"
            elif pct_m < 0.95:
                stage = "Yield Formation / Ripening"
            else:
                stage = "Harvest Maturity"

            gdd_forecast.append(GddAccumulationPoint(
                date=d_date.isoformat(),
                day_number=day_idx,
                daily_gdd=round(d_gdd, 1),
                accumulated_gdd=round(accumulated_gdd, 1),
                target_maturity_gdd=crop.gdd_to_maturity,
                crop_stage=stage
            ))

        # Calculate projected harvest date (when accumulated_gdd reaches target)
        avg_daily_gdd = accumulated_gdd / len(gdd_forecast)
        remaining_gdd = max(0.0, crop.gdd_to_maturity - accumulated_gdd)
        days_to_harvest = int(remaining_gdd / (avg_daily_gdd if avg_daily_gdd > 0 else 15.0))
        projected_harvest = (datetime.date.today() + datetime.timedelta(days=days_to_harvest)).isoformat()

        # Heat stress evaluation
        if current_temp >= crop.critical_heat_threshold_c + 2.0:
            heat_stress = "Severe"
        elif current_temp >= crop.critical_heat_threshold_c:
            heat_stress = "Moderate"
        elif current_temp > crop.optimal_temp_range_c[1]:
            heat_stress = "Mild"
        else:
            heat_stress = "None"

        # Water volume required: Area in m^2 * ET0 (mm) * Crop coefficient (Kc ~ 0.85) / System efficiency
        # 1 mm over 1 m^2 = 1 Liter
        area_m2 = plot.area_hectares * 10000.0
        kc = 0.85
        sys_eff = 0.90 if plot.irrigation_system == "Drip" else (0.80 if plot.irrigation_system == "Center Pivot" else 0.70)
        rec_water_liters = round((area_m2 * daily_et0_sum * kc) / sys_eff, 0)

        return AgroMicroclimateResponse(
            plot=plot,
            crop=crop,
            current_temp_c=current_temp,
            accumulated_gdd=round(accumulated_gdd, 1),
            gdd_progress_pct=round(min(100.0, (accumulated_gdd / crop.gdd_to_maturity) * 100.0), 1),
            projected_harvest_date=projected_harvest,
            heat_stress_risk=heat_stress,
            daily_et0_total_mm=round(daily_et0_sum, 2),
            recommended_irrigation_volume_liters=rec_water_liters,
            optimal_irrigation_windows=hourly_windows,
            gdd_forecast=gdd_forecast
        )

agriculture_service = AgricultureService()
