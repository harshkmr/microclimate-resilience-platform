import React, { useState, useEffect } from 'react';
import type { 
  HviMapResponse, 
  DemographicWeights, 
  CoolingCenterGap, 
  OutreachPlanResponse,
  CensusTractVulnerability,
  WorksiteStatus,
  SafetyAlert,
  CropProfile,
  AgriculturalPlot,
  AgroMicroclimateResponse,
  ApiKeyStatus 
} from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { MapViewer } from './components/MapViewer';
import { VulnerabilityDashboard } from './components/VulnerabilityDashboard';
import { WorkerSafetyDashboard } from './components/WorkerSafetyDashboard';
import { AgricultureDashboard } from './components/AgricultureDashboard';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'vulnerability' | 'worker-safety' | 'agriculture'>('vulnerability');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('fg_theme') as 'dark' | 'light') || 'dark';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [systemStatus, setSystemStatus] = useState<ApiKeyStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync theme changes with localStorage and document class
  useEffect(() => {
    localStorage.setItem('fg_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  // Module 1 Data: Vulnerability
  const [weights, setWeights] = useState<DemographicWeights>({
    temperature_weight: 0.30,
    elderly_weight: 0.20,
    low_income_weight: 0.20,
    canopy_deficit_weight: 0.15,
    no_ac_weight: 0.15
  });
  const [hviData, setHviData] = useState<HviMapResponse | null>(null);
  const [coolingGaps, setCoolingGaps] = useState<CoolingCenterGap[]>([]);
  const [outreachPlan, setOutreachPlan] = useState<OutreachPlanResponse | null>(null);
  const [selectedTract, setSelectedTract] = useState<CensusTractVulnerability | null>(null);

  // Module 2 Data: Worker Safety
  const [worksiteStatuses, setWorksiteStatuses] = useState<WorksiteStatus[]>([]);
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [selectedWorksite, setSelectedWorksite] = useState<WorksiteStatus | null>(null);

  // Module 3 Data: Agriculture
  const [crops, setCrops] = useState<CropProfile[]>([]);
  const [plots, setPlots] = useState<AgriculturalPlot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<AgriculturalPlot | null>(null);
  const [agroAnalytics, setAgroAnalytics] = useState<AgroMicroclimateResponse | null>(null);

  // Fetch all initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. System Status
      const status = await api.getSystemStatus();
      setSystemStatus(status);

      // 2. Vulnerability Data
      const [hvi, gaps, plan] = await Promise.all([
        api.getHviMap(weights),
        api.getCoolingGaps(),
        api.getOutreachPlan()
      ]);
      setHviData(hvi);
      setCoolingGaps(gaps);
      setOutreachPlan(plan);

      // 3. Worker Safety Data
      const [wsStatuses, activeAlerts] = await Promise.all([
        api.evaluateWorksites(),
        api.getAlerts()
      ]);
      setWorksiteStatuses(wsStatuses);
      setAlerts(activeAlerts);

      // 4. Agriculture Data
      const [cropList, plotList] = await Promise.all([
        api.getCrops(),
        api.getPlots()
      ]);
      setCrops(cropList);
      setPlots(plotList);
      if (plotList.length > 0) {
        const plotAnalytics = await api.getPlotAnalytics(plotList[0].id);
        setAgroAnalytics(plotAnalytics);
        setSelectedPlot(plotList[0]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error connecting to FortyGuard microclimate backend services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Update HVI data when weights change
  const handleWeightsChange = async (newWeights: DemographicWeights) => {
    setWeights(newWeights);
    try {
      const hvi = await api.getHviMap(newWeights);
      setHviData(hvi);
      const plan = await api.getOutreachPlan();
      setOutreachPlan(plan);
    } catch (err) {
      console.error('Failed to recalculate HVI:', err);
    }
  };

  // Update Agro analytics when plot selection changes
  const handleSelectPlot = async (plot: AgriculturalPlot) => {
    setSelectedPlot(plot);
    try {
      const analytics = await api.getPlotAnalytics(plot.id);
      setAgroAnalytics(analytics);
    } catch (err) {
      console.error('Failed to fetch plot analytics:', err);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white ${
      isDark ? 'bg-zinc-950 text-zinc-50' : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      {/* Top Navbar with Theme Switcher */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Error Banner */}
        {error && (
          <div className={`p-4 border rounded-xl flex items-center justify-between text-sm ${
            isDark ? 'bg-zinc-900 border-red-900/60 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadInitialData}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-zinc-700' : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300'
              }`}
            >
              Retry
            </button>
          </div>
        )}

        {/* Global Interactive GIS Map Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-zinc-400' : 'text-zinc-500'
            }`}>
              FortyGuard Microclimate GIS Spatial Layer
            </h2>
            <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Region: <span className="font-medium">Phoenix Metro Urban Heat Basin</span>
            </div>
          </div>
          
          <MapViewer
            tracts={hviData?.tracts || []}
            coolingCenters={hviData?.cooling_centers || []}
            worksiteStatuses={worksiteStatuses}
            agriculturalPlots={plots}
            theme={theme}
            onSelectTract={(t) => setSelectedTract(t)}
            onSelectWorksite={(w) => {
              setSelectedWorksite(w);
              setActiveTab('worker-safety');
            }}
            onSelectPlot={(p) => {
              handleSelectPlot(p);
              setActiveTab('agriculture');
            }}
          />
        </section>

        {/* Active Operational Dashboard Module */}
        {isLoading ? (
          <div className={`p-16 flex flex-col items-center justify-center space-y-3 border rounded-xl ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
            <p className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Synchronizing FortyGuard Microclimate Telemetry...
            </p>
          </div>
        ) : (
          <section className="animate-in fade-in duration-300">
            {activeTab === 'vulnerability' && (
              <VulnerabilityDashboard
                hviData={hviData}
                coolingGaps={coolingGaps}
                outreachPlan={outreachPlan}
                weights={weights}
                onWeightsChange={handleWeightsChange}
                selectedTract={selectedTract}
                onSelectTract={setSelectedTract}
                theme={theme}
              />
            )}

            {activeTab === 'worker-safety' && (
              <WorkerSafetyDashboard
                worksiteStatuses={worksiteStatuses}
                alerts={alerts}
                onRefreshData={loadInitialData}
                selectedWorksite={selectedWorksite}
                onSelectWorksite={setSelectedWorksite}
                theme={theme}
              />
            )}

            {activeTab === 'agriculture' && (
              <AgricultureDashboard
                plots={plots}
                crops={crops}
                analytics={agroAnalytics}
                selectedPlot={selectedPlot}
                onSelectPlot={handleSelectPlot}
                theme={theme}
              />
            )}
          </section>
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors ${
        isDark ? 'bg-zinc-950 border-zinc-800/80 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-500'
      }`}>
        FortyGuard Heat-Resilience & Microclimate Decision Platform &bull; Government & Environment Edition &bull; 
        <span className={`ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>Powered by FortyGuard Microclimate APIs</span>
      </footer>

      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        systemStatus={systemStatus}
        onStatusUpdated={(newStatus) => {
          setSystemStatus(newStatus);
          loadInitialData();
        }}
        theme={theme}
      />

    </div>
  );
};

export default App;
