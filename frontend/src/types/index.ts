export interface DemographicWeights {
  temperature_weight: number;
  elderly_weight: number;
  low_income_weight: number;
  canopy_deficit_weight: number;
  no_ac_weight: number;
}

export interface CensusTractVulnerability {
  tract_id: string;
  name: string;
  population: number;
  avg_surface_temp_c: number;
  elderly_pct: number;
  low_income_pct: number;
  canopy_cover_pct: number;
  no_ac_pct: number;
  hvi_score: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Extreme';
  geometry: any;
}

export interface CoolingCenter {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  is_active: boolean;
  features: string[];
}

export interface CoolingCenterGap {
  tract_id: string;
  tract_name: string;
  hvi_score: number;
  nearest_center_name: string;
  distance_km: number;
  is_underserved: boolean;
  recommended_action: string;
}

export interface HviMapResponse {
  region_name: string;
  timestamp: string;
  mode: 'live' | 'demo';
  tracts: CensusTractVulnerability[];
  cooling_centers: CoolingCenter[];
  overall_mean_temp_c: number;
  high_risk_tract_count: number;
}

export interface OutreachPlanResponse {
  plan_id: string;
  generated_at: string;
  priority_dispatch_queue: Array<{
    rank: number;
    tract_id: string;
    tract_name: string;
    hvi_score: number;
    risk_level: string;
    estimated_vulnerable_residents: number;
    assigned_team: string;
    priority: string;
    recommended_action: string;
    transit_distance_to_center_km: number;
  }>;
  active_cooling_shelters: number;
  total_population_at_risk: number;
}

export interface Worksite {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  crew_size: number;
  supervisor_name: string;
  contact_phone: string;
  active_shift_start: string;
  active_shift_end: string;
}

export interface EnvironmentalMetrics {
  temperature_c: number;
  relative_humidity_pct: number;
  heat_index_c: number;
  wet_bulb_temp_c: number;
  wbgt_c: number;
  solar_irradiance_wm2: number;
  air_quality_idx: number;
}

export interface WorkRestRecommendation {
  risk_level: 'Low' | 'Moderate' | 'High' | 'Extreme';
  color_code: string;
  work_minutes_per_hour: number;
  rest_minutes_per_hour: number;
  recommended_water_liters_per_hour: number;
  ppe_guidance: string;
  stop_work_mandatory: boolean;
  summary_advisory: string;
}

export interface WorksiteStatus {
  site: Worksite;
  metrics: EnvironmentalMetrics;
  advisory: WorkRestRecommendation;
  last_evaluated_at: string;
  is_threshold_exceeded: boolean;
}

export interface SafetyAlert {
  alert_id: string;
  site_id: string;
  site_name: string;
  timestamp: string;
  severity: 'WARNING' | 'DANGER' | 'EMERGENCY';
  wbgt_c: number;
  heat_index_c: number;
  message: string;
  acknowledged: boolean;
  dispatched_channels: string[];
}

export interface CropProfile {
  id: string;
  name: string;
  category: string;
  base_temp_c: number;
  max_temp_c: number;
  optimal_temp_range_c: [number, number];
  gdd_to_maturity: number;
  critical_heat_threshold_c: number;
  daily_water_need_mm: number;
  description: string;
}

export interface AgriculturalPlot {
  id: string;
  name: string;
  crop_id: string;
  crop_name: string;
  planting_date: string;
  area_hectares: number;
  latitude: number;
  longitude: number;
  soil_type: string;
  irrigation_system: string;
}

export interface HourlyIrrigationWindow {
  hour_label: string;
  hour: number;
  temperature_c: number;
  relative_humidity_pct: number;
  solar_irradiance_wm2: number;
  et0_mm_per_hour: number;
  evaporation_loss_risk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  is_recommended_window: boolean;
  efficiency_score: number;
}

export interface GddAccumulationPoint {
  date: string;
  day_number: number;
  daily_gdd: number;
  accumulated_gdd: number;
  target_maturity_gdd: number;
  crop_stage: string;
}

export interface AgroMicroclimateResponse {
  plot: AgriculturalPlot;
  crop: CropProfile;
  current_temp_c: number;
  accumulated_gdd: number;
  gdd_progress_pct: number;
  projected_harvest_date: string;
  heat_stress_risk: 'None' | 'Mild' | 'Moderate' | 'Severe';
  daily_et0_total_mm: number;
  recommended_irrigation_volume_liters: number;
  optimal_irrigation_windows: HourlyIrrigationWindow[];
  gdd_forecast: GddAccumulationPoint[];
}

export interface ApiKeyStatus {
  is_configured: boolean;
  mode: 'live' | 'demo';
  masked_key: string;
  credits_remaining?: number;
  plan_tier?: string;
  last_verified_at?: string;
  connection_healthy: boolean;
  status_message: string;
}
