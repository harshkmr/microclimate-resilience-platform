import pytest
import sys
import os
from fastapi.testclient import TestClient

# Ensure backend folder is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.clients.mock_data_generator import MockDataGenerator
from app.clients.fortyguard_client import fortyguard_client
from app.services.vulnerability_service import vulnerability_service
from app.services.worker_safety_service import worker_safety_service
from app.services.agriculture_service import agriculture_service
from app.models.vulnerability import DemographicWeights

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert len(data["modules"]) == 3

def test_mock_data_generator():
    env = MockDataGenerator.generate_env_params(33.4484, -112.0740)
    assert "temperature_celsius" in env
    assert "heat_index_celsius" in env
    assert "wbgt_celsius" in env
    assert env["wbgt_celsius"] > 0

    heatmap = MockDataGenerator.generate_heatmap_geojson()
    assert heatmap["type"] == "FeatureCollection"
    assert len(heatmap["features"]) == 25
    assert "surface_temp_c" in heatmap["features"][0]["properties"]

def test_vulnerability_service():
    weights = DemographicWeights(
        temperature_weight=0.30,
        elderly_weight=0.20,
        low_income_weight=0.20,
        canopy_deficit_weight=0.15,
        no_ac_weight=0.15
    )
    # Test API endpoint
    response = client.post("/api/vulnerability/hvi-map", json=weights.model_dump())
    assert response.status_code == 200
    data = response.json()
    assert len(data["tracts"]) > 0
    for tract in data["tracts"]:
        assert 0.0 <= tract["hvi_score"] <= 100.0
        assert tract["risk_level"] in ("Low", "Moderate", "High", "Extreme")
    assert len(data["cooling_centers"]) > 0

def test_cooling_gaps_and_outreach():
    gaps_res = client.get("/api/vulnerability/cooling-gaps")
    assert gaps_res.status_code == 200
    gaps = gaps_res.json()
    assert len(gaps) > 0
    assert any(g["is_underserved"] for g in gaps)

    outreach_res = client.get("/api/vulnerability/outreach-plan")
    assert outreach_res.status_code == 200
    plan = outreach_res.json()
    assert len(plan["priority_dispatch_queue"]) > 0
    assert plan["total_population_at_risk"] > 0

def test_worker_safety_service():
    # Evaluate all worksites
    res = client.get("/api/worker-safety/evaluate")
    assert res.status_code == 200
    sites = res.json()
    assert len(sites) >= 4
    for s in sites:
        assert s["metrics"]["wbgt_c"] > 0
        assert s["advisory"]["work_minutes_per_hour"] + s["advisory"]["rest_minutes_per_hour"] == 60
        assert s["advisory"]["recommended_water_liters_per_hour"] > 0

    # Test alert trigger and acknowledge
    site_id = sites[0]["site"]["id"]
    broadcast_res = client.post("/api/worker-safety/broadcast-crew-alert", json={
        "site_id": site_id,
        "wbgt_c": 33.5,
        "heat_index_c": 44.0,
        "severity": "DANGER",
        "message": "Mandatory 30m shade rest cycle"
    })
    assert broadcast_res.status_code == 200
    alert_id = broadcast_res.json()["alert"]["alert_id"]

    ack_res = client.post(f"/api/worker-safety/alerts/{alert_id}/acknowledge")
    assert ack_res.status_code == 200

def test_agriculture_service():
    # List crops
    crops_res = client.get("/api/agriculture/crops")
    assert crops_res.status_code == 200
    crops = crops_res.json()
    assert len(crops) >= 5

    # List plots
    plots_res = client.get("/api/agriculture/plots")
    assert plots_res.status_code == 200
    plots = plots_res.json()
    assert len(plots) >= 3

    # Plot analytics
    plot_id = plots[0]["id"]
    analytics_res = client.get(f"/api/agriculture/plots/{plot_id}/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert len(analytics["optimal_irrigation_windows"]) == 24
    assert len(analytics["gdd_forecast"]) > 0
    assert analytics["recommended_irrigation_volume_liters"] > 0

def test_system_status():
    status_res = client.get("/api/system/status")
    assert status_res.status_code == 200
    status = status_res.json()
    assert "mode" in status
    assert status["connection_healthy"] is True

    # Test runtime config update
    update_res = client.post("/api/system/config", json={
        "api_key": "fg_test_sandbox_key_99812",
        "force_mode": "demo"
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["is_configured"] is True
