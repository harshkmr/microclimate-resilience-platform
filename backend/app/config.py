import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    FORTYGUARD_API_KEY: str = os.getenv("FORTYGUARD_API_KEY", "")
    FORTYGUARD_BASE_URL: str = os.getenv("FORTYGUARD_BASE_URL", "https://api.fortyguard.com/v1")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    POLL_INTERVAL_SECONDS: float = 1.0
    POLL_MAX_RETRIES: int = 15
    CACHE_TTL_SECONDS: int = 300

settings = Settings()
