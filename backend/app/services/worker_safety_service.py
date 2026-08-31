import datetime
import uuid
from typing import List, Dict, Any, Optional

from app.models.worker_safety import (
    Worksite,
    WorksiteCreate,
    EnvironmentalMetrics,
    WorkRestRecommendation,
    WorksiteStatus,
    SafetyAlert
)
from app.data.seed_data import SEED_WORKSITES
from app.clients.fortyguard_client import fortyguard_client

class WorkerSafetyService:
    def __init__(self):
        self.worksites: Dict[str, Worksite] = {
            s["id"]: Worksite(**s) for s in SEED_WORKSITES
        }
        self.alerts: List[SafetyAlert] = [
            SafetyAlert(
                alert_id="ALT-INIT-01",
                site_id="SITE-101",
                site_name="Metro Light Rail Phase 3 Extension",
                timestamp=datetime.datetime.now().isoformat(),
                severity="WARNING",
                wbgt_c=31.4,
                heat_index_c=42.8,
                message="Heat threshold exceeded: Implement mandatory 30-minute shade rest cycles.",
                acknowledged=False,
                dispatched_channels=["SMS", "Push", "Site Siren"]
            )
        ]

    def get_all_worksites(self) -> List[Worksite]:
        return list(self.worksites.values())

    def add_worksite(self, site_in: WorksiteCreate) -> Worksite:
        new_id = f"SITE-{len(self.worksites) + 101}"
        site = Worksite(
            id=new_id,
            name=site_in.name,
            category=site_in.category,
            latitude=site_in.latitude,
            longitude=site_in.longitude,
            crew_size=site_in.crew_size,
            supervisor_name=site_in.supervisor_name,
            contact_phone=site_in.contact_phone,
            active_shift_start=site_in.active_shift_start,
            active_shift_end=site_in.active_shift_end
        )
        self.worksites[new_id] = site
        return site

    def calculate_work_rest_advisory(self, wbgt_c: float, heat_index_c: float) -> WorkRestRecommendation:
        """
        Calculates OSHA & NIOSH compliant occupational heat safety guidance.
        """
        if wbgt_c >= 32.2 or heat_index_c >= 45.0:
            return WorkRestRecommendation(
                risk_level="Extreme",
                color_code="#EF4444",
                work_minutes_per_hour=15,
                rest_minutes_per_hour=45,
                recommended_water_liters_per_hour=1.2,
                ppe_guidance="MANDATORY cooling vests, shade canopy with active misting, frequent buddy checks.",
                stop_work_mandatory=True,
                summary_advisory="EXTREME HEAT DANGER: Halt non-essential heavy labor. Enforce 45 min recovery per hour."
            )
        elif wbgt_c >= 30.0 or heat_index_c >= 40.0:
            return WorkRestRecommendation(
                risk_level="High",
                color_code="#F97316",
                work_minutes_per_hour=30,
                rest_minutes_per_hour=30,
                recommended_water_liters_per_hour=1.0,
                ppe_guidance="Wear lightweight breathable UV clothing, neck shades, rotate heavy physical tasks.",
                stop_work_mandatory=False,
                summary_advisory="HIGH HEAT RISK: Enforce 30 min work / 30 min shade rest cycle. Drink 1 quart of water/hour."
            )
        elif wbgt_c >= 26.0 or heat_index_c >= 33.0:
            return WorkRestRecommendation(
                risk_level="Moderate",
                color_code="#F59E0B",
                work_minutes_per_hour=45,
                rest_minutes_per_hour=15,
                recommended_water_liters_per_hour=0.75,
                ppe_guidance="Standard sun protection, wide-brim hard hat shade, scheduled water breaks.",
                stop_work_mandatory=False,
                summary_advisory="MODERATE HEAT STRESS: Enforce 45 min work / 15 min rest cycle. Hydrate every 20 minutes."
            )
        else:
            return WorkRestRecommendation(
                risk_level="Low",
                color_code="#10B981",
                work_minutes_per_hour=60,
                rest_minutes_per_hour=0,
                recommended_water_liters_per_hour=0.5,
                ppe_guidance="Standard workplace PPE and hydration access.",
                stop_work_mandatory=False,
                summary_advisory="LOW HEAT RISK: Normal work operations with standard hydration access."
            )

    async def evaluate_worksite(self, site: Worksite) -> WorksiteStatus:
        env_data = await fortyguard_client.get_env_params(site.latitude, site.longitude)
        
        temp_c = float(env_data.get("temperature_celsius", 38.5))
        rh = float(env_data.get("relative_humidity", 25.0))
        heat_idx_c = float(env_data.get("heat_index_celsius", 41.2))
        tw_c = float(env_data.get("wet_bulb_temp_celsius", 24.5))
        wbgt_c = float(env_data.get("wbgt_celsius", 30.8))
        solar = float(env_data.get("solar_irradiance_ghi", 650.0))
        aqi = int(env_data.get("air_quality_index", 75))

        metrics = EnvironmentalMetrics(
            temperature_c=temp_c,
            relative_humidity_pct=rh,
            heat_index_c=heat_idx_c,
            wet_bulb_temp_c=tw_c,
            wbgt_c=wbgt_c,
            solar_irradiance_wm2=solar,
            air_quality_idx=aqi
        )

        advisory = self.calculate_work_rest_advisory(wbgt_c, heat_idx_c)
        is_threshold_exceeded = advisory.risk_level in ("High", "Extreme")

        # Auto-create alert if severe and not recently alerted
        if is_threshold_exceeded:
            recent_alerts = [a for a in self.alerts if a.site_id == site.id and not a.acknowledged]
            if not recent_alerts:
                self.trigger_alert(
                    site=site,
                    wbgt_c=wbgt_c,
                    heat_index_c=heat_idx_c,
                    severity="DANGER" if advisory.risk_level == "Extreme" else "WARNING",
                    message=f"Heat threshold exceeded at {site.name}. {advisory.summary_advisory}"
                )

        return WorksiteStatus(
            site=site,
            metrics=metrics,
            advisory=advisory,
            last_evaluated_at=datetime.datetime.now().isoformat(),
            is_threshold_exceeded=is_threshold_exceeded
        )

    async def evaluate_all_worksites(self) -> List[WorksiteStatus]:
        statuses = []
        for site in self.worksites.values():
            status = await self.evaluate_worksite(site)
            statuses.append(status)
        return statuses

    def get_recent_alerts(self) -> List[SafetyAlert]:
        return sorted(self.alerts, key=lambda a: a.timestamp, reverse=True)

    def trigger_alert(self, site: Worksite, wbgt_c: float, heat_index_c: float, severity: str, message: str) -> SafetyAlert:
        alert = SafetyAlert(
            alert_id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
            site_id=site.id,
            site_name=site.name,
            timestamp=datetime.datetime.now().isoformat(),
            severity=severity,
            wbgt_c=wbgt_c,
            heat_index_c=heat_index_c,
            message=message,
            acknowledged=False,
            dispatched_channels=["SMS", "Push", "Supervisor Phone", "Digital Signboard"]
        )
        self.alerts.insert(0, alert)
        return alert

    def acknowledge_alert(self, alert_id: str) -> bool:
        for alert in self.alerts:
            if alert.alert_id == alert_id:
                alert.acknowledged = True
                return True
        return False

worker_safety_service = WorkerSafetyService()
