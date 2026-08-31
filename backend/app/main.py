import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.routes_vulnerability import router as vuln_router
from app.api.routes_worker_safety import router as worker_router
from app.api.routes_agriculture import router as agri_router
from app.api.routes_system import router as sys_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title="FortyGuard Heat-Resilience & Microclimate Decision Platform",
    description="Government & Environmental microclimate intelligence platform powered by FortyGuard API",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Health Check Endpoint
@app.get("/api/health")
def api_health():
    return {
        "status": "online",
        "service": "FortyGuard Heat-Resilience Decision Support API",
        "version": "1.0.0",
        "modules": [
            "Heat Vulnerability & Cooling Shelter Optimizer",
            "Outdoor Worker Safety & OSHA Alert Service",
            "Agricultural Microclimate & Smart Irrigation Advisor"
        ],
        "docs_url": "/docs"
    }

# Mount API Routers
app.include_router(vuln_router, prefix="/api")
app.include_router(worker_router, prefix="/api")
app.include_router(agri_router, prefix="/api")
app.include_router(sys_router, prefix="/api")

# Serve built frontend production assets if present
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))

if os.path.exists(frontend_dist):
    assets_path = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Ignore API and docs routes
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root_fallback():
        return api_health()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
