import asyncio
import logging
from typing import Dict, Any, Optional, List
import httpx
from cachetools import TTLCache

from app.config import settings
from app.clients.mock_data_generator import MockDataGenerator

logger = logging.getLogger("fortyguard_client")

class FortyGuardClient:
    """
    Client for interacting with FortyGuard Enterprise REST API v1.
    Handles authentication via `api-key` header, asynchronous polling of tasks,
    caching, and transparent fallback to demo simulation.
    """

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key if api_key is not None else settings.FORTYGUARD_API_KEY
        self.base_url = (base_url or settings.FORTYGUARD_BASE_URL).rstrip("/")
        self.cache = TTLCache(maxsize=200, ttl=settings.CACHE_TTL_SECONDS)
        self.force_demo = settings.DEMO_MODE or not bool(self.api_key.strip())

    def update_credentials(self, api_key: str, force_mode: Optional[str] = None):
        self.api_key = api_key.strip()
        if force_mode == "demo":
            self.force_demo = True
        elif force_mode == "live":
            self.force_demo = False
        else:
            self.force_demo = not bool(self.api_key)

    @property
    def headers(self) -> Dict[str, str]:
        return {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

    async def _poll_activity(self, client: httpx.AsyncClient, activity_id: str) -> Dict[str, Any]:
        """
        Polls GET /v1/status/{activity_id} until completion or timeout.
        """
        status_url = f"{self.base_url}/status/{activity_id}"
        for _ in range(settings.POLL_MAX_RETRIES):
            res = await client.get(status_url, headers=self.headers, timeout=10.0)
            if res.status_code == 200:
                data = res.json()
                status = data.get("status", "").lower()
                if status in ("completed", "success"):
                    return data.get("result", data)
                elif status in ("failed", "error"):
                    raise RuntimeError(f"FortyGuard task {activity_id} failed: {data.get('error', 'Unknown error')}")
            await asyncio.sleep(settings.POLL_INTERVAL_SECONDS)
        
        raise TimeoutError(f"Polling timed out for activity {activity_id}")

    async def get_heatmap(self, polygon_aoi: Optional[Dict[str, Any]] = None, granularity: int = 100) -> Dict[str, Any]:
        cache_key = f"heatmap_{granularity}_{str(polygon_aoi)[:50]}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        if self.force_demo or not self.api_key:
            data = MockDataGenerator.generate_heatmap_geojson(polygon_aoi)
            self.cache[cache_key] = data
            return data

        payload = {
            "polygon_aoi": polygon_aoi or {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [-112.110, 33.430],
                            [-112.040, 33.430],
                            [-112.040, 33.485],
                            [-112.110, 33.485],
                            [-112.110, 33.430]
                        ]]
                    }
                }]
            },
            "granularity": granularity
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{self.base_url}/heatmap", headers=self.headers, json=payload)
                if res.status_code in (200, 202):
                    resp_json = res.json()
                    activity_id = resp_json.get("activity_id")
                    if activity_id:
                        result = await self._poll_activity(client, activity_id)
                    else:
                        result = resp_json
                    self.cache[cache_key] = result
                    return result
                else:
                    logger.warning(f"FortyGuard heatmap API returned {res.status_code}: {res.text}. Falling back to demo data.")
                    return MockDataGenerator.generate_heatmap_geojson(polygon_aoi)
        except Exception as e:
            logger.error(f"Error requesting FortyGuard heatmap: {e}. Falling back to simulator.")
            return MockDataGenerator.generate_heatmap_geojson(polygon_aoi)

    async def get_env_params(self, latitude: float, longitude: float, parameters: Optional[List[str]] = None) -> Dict[str, Any]:
        cache_key = f"env_{round(latitude, 4)}_{round(longitude, 4)}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        if self.force_demo or not self.api_key:
            data = MockDataGenerator.generate_env_params(latitude, longitude)
            self.cache[cache_key] = data
            return data

        payload: Dict[str, Any] = {
            "latitude": latitude,
            "longitude": longitude
        }
        if parameters:
            payload["parameters"] = parameters

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{self.base_url}/env_params", headers=self.headers, json=payload)
                if res.status_code in (200, 202):
                    resp_json = res.json()
                    activity_id = resp_json.get("activity_id")
                    if activity_id:
                        result = await self._poll_activity(client, activity_id)
                    else:
                        result = resp_json
                    self.cache[cache_key] = result
                    return result
                else:
                    logger.warning(f"FortyGuard env_params returned {res.status_code}. Fallback to mock.")
                    return MockDataGenerator.generate_env_params(latitude, longitude)
        except Exception as e:
            logger.error(f"Error fetching env_params: {e}. Fallback to mock.")
            return MockDataGenerator.generate_env_params(latitude, longitude)

    async def get_heat_intelligence(self, latitude: float, longitude: float, temperature: float = 40.0) -> Dict[str, Any]:
        cache_key = f"intel_{round(latitude, 4)}_{round(longitude, 4)}"
        if cache_key in self.cache:
            return self.cache[cache_key]

        if self.force_demo or not self.api_key:
            data = MockDataGenerator.generate_heat_intelligence(latitude, longitude, temperature)
            self.cache[cache_key] = data
            return data

        payload = {
            "latitude": latitude,
            "longitude": longitude,
            "temperature": temperature,
            "analysis": ["geographic", "environmental", "urban", "anthropogenic"]
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(f"{self.base_url}/heat_intelligence", headers=self.headers, json=payload)
                if res.status_code in (200, 202):
                    resp_json = res.json()
                    activity_id = resp_json.get("activity_id")
                    if activity_id:
                        result = await self._poll_activity(client, activity_id)
                    else:
                        result = resp_json
                    self.cache[cache_key] = result
                    return result
                else:
                    return MockDataGenerator.generate_heat_intelligence(latitude, longitude, temperature)
        except Exception as e:
            logger.error(f"Error fetching heat intelligence: {e}")
            return MockDataGenerator.generate_heat_intelligence(latitude, longitude, temperature)

    async def check_api_key_usage(self) -> Dict[str, Any]:
        if self.force_demo or not self.api_key:
            return MockDataGenerator.generate_api_key_usage()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.base_url}/system/fetch-api-key-usage", headers=self.headers)
                if res.status_code == 200:
                    return res.json()
                elif res.status_code == 401:
                    return {
                        "status": "Unauthorized",
                        "error": "Invalid API key provided",
                        "credits_remaining": 0
                    }
                else:
                    return MockDataGenerator.generate_api_key_usage()
        except Exception as e:
            logger.error(f"Error checking API key usage: {e}")
            return MockDataGenerator.generate_api_key_usage()

fortyguard_client = FortyGuardClient()
