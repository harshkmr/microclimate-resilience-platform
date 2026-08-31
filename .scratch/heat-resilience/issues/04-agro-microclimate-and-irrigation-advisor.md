# 04 — Agricultural Microclimate & Smart Irrigation Advisor

**What to build:** An agro-thermal decision service that models crop-specific thermal accumulation (Growing Degree Days - GDD), calculates hourly reference evapotranspiration (ET0), predicts thermal stress risk, and schedules low-evaporation irrigation windows.

**Blocked by:** 01 — Core Data, FortyGuard Client & Demo Simulator

**Status:** ready-for-agent

- [ ] Implement Crop Phenology and GDD calculator with base temperatures for multiple crop types (e.g. Tomatoes, Wheat, Leafy Greens, Maize, Cotton).
- [ ] Implement Hargreaves / Penman-Monteith reference evapotranspiration (ET0) calculator using solar irradiance and diurnal temperatures.
- [ ] Implement Smart Irrigation Scheduler ranking 24-hour windows by water efficiency score.
- [ ] Deliver REST endpoints `/api/agriculture/crops`, `/api/agriculture/gdd-forecast`, and `/api/agriculture/irrigation-schedule`.
- [ ] Automated tests for GDD accumulation and irrigation efficiency rankings.
