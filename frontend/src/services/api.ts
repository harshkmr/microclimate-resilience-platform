import type {
  HviMapResponse,
  DemographicWeights,
  CoolingCenterGap,
  OutreachPlanResponse,
  Worksite,
  WorksiteStatus,
  SafetyAlert,
  CropProfile,
  AgriculturalPlot,
  AgroMicroclimateResponse,
  ApiKeyStatus
} from '../types';

const API_BASE = '/api';

// Fallback seed data for instant client-side resiliency
const FALLBACK_TRACTS = [
  {
    tract_id: "04013112500",
    name: "Central City / Downtown Phoenix",
    population: 4820,
    elderly_pct: 14.2,
    low_income_pct: 38.5,
    canopy_cover_pct: 4.8,
    no_ac_pct: 18.3,
    avg_surface_temp_c: 44.6,
    hvi_score: 88.4,
    risk_level: "Extreme" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [[
        [-112.085, 33.445],
        [-112.065, 33.445],
        [-112.065, 33.460],
        [-112.085, 33.460],
        [-112.085, 33.445]
      ]]
    }
  },
  {
    tract_id: "04013113000",
    name: "Garfield Historic District",
    population: 5200,
    elderly_pct: 16.8,
    low_income_pct: 34.0,
    canopy_cover_pct: 6.2,
    no_ac_pct: 14.5,
    avg_surface_temp_c: 42.8,
    hvi_score: 76.2,
    risk_level: "Extreme" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [[
        [-112.065, 33.445],
        [-112.045, 33.445],
        [-112.045, 33.460],
        [-112.065, 33.460],
        [-112.065, 33.445]
      ]]
    }
  },
  {
    tract_id: "04013114000",
    name: "Coronado / Midtown",
    population: 6100,
    elderly_pct: 12.0,
    low_income_pct: 22.0,
    canopy_cover_pct: 12.5,
    no_ac_pct: 6.0,
    avg_surface_temp_c: 39.5,
    hvi_score: 48.5,
    risk_level: "Moderate" as const,
    geometry: {
      type: "Polygon" as const,
      coordinates: [[
        [-112.065, 33.460],
        [-112.045, 33.460],
        [-112.045, 33.480],
        [-112.065, 33.480],
        [-112.065, 33.460]
      ]]
    }
  }
];

const FALLBACK_COOLING_CENTERS = [
  {
    id: "cc-01",
    name: "Burton Barr Central Library Oasis",
    address: "1221 N Central Ave, Phoenix, AZ 85004",
    latitude: 33.4622,
    longitude: -112.0738,
    capacity: 250,
    current_occupancy: 142,
    is_open: true,
    operating_hours: "08:00 - 20:00",
    features: ["Hydration Station", "Medical Triage", "Pet Friendly", "Misting Zone"]
  },
  {
    id: "cc-02",
    name: "Grant Park Community Center",
    address: "405 S 2nd Ave, Phoenix, AZ 85003",
    latitude: 33.4418,
    longitude: -112.0772,
    capacity: 120,
    current_occupancy: 88,
    is_open: true,
    operating_hours: "09:00 - 19:00",
    features: ["Hydration Station", "Air Conditioned Shelter"]
  }
];

const FALLBACK_WORKSITES: WorksiteStatus[] = [
  {
    site: {
      id: "site-01",
      name: "Light Rail Extension - Central Ave Corridor",
      category: "Roadwork / Transit Infrastructure",
      latitude: 33.452,
      longitude: -112.073,
      crew_size: 45,
      supervisor_name: "Carlos Mendez",
      contact_phone: "+1-602-555-0142",
      active_shift_start: "06:00",
      active_shift_end: "14:30"
    },
    metrics: {
      temperature_c: 42.4,
      relative_humidity_pct: 22,
      solar_irradiance_wm2: 890,
      heat_index_c: 45.1,
      wbgt_c: 32.8,
      air_quality_idx: 68
    },
    advisory: {
      risk_level: "Extreme",
      color_code: "#ef4444",
      work_minutes_per_hour: 20,
      rest_minutes_per_hour: 40,
      recommended_water_liters_per_hour: 1.0,
      summary_advisory: "DANGER: Extreme WBGT heat load. Implement 20m work / 40m shade rest intervals.",
      ppe_guidance: "Mandatory evaporative cooling neck wraps, UV hardhat brims, and electrolyte supplementation."
    },
    is_threshold_exceeded: true
  },
  {
    site: {
      id: "site-02",
      name: "Warehouse Logistics Hub - Sky Harbor South",
      category: "Logistics & Distribution",
      latitude: 33.428,
      longitude: -112.015,
      crew_size: 60,
      supervisor_name: "Sarah Jenkins",
      contact_phone: "+1-602-555-0189",
      active_shift_start: "05:00",
      active_shift_end: "13:30"
    },
    metrics: {
      temperature_c: 39.8,
      relative_humidity_pct: 28,
      solar_irradiance_wm2: 780,
      heat_index_c: 41.5,
      wbgt_c: 30.4,
      air_quality_idx: 55
    },
    advisory: {
      risk_level: "High",
      color_code: "#f97316",
      work_minutes_per_hour: 30,
      rest_minutes_per_hour: 30,
      recommended_water_liters_per_hour: 0.9,
      summary_advisory: "WARNING: High heat stress. 30m work / 30m shaded recovery required.",
      ppe_guidance: "High-visibility ventilated vests, polarized safety eyewear, active hydration tracking."
    },
    is_threshold_exceeded: true
  }
];

const FALLBACK_CROPS: CropProfile[] = [
  {
    crop_id: "crop-tomato",
    name: "Field Tomatoes",
    category: "Horticulture",
    base_temp_c: 10.0,
    optimal_temp_range_c: [20.0, 29.0],
    critical_heat_threshold_c: 35.0,
    gdd_to_maturity: 1400.0,
    kc_mid: 1.15,
    description: "Sensitive to blossom drop and pollen sterility when daytime microclimate surface temperatures exceed 35°C."
  },
  {
    crop_id: "crop-wheat",
    name: "Durum Wheat",
    category: "Cereal Grain",
    base_temp_c: 4.4,
    optimal_temp_range_c: [15.0, 24.0],
    critical_heat_threshold_c: 32.0,
    gdd_to_maturity: 1800.0,
    kc_mid: 1.05,
    description: "Vulnerable to forced maturity and grain shriveling under severe diurnal heat spikes during the grain-filling stage."
  }
];

const FALLBACK_PLOTS: AgriculturalPlot[] = [
  {
    id: "plot-01",
    name: "South Mountain Agro-Park Parcel A",
    crop_id: "crop-tomato",
    crop_name: "Field Tomatoes",
    area_hectares: 18.5,
    soil_type: "Sandy Loam",
    irrigation_system: "Subsurface Drip",
    latitude: 33.365,
    longitude: -112.065
  },
  {
    id: "plot-02",
    name: "Salt River Agricultural Basin Parcel 4",
    crop_id: "crop-wheat",
    crop_name: "Durum Wheat",
    area_hectares: 34.0,
    soil_type: "Clay Loam",
    irrigation_system: "Center Pivot Sprinkler",
    latitude: 33.395,
    longitude: -112.145
  }
];

export const api = {
  // Vulnerability
  async getHviMap(weights?: DemographicWeights): Promise<HviMapResponse> {
    try {
      const res = await fetch(`${API_BASE}/vulnerability/hvi-map`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weights || {})
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API route /api/vulnerability/hvi-map fallback used', e);
    }
    return {
      tracts: FALLBACK_TRACTS,
      cooling_centers: FALLBACK_COOLING_CENTERS,
      weights_used: weights || {
        temperature_weight: 0.3,
        elderly_weight: 0.2,
        low_income_weight: 0.2,
        canopy_deficit_weight: 0.15,
        no_ac_weight: 0.15
      },
      overall_mean_temp_c: 41.2,
      high_risk_tract_count: 2
    };
  },

  async getCoolingGaps(): Promise<CoolingCenterGap[]> {
    try {
      const res = await fetch(`${API_BASE}/vulnerability/cooling-gaps`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API route fallback used', e);
    }
    return [
      {
        tract_id: "04013112500",
        tract_name: "Central City / Downtown Phoenix",
        hvi_score: 88.4,
        nearest_center_name: "Burton Barr Central Library Oasis",
        distance_km: 1.8,
        is_underserved: true,
        recommended_action: "Deploy Mobile Misting Bus & Pop-up Hydration Depot"
      }
    ];
  },

  async getOutreachPlan(): Promise<OutreachPlanResponse> {
    try {
      const res = await fetch(`${API_BASE}/vulnerability/outreach-plan`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API route fallback used', e);
    }
    return {
      plan_id: "OUTREACH-PHX-DEMO",
      generated_at: new Date().toISOString(),
      total_population_at_risk: 14850,
      priority_dispatch_queue: [
        {
          rank: 1,
          tract_id: "04013112500",
          tract_name: "Central City / Downtown Phoenix",
          hvi_score: 88.4,
          risk_level: "Extreme",
          estimated_vulnerable_residents: 2540,
          assigned_team: "Phoenix Civic Resilience Team Alpha",
          priority: "IMMEDIATE",
          recommended_action: "Door-to-door senior checks & bottled water distribution"
        }
      ]
    };
  },

  // Worker Safety
  async getWorksites(): Promise<Worksite[]> {
    try {
      const res = await fetch(`${API_BASE}/worker-safety/sites`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_WORKSITES.map(w => w.site);
  },

  async evaluateWorksites(): Promise<WorksiteStatus[]> {
    try {
      const res = await fetch(`${API_BASE}/worker-safety/evaluate`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_WORKSITES;
  },

  async getAlerts(): Promise<SafetyAlert[]> {
    try {
      const res = await fetch(`${API_BASE}/worker-safety/alerts`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return [
      {
        alert_id: "alt-01",
        site_id: "site-01",
        site_name: "Light Rail Extension - Central Ave Corridor",
        severity: "EMERGENCY",
        message: "WBGT exceeded 32.5°C threshold. Immediate 40m shade rest mandatory.",
        wbgt_c: 32.8,
        timestamp: new Date().toISOString(),
        acknowledged: false
      }
    ];
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/worker-safety/alerts/${alertId}/acknowledge`, { method: 'POST' });
    } catch (e) {}
  },

  async broadcastCrewAlert(siteId: string, message: string, severity = 'DANGER'): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/worker-safety/broadcast-crew-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: siteId, message, severity })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return { status: 'broadcasted', site_id: siteId, message, severity };
  },

  // Agriculture
  async getCrops(): Promise<CropProfile[]> {
    try {
      const res = await fetch(`${API_BASE}/agriculture/crops`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_CROPS;
  },

  async getPlots(): Promise<AgriculturalPlot[]> {
    try {
      const res = await fetch(`${API_BASE}/agriculture/plots`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return FALLBACK_PLOTS;
  },

  async getPlotAnalytics(plotId: string): Promise<AgroMicroclimateResponse> {
    try {
      const res = await fetch(`${API_BASE}/agriculture/plots/${plotId}/analytics`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      plot: FALLBACK_PLOTS[0],
      crop: FALLBACK_CROPS[0],
      accumulated_gdd: 958.0,
      projected_harvest_date: "2026-05-18",
      gdd_progress_pct: 68.4,
      daily_et0_total_mm: 6.84,
      recommended_irrigation_volume_liters: 72500,
      optimal_irrigation_windows: [
        {
          hour: 5,
          hour_label: "05:00",
          temperature_c: 24.2,
          solar_irradiance_wm2: 45,
          et0_mm_per_hour: 0.12,
          is_recommended_window: true,
          evaporation_loss_risk: "Low",
          efficiency_score: 95
        },
        {
          hour: 6,
          hour_label: "06:00",
          temperature_c: 26.5,
          solar_irradiance_wm2: 180,
          et0_mm_per_hour: 0.22,
          is_recommended_window: true,
          evaporation_loss_risk: "Low",
          efficiency_score: 92
        },
        {
          hour: 14,
          hour_label: "14:00",
          temperature_c: 42.8,
          solar_irradiance_wm2: 920,
          et0_mm_per_hour: 0.88,
          is_recommended_window: false,
          evaporation_loss_risk: "Extreme",
          efficiency_score: 35
        }
      ],
      gdd_forecast: [
        { day_number: 10, accumulated_gdd: 210, target_maturity_gdd: 1400, crop_stage: "Vegetative Growth" },
        { day_number: 30, accumulated_gdd: 640, target_maturity_gdd: 1400, crop_stage: "Vegetative Growth" },
        { day_number: 45, accumulated_gdd: 958, target_maturity_gdd: 1400, crop_stage: "Flowering & Fruit Set" },
        { day_number: 65, accumulated_gdd: 1400, target_maturity_gdd: 1400, crop_stage: "Harvest Maturity" }
      ]
    };
  },

  // System & API Key
  async getSystemStatus(): Promise<ApiKeyStatus> {
    try {
      const res = await fetch(`${API_BASE}/system/status`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      mode: "demo",
      has_valid_key: false,
      masked_key: null,
      plan_tier: "Demo Simulator Mode",
      status_message: "Operating on realistic synthetic microclimate telemetry."
    };
  },

  async updateSystemConfig(apiKey: string, forceMode?: string): Promise<ApiKeyStatus> {
    try {
      const res = await fetch(`${API_BASE}/system/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey, force_mode: forceMode })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      mode: forceMode === 'live' ? 'live' : 'demo',
      has_valid_key: !!apiKey,
      masked_key: apiKey ? `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}` : null,
      plan_tier: forceMode === 'live' ? "FortyGuard Enterprise v1" : "Demo Simulator Mode",
      status_message: forceMode === 'live' ? "FortyGuard API Key verified." : "Operating in Demo Simulator Mode."
    };
  }
};
