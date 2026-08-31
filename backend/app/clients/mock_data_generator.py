import math
import random
import datetime
from typing import Dict, Any, List

class MockDataGenerator:
    """
    Generates realistic, physically consistent synthetic FortyGuard microclimate responses
    for demonstration and offline development mode.
    """

    @staticmethod
    def get_diurnal_multiplier(hour: int) -> float:
        # Peak heat between 14:00 and 16:00 (hour 14-16)
        # Lowest at 05:00
        return math.sin((hour - 9) * math.pi / 12)

    @classmethod
    def generate_env_params(cls, lat: float, lon: float, timestamp: datetime.datetime = None) -> Dict[str, Any]:
        if timestamp is None:
            timestamp = datetime.datetime.now()
        
        hour = timestamp.hour + timestamp.minute / 60.0
        diurnal = cls.get_diurnal_multiplier(int(hour))
        
        # Spatial microclimate variation based on lat/lon hash
        loc_hash = (math.sin(lat * 100) + math.cos(lon * 100)) * 2.0
        
        # Baseline summer temperatures for arid/urban core (32°C night to 44°C day)
        base_temp = 37.0 + (diurnal * 7.0) + loc_hash
        temperature_c = round(max(26.0, min(48.0, base_temp)), 1)
        
        # Inverse relative humidity (lower during peak heat)
        base_rh = 38.0 - (diurnal * 22.0) - (loc_hash * 2)
        relative_humidity = round(max(10.0, min(85.0, base_rh)), 1)
        
        # Calculate Heat Index (Rothfusz regression approximation in Celsius)
        # T in F, RH in %
        tf = temperature_c * 9.0 / 5.0 + 32.0
        rh = relative_humidity
        hi_f = -42.379 + 2.04901523*tf + 10.14333127*rh - 0.22475541*tf*rh - 0.00683783*tf*tf - 0.05481717*rh*rh + 0.00122874*tf*tf*rh + 0.00085282*tf*rh*rh - 0.00000199*tf*tf*rh*rh
        heat_index_c = round((hi_f - 32.0) * 5.0 / 9.0, 1) if tf >= 80 else temperature_c
        
        # Stull formula for Wet-Bulb Temperature (approximation)
        t = temperature_c
        tw = (t * math.atan(0.151977 * math.sqrt(rh + 8.313659)) + 
              math.atan(t + rh) - 
              math.atan(rh - 1.676331) + 
              0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh) - 
              4.686035)
        wet_bulb_temp_c = round(tw, 1)
        
        # Solar Irradiance (GHI) W/m^2 (0 at night, up to 980 W/m^2 at noon)
        if 6 <= hour <= 19:
            sun_angle = math.sin((hour - 6) * math.pi / 13)
            solar_irradiance = round(max(0.0, sun_angle * 950.0 + random.uniform(-20, 20)), 1)
        else:
            solar_irradiance = 0.0
            
        # Simplified WBGT (outdoor with solar component)
        # WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Tdb (approximating Tg with solar load)
        tg_approx = temperature_c + (solar_irradiance / 100.0) * 1.5
        wbgt_c = round(0.7 * wet_bulb_temp_c + 0.2 * tg_approx + 0.1 * temperature_c, 1)
        
        # Air Quality Index (urban background + heat stagnation)
        aqi_base = 55 + int(diurnal * 25) + int(abs(loc_hash) * 10)
        aqi = max(30, min(220, aqi_base))
        
        return {
            "status": "Completed",
            "latitude": lat,
            "longitude": lon,
            "timestamp": timestamp.isoformat(),
            "temperature_celsius": temperature_c,
            "relative_humidity": relative_humidity,
            "heat_index_celsius": heat_index_c,
            "wet_bulb_temp_celsius": wet_bulb_temp_c,
            "wbgt_celsius": wbgt_c,
            "solar_irradiance_ghi": solar_irradiance,
            "air_quality_index": aqi,
            "source": "FortyGuard Synthetic Microclimate Simulator"
        }

    @classmethod
    def generate_heatmap_geojson(cls, aoi_feature_collection: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Returns high-resolution thermal GeoJSON grid cells for the target area.
        """
        # If AOI provided, extract bounds or use default Phoenix grid
        features = []
        
        # Generate 25 microclimate cells across Phoenix metropolitan test grid
        lat_start, lat_end = 33.430, 33.485
        lon_start, lon_end = -112.110, -112.040
        steps = 5
        
        d_lat = (lat_end - lat_start) / steps
        d_lon = (lon_end - lon_start) / steps
        
        for i in range(steps):
            for j in range(steps):
                c_lat = lat_start + i * d_lat
                c_lon = lon_start + j * d_lon
                
                # Temperature micro-hotspots (industrial & low canopy vs parks)
                is_hotspot = (i in (1, 2) and j in (1, 2, 3))
                is_coolspot = (i == 4 and j == 1) # Encanto park
                
                if is_coolspot:
                    temp = round(35.5 + random.uniform(-0.5, 0.8), 1)
                    heat_idx = round(temp + 1.2, 1)
                    anomaly = -3.2
                elif is_hotspot:
                    temp = round(43.8 + random.uniform(-0.4, 1.4), 1)
                    heat_idx = round(temp + 5.6, 1)
                    anomaly = 4.5
                else:
                    temp = round(40.2 + random.uniform(-0.8, 1.2), 1)
                    heat_idx = round(temp + 3.4, 1)
                    anomaly = 0.5
                
                cell_polygon = {
                    "type": "Polygon",
                    "coordinates": [[
                        [c_lon, c_lat],
                        [c_lon + d_lon, c_lat],
                        [c_lon + d_lon, c_lat + d_lat],
                        [c_lon, c_lat + d_lat],
                        [c_lon, c_lat]
                    ]]
                }
                
                features.append({
                    "type": "Feature",
                    "id": f"cell_{i}_{j}",
                    "geometry": cell_polygon,
                    "properties": {
                        "cell_id": f"GRID-{i:02d}-{j:02d}",
                        "surface_temp_c": temp,
                        "ambient_air_temp_c": round(temp - 2.8, 1),
                        "heat_index_c": heat_idx,
                        "thermal_anomaly_c": anomaly,
                        "albedo_estimate": round(0.12 if is_hotspot else (0.28 if is_coolspot else 0.18), 2),
                        "vegetation_fraction": round(0.04 if is_hotspot else (0.42 if is_coolspot else 0.14), 2)
                    }
                })
                
        return {
            "type": "FeatureCollection",
            "metadata": {
                "generated_at": datetime.datetime.now().isoformat(),
                "cell_count": len(features),
                "resolution_meters": 100,
                "provider": "FortyGuard Microclimate Simulator"
            },
            "features": features
        }

    @classmethod
    def generate_heat_intelligence(cls, lat: float, lon: float, temp_c: float = 41.5) -> Dict[str, Any]:
        return {
            "latitude": lat,
            "longitude": lon,
            "status": "Completed",
            "thermal_classification": "Severe Urban Heat Island (UHI)",
            "temperature_celsius": temp_c,
            "reports": {
                "geographic": {
                    "elevation_meters": 331,
                    "slope_degrees": 1.2,
                    "topographic_heat_trapping_risk": "Moderate"
                },
                "environmental": {
                    "tree_canopy_percentage": 5.4,
                    "impervious_surface_percentage": 86.2,
                    "cooling_potential_index": 22.0,
                    "relative_humidity_pct": 21.0
                },
                "urban": {
                    "building_height_avg_m": 14.5,
                    "street_canyon_aspect_ratio": 1.8,
                    "heat_absorption_rating": "High (Dark asphalt & concrete dominant)",
                    "cool_roof_adoption_rate_pct": 12.0
                },
                "anthropogenic": {
                    "traffic_density_tier": "High",
                    "vehicular_heat_emission_w_m2": 18.4,
                    "hvac_waste_heat_emission_w_m2": 24.8
                },
                "mitigation_recommendations": [
                    "Implement high-albedo cool pavement coating (projected -2.4°C reduction)",
                    "Target municipal tree planting canopy density to 25% along pedestrian corridors",
                    "Prioritize public cooling shelter transit shuttle routes"
                ]
            }
        }

    @classmethod
    def generate_api_key_usage(cls) -> Dict[str, Any]:
        return {
            "status": "Active",
            "plan_name": "FortyGuard Enterprise Sandbox",
            "credits_total": 50000,
            "credits_used": 1420,
            "credits_remaining": 48580,
            "rate_limit_per_minute": 120,
            "active_endpoints": [
                "/v1/heatmap",
                "/v1/heat_intelligence",
                "/v1/env_params",
                "/v1/status"
            ]
        }
