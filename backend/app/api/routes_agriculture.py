from typing import List
from fastapi import APIRouter, HTTPException

from app.models.agriculture import (
    CropProfile,
    AgriculturalPlot,
    AgroMicroclimateResponse
)
from app.services.agriculture_service import agriculture_service

router = APIRouter(prefix="/agriculture", tags=["Agricultural Microclimate"])

@router.get("/crops", response_model=List[CropProfile])
async def list_crops():
    """
    Returns supported crop physiological profiles and thermal thresholds.
    """
    return agriculture_service.get_crops()

@router.get("/plots", response_model=List[AgriculturalPlot])
async def list_plots():
    """
    Returns registered agricultural parcels.
    """
    return agriculture_service.get_plots()

@router.get("/plots/{plot_id}/analytics", response_model=AgroMicroclimateResponse)
async def get_plot_analytics(plot_id: str):
    """
    Computes 30-day GDD phenology curve, projected harvest dates, and 24-hour irrigation window rankings.
    """
    if plot_id not in agriculture_service.plots:
        raise HTTPException(status_code=404, detail="Plot not found")
    return await agriculture_service.get_plot_analytics(plot_id)
