from typing import Optional, Dict, Any
from pydantic import BaseModel

class ApiKeyStatus(BaseModel):
    is_configured: bool
    mode: str # "live" or "demo"
    masked_key: str
    credits_remaining: Optional[int] = None
    plan_tier: Optional[str] = None
    last_verified_at: Optional[str] = None
    connection_healthy: bool
    status_message: str

class UpdateApiKeyRequest(BaseModel):
    api_key: str
    force_mode: Optional[str] = None # "live" or "demo"
