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

  return (
    <header className={`border-b sticky top-0 z-50 transition-colors ${
      isDark 
        ? 'bg-zinc-900/90 border-zinc-800 backdrop-blur-md' 
        : 'bg-white/90 border-zinc-200 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold text-base tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-900'}`}>
                  FortyGuard
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700/60' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                }`}>
                  Gov & Environment
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Microclimate Resilience Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('vulnerability')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                activeTab === 'vulnerability'
                  ? isDark 
                    ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm' 
                    : 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow-sm'
                  : isDark 
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Heat Vulnerability</span>
            </button>

            <button
              onClick={() => setActiveTab('worker-safety')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                activeTab === 'worker-safety'
                  ? isDark 
                    ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm' 
                    : 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow-sm'
                  : isDark 
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>Worker Safety</span>
            </button>

            <button
              onClick={() => setActiveTab('agriculture')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                activeTab === 'agriculture'
                  ? isDark 
                    ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm' 
                    : 'bg-zinc-100 text-zinc-900 border border-zinc-300 shadow-sm'
                  : isDark 
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Sprout className="w-4 h-4" />
              <span>Agro-Microclimate</span>
            </button>
          </nav>

          {/* Controls: Mode Badge, Theme Toggle & API Settings */}
          <div className="flex items-center gap-2.5">
            {systemStatus && (
              <button 
                onClick={onOpenSettings}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  systemStatus.mode === 'live'
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400 hover:bg-emerald-900/40'
                    : isDark 
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
                }`}
                title="Configure FortyGuard API Key and Live Mode"
              >
                <Radio className={`w-3.5 h-3.5 ${systemStatus.mode === 'live' ? 'animate-pulse text-emerald-400' : 'text-blue-500'}`} />
                <span>{systemStatus.mode === 'live' ? 'Live API' : 'Demo Simulator'}</span>
                {systemStatus.credits_remaining !== undefined && (
                  <span className={`text-[11px] px-1.5 py-0.2 rounded font-mono border ${
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
              className={`p-2 rounded-lg transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                isDark 
                  ? 'bg-zinc-800/80 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-800 border-zinc-700' 
                  : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 border-zinc-300'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-lg transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
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
      </div>
    </header>
  );
};
