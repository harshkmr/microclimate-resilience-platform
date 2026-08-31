from typing import List, Dict, Any

# Seed Census Tracts (Phoenix Metro Urban Area Heat Islands & Vulnerable Zones)
# Centered around 33.4484 N, -112.0740 W
SEED_CENSUS_TRACTS: List[Dict[str, Any]] = [
    {
        "tract_id": "TRACT-04013-1125",
        "name": "Central South Urban Core",
        "population": 6850,
        "base_temp_c": 43.8,
        "elderly_pct": 24.5,
        "low_income_pct": 38.2,
        "canopy_cover_pct": 4.1,
        "no_ac_pct": 14.8,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-112.085, 33.435],
                [-112.065, 33.435],
                [-112.065, 33.450],
                [-112.085, 33.450],
                [-112.085, 33.435]
            ]]
        }
    },
    {
        "tract_id": "TRACT-04013-1128",
        "name": "East Industrial & Rail Corridor",
        "population": 4920,
        "base_temp_c": 44.5,
        "elderly_pct": 18.0,
        "low_income_pct": 42.0,
        "canopy_cover_pct": 2.5,
        "no_ac_pct": 19.5,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-112.065, 33.435],
                [-112.045, 33.435],
                [-112.045, 33.450],
                [-112.065, 33.450],
                [-112.065, 33.435]
            ]]
        }
    },
    {
        "tract_id": "TRACT-04013-1130",
        "name": "Garfield Historic District",
        "population": 8400,
        "base_temp_c": 41.2,
        "elderly_pct": 21.0,
        "low_income_pct": 26.5,
        "canopy_cover_pct": 11.8,
        "no_ac_pct": 7.2,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-112.065, 33.450],
                [-112.045, 33.450],
                [-112.045, 33.465],
                [-112.065, 33.465],
                [-112.065, 33.450]
            ]]
        }
    },
    {
        "tract_id": "TRACT-04013-1134",
        "name": "Midtown Cultural District",
        "population": 11200,
        "base_temp_c": 38.6,
        "elderly_pct": 15.2,
        "low_income_pct": 14.0,
        "canopy_cover_pct": 22.4,
        "no_ac_pct": 2.1,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-112.085, 33.465],
                [-112.065, 33.465],
                [-112.065, 33.480],
                [-112.085, 33.480],
                [-112.085, 33.465]
            ]]
        }
    },
    {
        "tract_id": "TRACT-04013-1140",
        "name": "West Lower Grand Avenue",
        "population": 7350,
        "base_temp_c": 42.9,
        "elderly_pct": 22.8,
        "low_income_pct": 34.6,
        "canopy_cover_pct": 6.2,
        "no_ac_pct": 12.0,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-112.105, 33.450],
                [-112.085, 33.450],
                [-112.085, 33.465],
                [-112.105, 33.465],
                [-112.105, 33.450]
            ]]
        }
    },
    {
        "tract_id": "TRACT-04013-1145",
        "name": "Encanto Park & Greenbelt",
        "population": 5600,
        "base_temp_c": 36.2,
        "elderly_pct": 16.4,
        "low_income_pct": 11.2,
        "canopy_cover_pct": 34.0,
        "no_ac_pct": 1.5,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-112.105, 33.465],
                [-112.085, 33.465],
                [-112.085, 33.480],
                [-112.105, 33.480],
                [-112.105, 33.465]
            ]]
        }
    }
]

# Municipal Cooling Centers
SEED_COOLING_CENTERS: List[Dict[str, Any]] = [
    {
        "id": "CC-01",
        "name": "Central Municipal Library & Cooling Oasis",
        "address": "1221 N Central Ave, Phoenix, AZ",
        "latitude": 33.4618,
        "longitude": -112.0738,
        "capacity": 250,
        "current_occupancy": 118,
        "is_active": True,
        "features": ["Water Refill Station", "Medical Triage", "Pet Friendly", "Device Charging", "Backup Generators"]
    },
    {
        "id": "CC-02",
        "name": "Encanto Community Recreation Center",
        "address": "1500 N 15th Ave, Phoenix, AZ",
        "latitude": 33.4680,
        "longitude": -112.0910,
        "capacity": 180,
        "current_occupancy": 64,
        "is_active": True,
        "features": ["Water Refill Station", "Shower Access", "Air Conditioned Gym", "Elder Care Assistants"]
    },
    {
        "id": "CC-03",
        "name": "Eastlake Civic Community Shelter",
        "address": "1549 E Jefferson St, Phoenix, AZ",
        "latitude": 33.4470,
        "longitude": -112.0490,
        "capacity": 140,
        "current_occupancy": 122,
        "is_active": True,
        "features": ["Water Refill Station", "Electrolyte Distribution", "Emergency Cots", "Spanish/English Translators"]
    }
]

# Seed Registered Outdoor Worksites
SEED_WORKSITES: List[Dict[str, Any]] = [
    {
        "id": "SITE-101",
        "name": "Metro Light Rail Phase 3 Extension",
        "category": "Construction",
        "latitude": 33.4490,
        "longitude": -112.0780,
        "crew_size": 42,
        "supervisor_name": "Marcus Vance",
        "contact_phone": "+1 (602) 555-0192",
        "active_shift_start": "06:00",
        "active_shift_end": "14:30"
    },
    {
        "id": "SITE-102",
        "name": "I-10 Broadway Curve Asphalt Resurfacing",
        "category": "Roadwork",
        "latitude": 33.4380,
        "longitude": -112.0520,
        "crew_size": 28,
        "supervisor_name": "Elena Rodriguez",
        "contact_phone": "+1 (602) 555-0348",
        "active_shift_start": "05:30",
        "active_shift_end": "13:30"
    },
    {
        "id": "SITE-103",
        "name": "Downtown Urban Sanitation & Recycling Route",
        "category": "Sanitation",
        "latitude": 33.4540,
        "longitude": -112.0680,
        "crew_size": 19,
        "supervisor_name": "David Chen",
        "contact_phone": "+1 (602) 555-0814",
        "active_shift_start": "06:00",
        "active_shift_end": "15:00"
    },
    {
        "id": "SITE-104",
        "name": "West Valley Commercial Distribution Hub",
        "category": "Logistics",
        "latitude": 33.4560,
        "longitude": -112.0980,
        "crew_size": 35,
        "supervisor_name": "Jamal Washington",
        "contact_phone": "+1 (602) 555-0722",
        "active_shift_start": "07:00",
        "active_shift_end": "16:00"
    }
]

# Crop Profiles (Biological & Thermal Specs)
SEED_CROPS: List[Dict[str, Any]] = [
    {
        "id": "CROP-TOMATO",
        "name": "Field Tomato (Solanum lycopersicum)",
        "category": "Vegetable",
        "base_temp_c": 10.0,
        "max_temp_c": 35.0,
        "optimal_temp_range_c": [18.0, 29.0],
        "gdd_to_maturity": 1450.0,
        "critical_heat_threshold_c": 38.0,
        "daily_water_need_mm": 5.8,
        "description": "High sensitivity to flower drop above 35°C; requires low-evaporation drip irrigation during fruit set."
    },
    {
        "id": "CROP-WHEAT",
        "name": "Durum Wheat (Triticum durum)",
        "category": "Cereal",
        "base_temp_c": 4.0,
        "max_temp_c": 32.0,
        "optimal_temp_range_c": [15.0, 24.0],
        "gdd_to_maturity": 1850.0,
        "critical_heat_threshold_c": 34.0,
        "daily_water_need_mm": 4.2,
        "description": "Grain filling stage degrades rapidly when exposed to microclimate temperatures above 34°C."
    },
    {
        "id": "CROP-LEAFY",
        "name": "Romaine Lettuce (Lactuca sativa)",
        "category": "Vegetable",
        "base_temp_c": 4.5,
        "max_temp_c": 28.0,
        "optimal_temp_range_c": [12.0, 22.0],
        "gdd_to_maturity": 750.0,
        "critical_heat_threshold_c": 29.0,
        "daily_water_need_mm": 3.6,
        "description": "Extremely vulnerable to tipburn and premature bolting in urban microclimate heat pockets."
    },
    {
        "id": "CROP-MAIZE",
        "name": "Sweet Corn (Zea mays)",
        "category": "Cereal",
        "base_temp_c": 10.0,
        "max_temp_c": 38.0,
        "optimal_temp_range_c": [20.0, 32.0],
        "gdd_to_maturity": 1300.0,
        "critical_heat_threshold_c": 40.0,
        "daily_water_need_mm": 6.5,
        "description": "High biomass producer; requires critical irrigation timing during silking and pollination."
    },
    {
        "id": "CROP-COTTON",
        "name": "Pima Cotton (Gossypium barbadense)",
        "category": "Fiber",
        "base_temp_c": 15.5,
        "max_temp_c": 42.0,
        "optimal_temp_range_c": [24.0, 35.0],
        "gdd_to_maturity": 2200.0,
        "critical_heat_threshold_c": 43.0,
        "daily_water_need_mm": 7.0,
        "description": "Tolerant to arid heat but requires rigorous microclimate monitoring during boll retention."
    }
]

# Seed Agricultural Plots (Perimeter Agricultural Research & Microclimate Parcels)
SEED_AGRICULTURAL_PLOTS: List[Dict[str, Any]] = [
    {
        "id": "PLOT-AG-01",
        "name": "South Valley Agri-Research Plot A",
        "crop_id": "CROP-TOMATO",
        "crop_name": "Field Tomato",
        "planting_date": "2026-03-01",
        "area_hectares": 12.5,
        "latitude": 33.4250,
        "longitude": -112.0850,
        "soil_type": "Clay Loam",
        "irrigation_system": "Drip"
    },
    {
        "id": "PLOT-AG-02",
        "name": "East Canal Agricultural Station",
        "crop_id": "CROP-MAIZE",
        "crop_name": "Sweet Corn",
        "planting_date": "2026-03-10",
        "area_hectares": 24.0,
        "latitude": 33.4280,
        "longitude": -112.0400,
        "soil_type": "Sandy Loam",
        "irrigation_system": "Center Pivot"
    },
    {
        "id": "PLOT-AG-03",
        "name": "North Horticultural Farm Oasis",
        "crop_id": "CROP-LEAFY",
        "crop_name": "Romaine Lettuce",
        "planting_date": "2026-03-15",
        "area_hectares": 6.8,
        "latitude": 33.4850,
        "longitude": -112.0950,
        "soil_type": "Loam",
        "irrigation_system": "Sprinkler"
    }
]
