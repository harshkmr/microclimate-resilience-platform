import React, { useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polygon, 
  Marker, 
  Popup, 
  Tooltip
} from 'react-leaflet';
import L from 'leaflet';
import type { 
  CensusTractVulnerability, 
  CoolingCenter, 
  WorksiteStatus, 
  AgriculturalPlot
} from '../types';
import { 
  Layers, 
  Home, 
  Sprout,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

// Create custom SVG Leaflet DivIcons
const createShelterIcon = () => {
  return L.divIcon({
    className: 'custom-shelter-marker',
    html: `
      <div style="background-color: #3b82f6; border: 2px solid #ffffff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(59,130,246,0.6);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const createWorksiteIcon = (risk: string) => {
  const color = risk === 'Extreme' ? '#ef4444' : risk === 'High' ? '#f97316' : risk === 'Moderate' ? '#eab308' : '#22c55e';
  return L.divIcon({
    className: 'custom-worksite-marker',
    html: `
      <div style="background-color: ${color}; border: 2px solid #ffffff; border-radius: 6px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color};">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/>
          <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
          <path d="M4 15v-3a8 8 0 0 1 16 0v3"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createAgriIcon = () => {
  return L.divIcon({
    className: 'custom-agri-marker',
    html: `
      <div style="background-color: #22c55e; border: 2px solid #ffffff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(34,197,94,0.6);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 20h10"/>
          <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
          <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/>
          <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>
        </svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

interface MapViewerProps {
  tracts: CensusTractVulnerability[];
  coolingCenters: CoolingCenter[];
  worksiteStatuses?: WorksiteStatus[];
  agriculturalPlots?: AgriculturalPlot[];
  theme?: 'dark' | 'light';
  onSelectTract?: (tract: CensusTractVulnerability) => void;
  onSelectWorksite?: (site: WorksiteStatus) => void;
  onSelectPlot?: (plot: AgriculturalPlot) => void;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  tracts,
  coolingCenters,
  worksiteStatuses = [],
  agriculturalPlots = [],
  theme = 'dark',
  onSelectTract,
  onSelectWorksite,
  onSelectPlot
}) => {
  const [showTracts, setShowTracts] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showWorksites, setShowWorksites] = useState(true);
  const [showAgri, setShowAgri] = useState(true);
  const [isMobileLayerMenuOpen, setIsMobileLayerMenuOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const isDark = theme === 'dark';

  const tileUrl = isDark
    ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
    : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';

  const getHviColor = (hvi: number) => {
    if (hvi >= 75) return '#ef4444';
    if (hvi >= 55) return '#f97316';
    if (hvi >= 35) return '#eab308';
    return '#22c55e';
  };

  const activeLayerCount = [showTracts, showShelters, showWorksites, showAgri].filter(Boolean).length;

  return (
    <div className={`relative w-full h-[360px] sm:h-[440px] lg:h-[500px] rounded-xl overflow-hidden border shadow-lg z-0 isolate transition-colors ${
      isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-100'
    }`}>
      
      {/* Mobile Layer Toggle Button (Visible on < md) */}
      <div className="md:hidden absolute top-3 right-3 z-[400]">
        <button
          onClick={() => setIsMobileLayerMenuOpen(!isMobileLayerMenuOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur-md border shadow-lg text-xs font-medium transition-colors ${
            isDark 
              ? 'bg-zinc-900/95 border-zinc-800 text-zinc-100' 
              : 'bg-white/95 border-zinc-200 text-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Layers</span>
          <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-mono">
            {activeLayerCount}
          </span>
          {isMobileLayerMenuOpen ? <ChevronUp className="w-3 h-3 text-zinc-400" /> : <ChevronDown className="w-3 h-3 text-zinc-400" />}
        </button>

        {/* Mobile Expandable Layers Dropdown */}
        {isMobileLayerMenuOpen && (
          <div className={`mt-2 p-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs space-y-2 w-56 animate-in fade-in zoom-in-95 duration-150 ${
            isDark ? 'bg-zinc-900/95 border-zinc-800 text-zinc-300' : 'bg-white/95 border-zinc-200 text-zinc-700'
          }`}>
            <div className={`font-semibold text-[11px] uppercase tracking-wider border-b pb-1.5 ${
              isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'
            }`}>
              Toggle Spatial Layers
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input 
                type="checkbox" 
                checked={showTracts} 
                onChange={(e) => setShowTracts(e.target.checked)} 
                className="rounded border-zinc-500 text-blue-500 focus:ring-0"
              />
              <span className="truncate">HVI Tracts ({tracts.length})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input 
                type="checkbox" 
                checked={showShelters} 
                onChange={(e) => setShowShelters(e.target.checked)} 
                className="rounded border-zinc-500 text-blue-500 focus:ring-0"
              />
              <span className="truncate">Cooling Centers ({coolingCenters.length})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input 
                type="checkbox" 
                checked={showWorksites} 
                onChange={(e) => setShowWorksites(e.target.checked)} 
                className="rounded border-zinc-500 text-blue-500 focus:ring-0"
              />
              <span className="truncate">Worksites ({worksiteStatuses.length})</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer py-0.5">
              <input 
                type="checkbox" 
                checked={showAgri} 
                onChange={(e) => setShowAgri(e.target.checked)} 
                className="rounded border-zinc-500 text-blue-500 focus:ring-0"
              />
              <span className="truncate">Agro Plots ({agriculturalPlots.length})</span>
            </label>
          </div>
        )}
      </div>

      {/* Desktop Map Layer Switcher Control (Visible on md+) */}
      <div className={`hidden md:block absolute top-4 right-4 z-[400] backdrop-blur-md border rounded-xl p-3.5 shadow-xl space-y-2 text-xs transition-colors ${
        isDark ? 'bg-zinc-900/90 border-zinc-800 text-zinc-300' : 'bg-white/90 border-zinc-200 text-zinc-700'
      }`}>
        <div className={`flex items-center gap-1.5 font-medium border-b pb-1.5 ${
          isDark ? 'border-zinc-800 text-zinc-100' : 'border-zinc-200 text-zinc-900'
        }`}>
          <Layers className="w-4 h-4 text-blue-500" />
          <span>GIS Microclimate Layers</span>
        </div>
        
        <label className={`flex items-center gap-2 cursor-pointer hover:text-blue-500 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input 
            type="checkbox" 
            checked={showTracts} 
            onChange={(e) => setShowTracts(e.target.checked)} 
            className="rounded border-zinc-500 text-blue-500 focus:ring-0"
          />
          <span>Heat Vulnerability Tracts</span>
        </label>

        <label className={`flex items-center gap-2 cursor-pointer hover:text-blue-500 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input 
            type="checkbox" 
            checked={showShelters} 
            onChange={(e) => setShowShelters(e.target.checked)} 
            className="rounded border-zinc-500 text-blue-500 focus:ring-0"
          />
          <span>Cooling Centers ({coolingCenters.length})</span>
        </label>

        <label className={`flex items-center gap-2 cursor-pointer hover:text-blue-500 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input 
            type="checkbox" 
            checked={showWorksites} 
            onChange={(e) => setShowWorksites(e.target.checked)} 
            className="rounded border-zinc-500 text-blue-500 focus:ring-0"
          />
          <span>Outdoor Worksites ({worksiteStatuses.length})</span>
        </label>

        <label className={`flex items-center gap-2 cursor-pointer hover:text-blue-500 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <input 
            type="checkbox" 
            checked={showAgri} 
            onChange={(e) => setShowAgri(e.target.checked)} 
            className="rounded border-zinc-500 text-blue-500 focus:ring-0"
          />
          <span>Agro Plots ({agriculturalPlots.length})</span>
        </label>
      </div>

      {/* Map Legend (Responsive: Collapsible on Mobile, Expanded on Desktop) */}
      <div className={`absolute bottom-3 left-3 z-[400] backdrop-blur-md border rounded-xl shadow-xl transition-all ${
        isDark ? 'bg-zinc-900/95 border-zinc-800 text-zinc-300' : 'bg-white/95 border-zinc-200 text-zinc-800'
      }`}>
        
        {/* Mobile Legend Header / Toggle */}
        <button
          onClick={() => setIsLegendOpen(!isLegendOpen)}
          className="md:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
        >
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>HVI Scale</span>
          {isLegendOpen ? <ChevronDown className="w-3 h-3 text-zinc-400" /> : <ChevronUp className="w-3 h-3 text-zinc-400" />}
        </button>

        {/* Legend Content */}
        <div className={`p-3 md:p-3.5 text-xs space-y-1.5 ${isLegendOpen ? 'block' : 'hidden md:block'}`}>
          <div className={`font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider hidden md:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            HVI Vulnerability Index
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] flex-shrink-0"></span>
              <span>Extreme (75+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f97316] flex-shrink-0"></span>
              <span>High (55-74)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#eab308] flex-shrink-0"></span>
              <span>Moderate (35-54)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#22c55e] flex-shrink-0"></span>
              <span>Low (&lt;35)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <MapContainer
        key={theme}
        center={[33.456, -112.074]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          key={tileUrl}
          attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          url={tileUrl}
          maxZoom={16}
        />

        {/* 1. Census Tracts & HVI Overlays */}
        {showTracts && tracts.map((tract) => {
          const positions: [number, number][] = tract.geometry.coordinates[0].map(
            (coord: [number, number]) => [coord[1], coord[0]]
          );
          const color = getHviColor(tract.hvi_score);

          return (
            <Polygon
              key={tract.tract_id}
              positions={positions}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isDark ? 0.30 : 0.40,
                weight: 1.5
              }}
              eventHandlers={{
                click: () => onSelectTract && onSelectTract(tract)
              }}
            >
              <Tooltip sticky>
                <div className="text-xs p-1 font-sans">
                  <div className="font-semibold text-zinc-900">{tract.name}</div>
                  <div className="text-zinc-600">HVI: <strong>{tract.hvi_score}</strong> ({tract.risk_level})</div>
                  <div className="text-zinc-600">Micro Temp: {tract.avg_surface_temp_c}°C</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs space-y-1.5 p-1 max-w-[220px]">
                  <h4 className="font-semibold text-sm leading-tight">{tract.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Risk Tier:</span>
                    <span className="px-1.5 py-0.2 rounded text-white font-medium text-[10px]" style={{ backgroundColor: color }}>
                      {tract.risk_level} (HVI {tract.hvi_score})
                    </span>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-zinc-300 dark:border-zinc-800 text-[11px]">
                    <div>Population: <strong>{tract.population.toLocaleString()}</strong></div>
                    <div>FortyGuard Temp: <strong className="font-mono">{tract.avg_surface_temp_c}°C</strong></div>
                    <div>Canopy Deficit: <strong className="font-mono">{(100 - tract.canopy_cover_pct).toFixed(1)}%</strong></div>
                    <div>No AC: <strong className="font-mono">{tract.no_ac_pct}%</strong></div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {/* 2. Cooling Shelters */}
        {showShelters && coolingCenters.map((cc) => (
          <Marker
            key={cc.id}
            position={[cc.latitude, cc.longitude]}
            icon={createShelterIcon()}
          >
            <Popup>
              <div className="text-xs space-y-1.5 p-1 max-w-[240px]">
                <div className="flex items-center gap-1.5 font-semibold text-sm text-blue-600 dark:text-blue-400 leading-tight">
                  <Home className="w-4 h-4 flex-shrink-0" />
                  <span>{cc.name}</span>
                </div>
                <p className="text-zinc-500 text-[11px] leading-tight">{cc.address}</p>
                <div className="pt-1.5 border-t border-zinc-300 dark:border-zinc-800 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Occupancy:</span>
                    <span className="font-mono">{cc.current_occupancy} / {cc.capacity} ({Math.round((cc.current_occupancy/cc.capacity)*100)}%)</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full rounded-full" 
                      style={{ width: `${Math.min(100, (cc.current_occupancy/cc.capacity)*100)}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {cc.features.map((f, i) => (
                      <span key={i} className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1 py-0.2 rounded border border-zinc-300 dark:border-zinc-700">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Outdoor Worksites */}
        {showWorksites && worksiteStatuses.map((ws) => (
          <Marker
            key={ws.site.id}
            position={[ws.site.latitude, ws.site.longitude]}
            icon={createWorksiteIcon(ws.advisory.risk_level)}
            eventHandlers={{
              click: () => onSelectWorksite && onSelectWorksite(ws)
            }}
          >
            <Popup>
              <div className="text-xs space-y-1.5 p-1 max-w-[240px]">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="font-semibold text-sm leading-tight">{ws.site.name}</h4>
                  <span className="px-1.5 py-0.2 rounded text-white font-medium text-[9px] flex-shrink-0" style={{ backgroundColor: ws.advisory.color_code }}>
                    {ws.advisory.risk_level}
                  </span>
                </div>
                <div className="space-y-1 pt-1 border-t border-zinc-300 dark:border-zinc-800 text-[11px]">
                  <div>Crew: <strong>{ws.site.crew_size} workers</strong> ({ws.site.supervisor_name})</div>
                  <div>WBGT: <strong className="font-mono">{ws.metrics.wbgt_c}°C</strong> | Heat Idx: <strong className="text-orange-500 font-mono">{ws.metrics.heat_index_c}°C</strong></div>
                  <div>Rest: <strong className="font-mono">{ws.advisory.rest_minutes_per_hour}m / hr</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Agricultural Plots */}
        {showAgri && agriculturalPlots.map((plot) => (
          <Marker
            key={plot.id}
            position={[plot.latitude, plot.longitude]}
            icon={createAgriIcon()}
            eventHandlers={{
              click: () => onSelectPlot && onSelectPlot(plot)
            }}
          >
            <Popup>
              <div className="text-xs space-y-1 p-1 max-w-[220px]">
                <div className="font-semibold text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5 leading-tight">
                  <Sprout className="w-4 h-4 flex-shrink-0" />
                  <span>{plot.name}</span>
                </div>
                <div className="space-y-0.5 pt-1 border-t border-zinc-300 dark:border-zinc-800 text-[11px]">
                  <div>Crop: <strong className="text-green-500">{plot.crop_name}</strong></div>
                  <div>Area: <strong className="font-mono">{plot.area_hectares} ha</strong> ({plot.soil_type})</div>
                  <div>System: <strong>{plot.irrigation_system}</strong></div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};
