# Specification: FortyGuard Heat-Resilience & Microclimate Decision Platform

## Problem Statement

Extreme heat disproportionately impacts vulnerable urban populations, puts outdoor workers in life-threatening conditions, and degrades agricultural crop productivity. Municipalities, safety managers, and agricultural operators often lack localized microclimate thermal intelligence and real-time decision-support tools to:
1. Direct cooling shelters and civic outreach specifically to census tracts with high heat vulnerability.
2. Monitor real-time heat indices and wet-bulb globe temperatures (WBGT) across worksites to enforce OSHA/NIOSH rest and hydration cycles.
3. Optimize crop planting dates and microclimate-specific low-evapotranspiration irrigation schedules to prevent thermal crop damage and water waste.

## Solution

A full-stack, modular web platform that integrates FortyGuard's thermal microclimate intelligence (`/v1/heatmap`, `/v1/heat_intelligence`, `/v1/env_params`) alongside demographic vulnerability data, occupational safety models, and agro-thermal algorithms. The platform features an interactive GIS dashboard with three specialized operational modules and a robust dual-mode (Live FortyGuard API + Realistic Demo Simulator) execution engine.

## User Stories

1. As a municipal public health official, I want to view a Heat Vulnerability Index (HVI) map combining microclimate surface temperature with demographic risk factors (elderly, low income, tree canopy deficit, lack of AC), so that I can prioritize emergency cooling center activations and outreach routes.
2. As a civic planner, I want to identify geographic cooling shelter "blindspots" where high heat vulnerability coincides with long transit distances, so that I can deploy mobile cooling buses and hydration stations.
3. As a public safety coordinator, I want to export prioritized outreach dispatch lists by neighborhood risk tier, so that community health workers can conduct door-to-door wellness checks.
4. As a construction site safety manager, I want to monitor real-time microclimate Heat Index and Wet-Bulb Globe Temperature (WBGT) for all active outdoor worksites, so that I can prevent heat stroke and occupational illnesses.
5. As an occupational health officer, I want automated threshold alerts when a worksite crosses OSHA/NIOSH risk categories (Caution, Extreme Caution, Danger, Extreme Danger), so that work-rest cycles (e.g., 45m work / 15m shade rest) and hydration mandates are triggered automatically.
6. As a site foreman, I want an interactive work-rest timer and crew alert broadcast system, so that outdoor workers receive instant notifications to take mandatory shade breaks.
7. As an agricultural planner, I want to analyze microclimate thermal trends and Growing Degree Days (GDD) for specific crops (e.g. Tomatoes, Wheat, Leafy Greens, Maize), so that I can determine the optimal planting window.
8. As a farm irrigation manager, I want an hourly reference evapotranspiration (ET0) advisor that highlights optimal nocturnal and early-morning irrigation windows, so that I minimize water evaporation losses and prevent plant heat stress.
9. As an agronomist, I want to view historical microclimate heat stress risk levels across different cultivation plots, so that I can choose heat-resilient cultivars.
10. As a system administrator, I want to toggle between Demo Simulator Mode and Live FortyGuard API Mode, and inspect API credit usage, so that the team can demonstrate functionality immediately and connect live API keys seamlessly.

## Implementation Decisions

1. **Backend Layer:**
   - **Framework:** Python FastAPI with async HTTP client (`httpx`), Pydantic v2 schemas, and spatial data handlers.
   - **FortyGuard Integration Client:** Asynchronous wrapper supporting API key authentication (`api-key` header), async task polling (`/v1/status/{activity_id}`), and intelligent response caching to conserve API credits.
   - **Demo Simulator Engine:** Pre-generated realistic multi-zone thermal grids (GeoJSON polygons for neighborhoods, worksites, and farm plots) and parametric microclimate generators for instant offline/demo capability.
   - **Vulnerability Engine:** Normalized composite HVI computation:
     $$HVI = w_1 \cdot T_{micro} + w_2 \cdot D_{age} + w_3 \cdot D_{income} + w_4 \cdot D_{canopy} + w_5 \cdot D_{ac}$$
   - **Worker Safety Engine:** WBGT and Heat Index calculation with NIOSH/OSHA work-rest scheduling tables and simulated SMS/webhook alert logs.
   - **Agricultural Engine:** GDD accumulation ($GDD = \max(0, \frac{T_{max} + T_{min}}{2} - T_{base})$) and Hargreaves/Penman-Monteith ET0 estimation with hourly irrigation efficiency scoring.

2. **Frontend Layer:**
   - **Framework:** React 18 with Vite, TypeScript, and Tailwind CSS.
   - **Mapping & GIS:** Leaflet / React-Leaflet with custom interactive GeoJSON thermal heat layers, demographic choropleths, cooling shelter markers, worksite pins, and farm boundary overlays.
   - **Data Visualization:** Recharts for GDD accumulation curves, hourly ET0 vs irrigation windows, and diurnal heat trend charts.
   - **UI & Controls:** Tabbed dashboard for the 3 operational modules, live demo mode banner, interactive AOI selector, work-rest timer modal, and API settings modal.

3. **Data & Storage:**
   - Static GeoJSON data store for benchmark metropolitan and rural agricultural zones.
   - In-memory alert and worksite registry with JSON persistence.

## Testing Decisions

- **Unit & Property Tests (Pytest):**
  - Verify FortyGuard client authentication header formatting, status polling mock loops, and graceful fallback.
  - Verify HVI computation normalization (outputs strictly in $[0, 100]$ range) and weight distribution.
  - Verify OSHA threshold classification boundary tests (Low, Moderate, High, Extreme) and work-rest allocations.
  - Verify GDD calculation against known agricultural temperature series.
- **Frontend & Integration Tests:**
  - Fast end-to-end API verification of all endpoints via FastAPI TestClient.
  - Production build verification of Vite frontend.

## Out of Scope

- Hardware sensor telemetry streaming (using FortyGuard API as the single source of truth for microclimates).
- Real SMS carrier billing (simulated webhook/push logs provided with standard payload format).

## Further Notes

- System starts out of the box in Demo Mode without requiring any external keys.
- Inputting a valid FortyGuard API key seamlessly switches the pipeline to live API queries.
