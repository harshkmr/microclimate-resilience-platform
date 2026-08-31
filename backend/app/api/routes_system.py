import datetime
from fastapi import APIRouter
from app.models.system import ApiKeyStatus, UpdateApiKeyRequest
from app.clients.fortyguard_client import fortyguard_client

router = APIRouter(prefix="/system", tags=["System & API Management"])

@router.get("/status", response_model=ApiKeyStatus)
async def get_system_status():
    """
    Returns the FortyGuard API connection status, current operating mode, and credit balance.
    """
    usage = await fortyguard_client.check_api_key_usage()
    has_key = bool(fortyguard_client.api_key.strip())
    masked = f"{fortyguard_client.api_key[:4]}...{fortyguard_client.api_key[-4:]}" if len(fortyguard_client.api_key) >= 8 else ("Configured" if has_key else "None (Demo Simulator Active)")

    return ApiKeyStatus(
        is_configured=has_key,
        mode="demo" if fortyguard_client.force_demo else "live",
        masked_key=masked,
        credits_remaining=usage.get("credits_remaining"),
        plan_tier=usage.get("plan_name", "Demo Sandbox"),
        last_verified_at=datetime.datetime.now().isoformat(),
        connection_healthy=True,
        status_message="Running in realistic Demo Simulator mode" if fortyguard_client.force_demo else "Connected to live FortyGuard Enterprise API"
    )

@router.post("/config", response_model=ApiKeyStatus)
async def update_system_config(payload: UpdateApiKeyRequest):
    """
    Updates the FortyGuard API key and switches between Live and Demo modes.
    """
    fortyguard_client.update_credentials(payload.api_key, payload.force_mode)
    return await get_system_status()

@router.get("/raw-thermal-geojson")
async def get_raw_thermal_geojson():
    """
    Returns raw FortyGuard GeoJSON thermal polygon features.
    """
    return await fortyguard_client.get_heatmap()
