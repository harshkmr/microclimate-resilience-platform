from typing import List
from fastapi import APIRouter, HTTPException, Body

from app.models.worker_safety import (
    Worksite,
    WorksiteCreate,
    WorksiteStatus,
    SafetyAlert
)
from app.services.worker_safety_service import worker_safety_service

router = APIRouter(prefix="/worker-safety", tags=["Worker Safety"])

@router.get("/sites", response_model=List[Worksite])
async def list_worksites():
    """
    Returns all registered outdoor worksites.
    """
    return worker_safety_service.get_all_worksites()

@router.post("/sites", response_model=Worksite)
async def create_worksite(site_in: WorksiteCreate):
    """
    Registers a new outdoor worksite for microclimate heat monitoring.
    """
    return worker_safety_service.add_worksite(site_in)

@router.get("/evaluate", response_model=List[WorksiteStatus])
async def evaluate_all_worksites():
    """
    Evaluates microclimate thermal metrics, OSHA work-rest cycles, and threshold alerts for all sites.
    """
    return await worker_safety_service.evaluate_all_worksites()

@router.get("/evaluate/{site_id}", response_model=WorksiteStatus)
async def evaluate_single_worksite(site_id: str):
    """
    Evaluates a specific worksite.
    """
    site = worker_safety_service.worksites.get(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Worksite not found")
    return await worker_safety_service.evaluate_worksite(site)

@router.get("/alerts", response_model=List[SafetyAlert])
async def list_alerts():
    """
    Lists recent occupational heat safety alerts.
    """
    return worker_safety_service.get_recent_alerts()

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """
    Acknowledges an active heat stress alert.
    """
    success = worker_safety_service.acknowledge_alert(alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "success", "message": f"Alert {alert_id} acknowledged"}

@router.post("/broadcast-crew-alert")
async def broadcast_crew_alert(payload: dict = Body(...)):
    """
    Simulates manual emergency alert broadcast to outdoor crew radios, SMS, and digital signs.
    """
    site_id = payload.get("site_id")
    site = worker_safety_service.worksites.get(site_id)
    if not site:
        raise HTTPException(status_code=404, detail="Worksite not found")
    
    alert = worker_safety_service.trigger_alert(
        site=site,
        wbgt_c=payload.get("wbgt_c", 32.5),
        heat_index_c=payload.get("heat_index_c", 43.0),
        severity=payload.get("severity", "DANGER"),
        message=payload.get("message", f"URGENT: Mandatory 30-minute shaded rest break initiated for {site.name}")
    )
    return {"status": "broadcast_sent", "alert": alert}
