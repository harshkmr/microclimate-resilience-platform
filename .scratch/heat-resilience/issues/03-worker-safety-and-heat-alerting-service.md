# 03 — Outdoor Worker Heat-Safety & Alerting Service

**What to build:** A comprehensive occupational heat-safety monitoring engine that ingests microclimate thermal data (`/v1/env_params`), evaluates OSHA and NIOSH heat thresholds (WBGT & Heat Index), prescribes dynamic work-rest and hydration schedules, and logs crew broadcast alerts.

**Blocked by:** 01 — Core Data, FortyGuard Client & Demo Simulator

**Status:** ready-for-agent

- [ ] Implement OSHA/NIOSH threshold categorization (`Low`, `Moderate`, `High`, `Extreme / Danger`).
- [ ] Implement dynamic Work/Rest cycle scheduler (e.g. 45m work / 15m rest) and mandatory hydration intake calculator (quarts/hr).
- [ ] Implement Worksite Registry CRUD and real-time status evaluation endpoint.
- [ ] Implement Alert Dispatcher logging simulated SMS/Webhook crew warnings.
- [ ] Deliver REST endpoints `/api/worker-safety/sites`, `/api/worker-safety/alerts`, and `/api/worker-safety/evaluate`.
- [ ] Automated tests for boundary safety category classification and work-rest allocations.
