import React, { useState } from 'react';
import { KeyRound, X, CheckCircle2, AlertTriangle, Radio, Sparkles, RefreshCw } from 'lucide-react';
import type { ApiKeyStatus } from '../types';
import { api } from '../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: ApiKeyStatus | null;
  onStatusUpdated: (status: ApiKeyStatus) => void;
  theme?: 'dark' | 'light';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
  onStatusUpdated,
  theme = 'dark'
}) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedMode, setSelectedMode] = useState<'live' | 'demo'>(systemStatus?.mode || 'demo');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSave = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const updated = await api.updateSystemConfig(apiKeyInput, selectedMode);
      onStatusUpdated(updated);
      setFeedback({
        type: 'success',
        message: selectedMode === 'live' 
          ? 'FortyGuard API key saved and live mode engaged successfully!' 
          : 'Operating mode set to Demo Simulator.'
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to update FortyGuard configuration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 transition-colors ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-50' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold tracking-tight">FortyGuard API & Settings</h2>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Configure Live Enterprise API or Demo</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              isDark ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[70vh] overflow-y-auto">
          
          {/* Current Status Box */}
          <div className={`p-3 sm:p-4 border rounded-lg flex items-start gap-2.5 sm:gap-3 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <div className="mt-0.5 flex-shrink-0">
              {systemStatus?.mode === 'live' ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Sparkles className="w-4 h-4 text-blue-500" />
              )}
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              <div className="flex items-center justify-between font-medium">
                <span>Mode: {systemStatus?.mode === 'live' ? 'Live API' : 'Demo Simulator'}</span>
                <span className={`text-[11px] font-mono ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{systemStatus?.plan_tier}</span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{systemStatus?.status_message}</p>
              {systemStatus?.masked_key && (
                <div className={`mt-2 font-mono text-xs px-2 py-1 rounded border ${
                  isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                }`}>
                  Key: {systemStatus.masked_key}
                </div>
              )}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className={`block text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Execution Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setSelectedMode('demo')}
                className={`p-3 rounded-lg border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selectedMode === 'demo'
                    ? isDark ? 'bg-zinc-800/80 border-blue-500 text-zinc-100' : 'bg-blue-50/60 border-blue-500 text-zinc-900'
                    : isDark ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <div className="font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  Demo Simulator
                </div>
                <p className={`text-[11px] sm:text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Realistic synthetic telemetry without key.</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('live')}
                className={`p-3 rounded-lg border text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  selectedMode === 'live'
                    ? isDark ? 'bg-zinc-800/80 border-blue-500 text-zinc-100' : 'bg-blue-50/60 border-blue-500 text-zinc-900'
                    : isDark ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <div className="font-medium text-xs sm:text-sm flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Live API
                </div>
                <p className={`text-[11px] sm:text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Connects to FortyGuard Enterprise v1.</p>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <label className={`block text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              FortyGuard API Key {selectedMode === 'demo' && <span className="font-normal opacity-70">(Optional)</span>}
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Paste FortyGuard API Key"
              className={`w-full border rounded-lg px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-colors font-mono ${
                isDark 
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-50 placeholder-zinc-500' 
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
              }`}
            />
            <p className={`text-[11px] sm:text-xs mt-1.5 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Injected as <code className={`px-1 py-0.5 rounded border font-mono ${
                isDark ? 'text-zinc-300 bg-zinc-950 border-zinc-800' : 'text-zinc-700 bg-zinc-100 border-zinc-200'
              }`}>api-key: YOUR_KEY</code>.
            </p>
          </div>

          {/* Feedback Message */}
          {feedback && (
            <div className={`p-3 rounded-lg text-xs sm:text-sm flex items-center gap-2 ${
              feedback.type === 'success' 
                ? isDark ? 'bg-zinc-950 text-green-400 border border-green-800/60' : 'bg-green-50 text-green-700 border border-green-200'
                : isDark ? 'bg-zinc-950 text-red-400 border border-red-800/60' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              <span>{feedback.message}</span>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 sm:p-6 border-t flex items-center justify-end gap-2.5 sm:gap-3 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={onClose}
            className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              isDark ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
          >
            {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            Save & Apply
          </button>
        </div>

      </div>
    </div>
  );
};
