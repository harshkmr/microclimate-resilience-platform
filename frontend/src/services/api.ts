import type {
  HviMapResponse,
  DemographicWeights,
  CoolingCenterGap,
  OutreachPlanResponse,
  Worksite,
  WorksiteStatus,
  SafetyAlert,
  CropProfile,
  AgriculturalPlot,
  AgroMicroclimateResponse,
  ApiKeyStatus
} from '../types';

const API_BASE = '/api';

export const api = {
  // Vulnerability
  async getHviMap(weights?: DemographicWeights): Promise<HviMapResponse> {
    const res = await fetch(`${API_BASE}/vulnerability/hvi-map`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(weights || {})
    });
    if (!res.ok) throw new Error('Failed to fetch HVI map');
    return res.json();
  },

  async getCoolingGaps(): Promise<CoolingCenterGap[]> {
    const res = await fetch(`${API_BASE}/vulnerability/cooling-gaps`);
    if (!res.ok) throw new Error('Failed to fetch cooling gaps');
    return res.json();
  },

  async getOutreachPlan(): Promise<OutreachPlanResponse> {
    const res = await fetch(`${API_BASE}/vulnerability/outreach-plan`);
    if (!res.ok) throw new Error('Failed to fetch outreach plan');
    return res.json();
  },

  // Worker Safety
  async getWorksites(): Promise<Worksite[]> {
    const res = await fetch(`${API_BASE}/worker-safety/sites`);
    if (!res.ok) throw new Error('Failed to fetch worksites');
    return res.json();
  },

  async evaluateWorksites(): Promise<WorksiteStatus[]> {
    const res = await fetch(`${API_BASE}/worker-safety/evaluate`);
    if (!res.ok) throw new Error('Failed to evaluate worksites');
    return res.json();
  },

  async getAlerts(): Promise<SafetyAlert[]> {
    const res = await fetch(`${API_BASE}/worker-safety/alerts`);
    if (!res.ok) throw new Error('Failed to fetch safety alerts');
    return res.json();
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/worker-safety/alerts/${alertId}/acknowledge`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
  },

  async broadcastCrewAlert(siteId: string, message: string, severity = 'DANGER'): Promise<any> {
    const res = await fetch(`${API_BASE}/worker-safety/broadcast-crew-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, message, severity })
    });
    if (!res.ok) throw new Error('Failed to broadcast alert');
    return res.json();
  },

  // Agriculture
  async getCrops(): Promise<CropProfile[]> {
    const res = await fetch(`${API_BASE}/agriculture/crops`);
    if (!res.ok) throw new Error('Failed to fetch crops');
    return res.json();
  },

  async getPlots(): Promise<AgriculturalPlot[]> {
    const res = await fetch(`${API_BASE}/agriculture/plots`);
    if (!res.ok) throw new Error('Failed to fetch plots');
    return res.json();
  },

  async getPlotAnalytics(plotId: string): Promise<AgroMicroclimateResponse> {
    const res = await fetch(`${API_BASE}/agriculture/plots/${plotId}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch plot analytics');
    return res.json();
  },

  // System & API Key
  async getSystemStatus(): Promise<ApiKeyStatus> {
    const res = await fetch(`${API_BASE}/system/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async updateSystemConfig(apiKey: string, forceMode?: string): Promise<ApiKeyStatus> {
    const res = await fetch(`${API_BASE}/system/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, force_mode: forceMode })
    });
    if (!res.ok) throw new Error('Failed to update config');
    return res.json();
  }
};
