# 01 — Core Data, FortyGuard Client & Demo Simulator

**What to build:** An asynchronous FortyGuard client wrapper supporting both live API authentication and realistic multi-zone demo data generation (thermal heatmaps, environmental parameters, and heat intelligence) for offline demonstration and testing.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Implement `FortyGuardClient` with `api-key` header authentication and asynchronous polling for `/v1/status/{activity_id}`.
- [ ] Implement `MockDataGenerator` capable of synthesizing high-resolution thermal GeoJSON grids, hourly environmental parameters (WBGT, solar irradiance, AQI), and multi-dimensional heat reports.
- [ ] Provide seed datasets for municipal census tracts, vulnerable demographics, registered cooling centers, outdoor worksites, and agricultural plots.
- [ ] Unit tests for client polling, header formatting, and simulator data fidelity.
