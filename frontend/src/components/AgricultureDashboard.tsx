import React, { useState } from 'react';
import type { 
  AgriculturalPlot, 
  CropProfile, 
  AgroMicroclimateResponse
} from '../types';
import { 
  Sprout, 
  Droplet, 
  Sun, 
  Calendar, 
  Sparkles, 
  Clock, 
  Waves
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid 
} from 'recharts';

interface AgricultureDashboardProps {
  plots: AgriculturalPlot[];
  crops: CropProfile[];
  analytics: AgroMicroclimateResponse | null;
  selectedPlot: AgriculturalPlot | null;
  onSelectPlot: (plot: AgriculturalPlot) => void;
  theme?: 'dark' | 'light';
}

export const AgricultureDashboard: React.FC<AgricultureDashboardProps> = ({
  plots,
  crops,
  analytics,
  selectedPlot,
  onSelectPlot,
  theme = 'dark'
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'irrigation' | 'gdd'>('irrigation');

  const currentPlot = selectedPlot || plots[0] || null;
  const currentCrop = analytics?.crop || crops[0] || null;
  const isDark = theme === 'dark';

  const cardCls = isDark 
    ? 'bg-zinc-900 border-zinc-800 text-zinc-50' 
    : 'bg-white border-zinc-200 text-zinc-900 shadow-sm';

  const subCardCls = isDark 
    ? 'bg-zinc-950 border-zinc-800' 
    : 'bg-zinc-50 border-zinc-200';

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className={`border rounded-xl p-4 sm:p-6 transition-colors ${cardCls}`}>
          <div className={`flex items-center justify-between mb-1.5 sm:mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Crop Phenology Stage</span>
            <Sprout className="w-4 h-4 text-green-500 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-semibold tracking-tight truncate">
            {analytics?.gdd_forecast.find(f => f.day_number === 45)?.crop_stage || 'Flowering & Fruit Set'}
          </div>
          <div className="text-xs text-green-500 mt-1.5 font-medium font-mono truncate">
            {analytics?.gdd_progress_pct || 68.4}% GDD ({analytics?.accumulated_gdd} / {currentCrop?.gdd_to_maturity} u)
          </div>
        </div>

        <div className={`border rounded-xl p-4 sm:p-6 transition-colors ${cardCls}`}>
          <div className={`flex items-center justify-between mb-1.5 sm:mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Projected Harvest</span>
            <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono">
            {analytics?.projected_harvest_date || '2026-05-18'}
          </div>
          <div className={`text-xs mt-1.5 truncate ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Thermal velocity model
          </div>
        </div>

        <div className={`border rounded-xl p-4 sm:p-6 transition-colors ${cardCls}`}>
          <div className={`flex items-center justify-between mb-1.5 sm:mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Daily ET₀ Loss</span>
            <Sun className="w-4 h-4 text-amber-500 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono">
            {analytics?.daily_et0_total_mm || 6.84} mm/day
          </div>
          <div className="text-xs text-amber-500 mt-1.5 truncate">
            Penman-Monteith solar model
          </div>
        </div>

        <div className={`border rounded-xl p-4 sm:p-6 transition-colors ${cardCls}`}>
          <div className={`flex items-center justify-between mb-1.5 sm:mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Target Irrigation</span>
            <Droplet className="w-4 h-4 text-blue-500 flex-shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight font-mono">
            {analytics ? (analytics.recommended_irrigation_volume_liters / 1000).toFixed(1) : '72.5'}k L
          </div>
          <div className="text-xs text-blue-500 mt-1.5 font-medium truncate">
            For {currentPlot?.area_hectares} ha parcel
          </div>
        </div>

      </div>

      {/* Main Grid: Plot Selector, Crop Specs & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Col: Plots Selector & Biological Spec */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Plot List */}
          <div className={`border rounded-xl p-4 sm:p-6 transition-colors space-y-3 ${cardCls}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm tracking-tight">
                <Waves className="w-4 h-4 text-green-500" />
                <span>Agricultural Plots</span>
              </div>
              <span className={`text-xs font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{plots.length} Parcels</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {plots.map((p) => {
                const isSelected = currentPlot?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlot(p)}
                    className={`p-3 sm:p-3.5 rounded-lg border cursor-pointer transition-colors focus:outline-none ${
                      isSelected
                        ? isDark ? 'bg-zinc-800 border-zinc-700 shadow-sm' : 'bg-green-50 border-green-300 shadow-sm'
                        : subCardCls
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium text-xs">
                      <span className="truncate pr-1">{p.name}</span>
                      <span className="text-green-500 font-semibold flex-shrink-0">{p.crop_name}</span>
                    </div>
                    <div className={`flex justify-between text-[11px] mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span>{p.area_hectares} ha &bull; {p.soil_type}</span>
                      <span className="font-mono">{p.irrigation_system}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crop Biological Specs Card */}
          {currentCrop && (
            <div className={`border rounded-xl p-4 sm:p-6 transition-colors space-y-3 text-xs ${cardCls}`}>
              <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <div className="font-semibold text-sm tracking-tight flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-green-500" />
                  <span>{currentCrop.name}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                  isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                }`}>
                  {currentCrop.category}
                </span>
              </div>

              <p className={`leading-relaxed text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {currentCrop.description}
              </p>

              <div className={`space-y-2 pt-1 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>Base Growth Temp (T_base):</span>
                  <strong className="font-mono">{currentCrop.base_temp_c}°C</strong>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>Optimal Temp Range:</span>
                  <strong className="text-green-500 font-mono">
                    {currentCrop.optimal_temp_range_c[0]}°C - {currentCrop.optimal_temp_range_c[1]}°C
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>Critical Heat Threshold:</span>
                  <strong className="text-red-500 font-mono">{currentCrop.critical_heat_threshold_c}°C</strong>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>Target Maturity GDD:</span>
                  <strong className="text-blue-500 font-mono">{currentCrop.gdd_to_maturity} units</strong>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Charts & 24-Hour Smart Irrigation Windows */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Chart Card */}
          <div className={`border rounded-xl p-4 sm:p-6 transition-colors space-y-4 ${cardCls}`}>
            
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
                <button
                  onClick={() => setActiveChartTab('irrigation')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    activeChartTab === 'irrigation'
                      ? isDark ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 font-semibold' : 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold'
                      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  24-Hour ET₀ Profile
                </button>

                <button
                  onClick={() => setActiveChartTab('gdd')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    activeChartTab === 'gdd'
                      ? isDark ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 font-semibold' : 'bg-zinc-100 text-zinc-900 border border-zinc-300 font-semibold'
                      : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  GDD Phenology Curve
                </button>
              </div>

              <span className={`text-[11px] font-mono hidden sm:inline ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Microclimate Model
              </span>
            </div>

            {/* Chart Container */}
            <div className="h-60 sm:h-72 w-full">
              {activeChartTab === 'irrigation' && analytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.optimal_irrigation_windows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="et0Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                    <XAxis dataKey="hour_label" stroke={isDark ? '#71717a' : '#a1a1aa'} textAnchor="end" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="left" stroke="#3b82f6" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: isDark ? '#18181b' : '#ffffff', 
                        borderColor: isDark ? '#27272a' : '#e4e4e7', 
                        borderRadius: '0.75rem', 
                        fontSize: '12px',
                        color: isDark ? '#fafafa' : '#09090b'
                      }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="et0_mm_per_hour" name="ET₀ (mm/hr)" stroke="#3b82f6" fill="url(#et0Grad)" />
                    <Area yAxisId="right" type="monotone" dataKey="temperature_c" name="Temp (°C)" stroke="#f59e0b" fill="url(#tempGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeChartTab === 'gdd' && analytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.gdd_forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                    <XAxis dataKey="day_number" stroke={isDark ? '#71717a' : '#a1a1aa'} tick={{ fontSize: 10 }} />
                    <YAxis stroke="#22c55e" tick={{ fontSize: 10 }} />
                    <RechartsTooltip
                      contentStyle={{ 
                        backgroundColor: isDark ? '#18181b' : '#ffffff', 
                        borderColor: isDark ? '#27272a' : '#e4e4e7', 
                        borderRadius: '0.75rem', 
                        fontSize: '12px',
                        color: isDark ? '#fafafa' : '#09090b'
                      }}
                    />
                    <Line type="monotone" dataKey="accumulated_gdd" name="Accumulated GDD" stroke="#22c55e" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="target_maturity_gdd" name="Maturity Target" stroke={isDark ? '#71717a' : '#a1a1aa'} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>

          {/* 24-Hour Smart Irrigation Windows Table */}
          <div className={`border rounded-xl p-4 sm:p-6 transition-colors space-y-3 ${cardCls}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <h4 className="font-semibold text-xs sm:text-sm tracking-tight truncate">Smart Irrigation Windows</h4>
              </div>
              <span className="text-[11px] text-green-500 font-medium whitespace-nowrap">
                Optimal Windows
              </span>
            </div>

            <div className="overflow-x-auto max-h-60 overflow-y-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className={`sticky top-0 z-10 ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
                  <tr className={`border-b ${isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-200 text-zinc-500'}`}>
                    <th className="pb-3 font-medium">Window</th>
                    <th className="pb-3 font-medium">Temp</th>
                    <th className="pb-3 font-medium">Solar GHI</th>
                    <th className="pb-3 font-medium">ET₀ Loss</th>
                    <th className="pb-3 font-medium">Risk</th>
                    <th className="pb-3 font-medium">Efficiency</th>
                    <th className="pb-3 font-medium">Advisory</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                  {analytics?.optimal_irrigation_windows.map((w) => (
                    <tr 
                      key={w.hour}
                      className={w.is_recommended_window ? (isDark ? 'bg-green-950/20' : 'bg-green-50/50') : ''}
                    >
                      <td className="py-2.5 font-mono font-medium">{w.hour_label}</td>
                      <td className="py-2.5 font-mono">{w.temperature_c}°C</td>
                      <td className="py-2.5 font-mono text-amber-500">{w.solar_irradiance_wm2} W/m²</td>
                      <td className="py-2.5 font-mono text-blue-500">{w.et0_mm_per_hour} mm/h</td>
                      <td className="py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          w.evaporation_loss_risk === 'Extreme' ? 'bg-red-950 text-red-400 border border-red-800' :
                          w.evaporation_loss_risk === 'High' ? 'bg-orange-950 text-orange-400 border border-orange-800' :
                          w.evaporation_loss_risk === 'Moderate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-green-950 text-green-400 border border-green-800'
                        }`}>
                          {w.evaporation_loss_risk}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono font-semibold">{w.efficiency_score}%</td>
                      <td className="py-2.5">
                        {w.is_recommended_window ? (
                          <span className="text-green-500 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            OPTIMAL
                          </span>
                        ) : (
                          <span className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>Suboptimal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
