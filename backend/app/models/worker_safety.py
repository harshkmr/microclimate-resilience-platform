from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Worksite(BaseModel):
    id: str
    name: str
    category: str # "Construction", "Roadwork", "Sanitation", "Agriculture", "Logistics"
    latitude: float
    longitude: float
    crew_size: int
    supervisor_name: str
    contact_phone: str
    active_shift_start: str # "07:00"
    active_shift_end: str   # "16:00"

class EnvironmentalMetrics(BaseModel):
    temperature_c: float
    relative_humidity_pct: float
    heat_index_c: float
    wet_bulb_temp_c: float
    wbgt_c: float
    solar_irradiance_wm2: float
    air_quality_idx: int

class WorkRestRecommendation(BaseModel):
    risk_level: str # "Low", "Moderate", "High", "Extreme"
    color_code: str # "#10B981", "#F59E0B", "#F97316", "#EF4444"
    work_minutes_per_hour: int
    rest_minutes_per_hour: int
    recommended_water_liters_per_hour: float
    ppe_guidance: str
    stop_work_mandatory: bool
    summary_advisory: str

class WorksiteStatus(BaseModel):
    site: Worksite
    metrics: EnvironmentalMetrics
    advisory: WorkRestRecommendation
    last_evaluated_at: str
    is_threshold_exceeded: bool

class SafetyAlert(BaseModel):
    alert_id: str
    site_id: str
    site_name: str
    timestamp: str
    severity: str # "WARNING", "DANGER", "EMERGENCY"
    wbgt_c: float
    heat_index_c: float
    message: str
    acknowledged: bool
    dispatched_channels: List[str] # ["SMS", "Push", "Email", "Site Siren"]

class WorksiteCreate(BaseModel):
    name: str
    category: str
    latitude: float
    longitude: float
    crew_size: int
    supervisor_name: str
    contact_phone: str
    active_shift_start: str = "07:00"
    active_shift_end: str = "16:00"
