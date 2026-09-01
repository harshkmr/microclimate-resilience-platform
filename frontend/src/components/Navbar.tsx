import React from 'react';
import { 
  Map, 
  HardHat, 
  Sprout, 
  KeyRound, 
  Radio,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import type { ApiKeyStatus } from '../types';

interface NavbarProps {
  activeTab: 'vulnerability' | 'worker-safety' | 'agriculture';
  setActiveTab: (tab: 'vulnerability' | 'worker-safety' | 'agriculture') => void;
  systemStatus: ApiKeyStatus | null;
  onOpenSettings: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  onOpenSettings,
  theme,
  onToggleTheme
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'vulnerability' as const, label: 'Heat Vulnerability', shortLabel: 'Vulnerability', icon: Map },
    { id: 'worker-safety' as const, label: 'Worker Safety', shortLabel: 'Worker Safety', icon: HardHat },
    { id: 'agriculture' as const, label: 'Agro-Microclimate', shortLabel: 'Agriculture', icon: Sprout },
  ];

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors ${
      isDark 
        ? 'bg-zinc-900/95 border-zinc-800 backdrop-blur-md' 
        : 'bg-white/95 border-zinc-200 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Top Row: Brand & Quick Controls */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 flex-shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`font-semibold text-sm sm:text-base tracking-tight truncate ${isDark ? 'text-zinc-50' : 'text-zinc-900'}`}>
                  FortyGuard
                </span>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium border whitespace-nowrap hidden xs:inline-block ${
                  isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700/60' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                }`}>
                  Gov & Env
                </span>
              </div>
              <p className={`text-[11px] sm:text-xs truncate hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Microclimate Resilience Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on Mobile/Small Tablets) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 lg:px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    isActive
                      ? isDark 
                        ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm' 
                        : 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow-sm'
                      : isDark 
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Controls: Live/Demo Mode, Theme Toggle, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            
            {/* Mode Badge Button */}
            {systemStatus && (
              <button 
                onClick={onOpenSettings}
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border text-[11px] sm:text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  systemStatus.mode === 'live'
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/40'
                    : isDark 
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                }`}
                title="Configure FortyGuard API Key and Live Mode"
              >
                <Radio className={`w-3.5 h-3.5 flex-shrink-0 ${systemStatus.mode === 'live' ? 'animate-pulse text-emerald-400' : 'text-blue-500'}`} />
                <span className="hidden sm:inline">{systemStatus.mode === 'live' ? 'Live API' : 'Demo Simulator'}</span>
                <span className="sm:hidden">{systemStatus.mode === 'live' ? 'Live' : 'Demo'}</span>
                {systemStatus.credits_remaining !== undefined && (
                  <span className={`text-[10px] px-1 py-0.2 rounded font-mono border hidden md:inline-block ${
                    isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
                  }`}>
                    {systemStatus.credits_remaining.toLocaleString()} cr
                  </span>
                )}
              </button>
            )}

            {/* Minimalist Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                isDark 
                  ? 'bg-zinc-800/80 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 border-zinc-700' 
                  : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 border-zinc-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform active:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700 transition-transform active:-rotate-12" />
              )}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                isDark 
                  ? 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border-zinc-700' 
                  : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 border-zinc-300'
              }`}
              title="API Key & System Settings"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Responsive Tab Segmented Bar */}
        <div className="md:hidden pb-2.5 pt-1 overflow-x-auto scrollbar-none">
          <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg border text-center ${
            isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-zinc-100/90 border-zinc-200'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all focus:outline-none ${
                    isActive
                      ? isDark 
                        ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm font-semibold' 
                        : 'bg-white text-zinc-900 border border-zinc-300 shadow-sm font-semibold'
                      : isDark 
                        ? 'text-zinc-400 hover:text-zinc-200' 
                        : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
