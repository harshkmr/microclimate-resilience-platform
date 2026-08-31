# FortyGuard Heat-Resilience & Microclimate Decision Support Platform
> **Government & Environmental Intelligence Powered by FortyGuard APIs**

A data-driven decision support system designed for municipal governments, occupational safety managers, and agricultural operators to mitigate extreme heat risks using high-resolution thermal microclimate data.

---

## 🌟 Key Features & Modules

### 1. Heat Vulnerability & Cooling Shelter Relief (Public Health & Governance)
* **Composite Heat Vulnerability Index (HVI):** Combines FortyGuard microclimate surface temperatures with demographic vulnerability indicators (seniors >65, low-income census tracts, tree canopy deficits, and lack of air conditioning).
* **Cooling Shelter Gap Analysis:** Detects geographic "heat blindspots" where extreme thermal stress coincides with high demographic risk and transit distance > 1.5 km to active municipal cooling centers.
* **Prioritized Outreach Dispatch:** Computes ranked door-to-door wellness check queues and mobile cooling bus routing with instant CSV export.

### 2. Outdoor Worker Heat-Safety & Alerting Service (Occupational Health)
* **Real-time & Forecast Worksite Monitoring:** Ingests FortyGuard environmental parameters (`/v1/env_params`) including Wet-Bulb Globe Temperature (WBGT), Heat Index, and solar irradiance across registered construction, roadwork, sanitation, and logistics worksites.
* **NIOSH & OSHA Heat Stress Standards:** Categorizes sites into *Low*, *Moderate*, *High*, and *Extreme / Danger* risk tiers.
* **Dynamic Work-Rest & Hydration Intervals:** Prescribes exact hourly work/rest intervals (e.g. 30m work / 30m shade rest) and water intake quotas (L/hr).
* **Interactive Interval Timer & Siren Dispatch:** Features a live work-rest countdown clock and one-click emergency broadcast to crew SMS and digital signs.

### 3. Agricultural Microclimate & Smart Irrigation Advisor (AgTech & Climate Adaptation)
* **Crop Phenology & Growing Degree Days (GDD):** Models thermal unit accumulation for crops (Tomatoes, Wheat, Romaine Lettuce, Maize, Cotton) to forecast harvest maturity.
* **Reference Evapotranspiration ($ET_0$) Modeling:** Calculates hourly crop water loss using solar radiation, humidity, and temperature.
* **Optimal Low-Loss Irrigation Windows:** Pinpoints 24-hour low-evaporation irrigation schedules (dawn and nocturnal windows) to prevent thermal crop shock and conserve water.

---

## 🎨 Visual Theme & Design Standards
* **Aesthetic:** Minimal, modern, high-contrast dashboard inspired by Linear and Vercel.
* **Palette:** Zinc-950 background (`#09090B`), Zinc-900 surface (`#18181B`), Zinc-800 border (`#27272A`), Zinc-50 primary text (`#FAFAFA`), and Zinc-400 muted text (`#A1A1AA`).
* **Typography:** Inter with tight headings, 16px body, 14px small text, and JetBrains Mono for telemetry figures.

---

## 🔑 FortyGuard API Key & Dual-Mode Execution

The system supports **seamless dual-mode operation**:
* **Demo Simulator Mode (Default):** Runs immediately with realistic physical microclimate simulations across all three modules—no API key required.
* **Live FortyGuard API Mode:** Connects to `https://api.fortyguard.com/v1/` using your FortyGuard API key (`api-key` header) for `/v1/heatmap`, `/v1/heat_intelligence`, `/v1/env_params`, and `/v1/system/fetch-api-key-usage`.

You can configure the key either via environment variable (`FORTYGUARD_API_KEY`) or directly through the in-app **API Settings Modal**.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API (FastAPI)
```bash
# In project root
python -m pip install -r backend/requirements.txt
python backend/run.py
```
* **API Endpoints:** `http://127.0.0.1:8000`
* **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

### 2. Start the Frontend (Vite + React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```
* **Web UI Dashboard:** `http://localhost:5173`

---

## 🧪 Running Automated Tests

```bash
# Run pytest backend test suite
pytest backend/tests/
```
All 7 unit and integration test suites cover client authentication, mock fallback, HVI normalization bounds, OSHA worker safety classifications, and GDD/ET0 calculations.

---

## 📁 Project Structure

```
FORTYGUARD/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & CORS
│   │   ├── config.py                   # Environment settings & API keys
│   │   ├── models/                     # Pydantic data schemas
│   │   │   ├── vulnerability.py
│   │   │   ├── worker_safety.py
│   │   │   ├── agriculture.py
│   │   │   └── system.py
│   │   ├── clients/
│   │   │   ├── fortyguard_client.py    # Async FortyGuard client with polling & cache
│   │   │   └── mock_data_generator.py  # Realistic microclimate spatial generator
│   │   ├── services/                   # Business logic engines
│   │   │   ├── vulnerability_service.py
│   │   │   ├── worker_safety_service.py
│   │   │   └── agriculture_service.py
│   │   ├── data/
│   │   │   └── seed_data.py            # GeoJSON tracts, cooling shelters, worksites
│   │   └── api/                        # REST route controllers
│   ├── tests/
│   │   └── test_all_services.py        # Pytest test suite
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── MapViewer.tsx           # Interactive Leaflet GIS map
│   │   │   ├── VulnerabilityDashboard.tsx
│   │   │   ├── WorkerSafetyDashboard.tsx
│   │   │   ├── AgricultureDashboard.tsx
│   │   │   └── ApiKeyModal.tsx         # Live/Demo API key settings
│   │   ├── services/
│   │   │   └── api.ts                  # Backend API client
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interface definitions
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                   # Inter font & Zinc dark theme
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── SPEC.md                             # Formal system specification
└── README.md
```
