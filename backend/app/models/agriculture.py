from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CropProfile(BaseModel):
    id: str
    name: str
    category: str # "Vegetable", "Cereal", "Fruit", "Fiber"
    base_temp_c: float
    max_temp_c: float
    optimal_temp_range_c: List[float] # [min_opt, max_opt]
    gdd_to_maturity: float
    critical_heat_threshold_c: float
    daily_water_need_mm: float
    description: str

class AgriculturalPlot(BaseModel):
    id: str
    name: str
    crop_id: str
    crop_name: str
    planting_date: str # "2026-03-01"
    area_hectares: float
    latitude: float
    longitude: float
    soil_type: str # "Loam", "Clay Loam", "Sandy Loam"
    irrigation_system: str # "Drip", "Center Pivot", "Sprinkler"

class HourlyIrrigationWindow(BaseModel):
    hour_label: str # "02:00", "03:00"
    hour: int       # 0 to 23
    temperature_c: float
    relative_humidity_pct: float
    solar_irradiance_wm2: float
    et0_mm_per_hour: float
    evaporation_loss_risk: str # "Low", "Moderate", "High", "Extreme"
    is_recommended_window: bool
    efficiency_score: float # 0 to 100

class GddAccumulationPoint(BaseModel):
    date: str
    day_number: int
    daily_gdd: float
    accumulated_gdd: float
    target_maturity_gdd: float
    crop_stage: str # "Germination", "Vegetative", "Flowering", "Yield Formation", "Maturity"

class AgroMicroclimateResponse(BaseModel):
    plot: AgriculturalPlot
    crop: CropProfile
    current_temp_c: float
    accumulated_gdd: float
    gdd_progress_pct: float
    projected_harvest_date: str
    heat_stress_risk: str # "None", "Mild", "Moderate", "Severe"
    daily_et0_total_mm: float
    recommended_irrigation_volume_liters: float
    optimal_irrigation_windows: List[HourlyIrrigationWindow]
    gdd_forecast: List[GddAccumulationPoint]
