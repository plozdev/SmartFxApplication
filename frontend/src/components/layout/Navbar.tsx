import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  History,
  BookOpen,
  Volume2,
  VolumeX,
  Server,
  ChevronDown,
} from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { TabType } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    isConnected,
    soundEnabled,
    toggleSound,
    toggleConnection,
    triggerManualArbitrageScan,
    opportunities,
    systemStats,
  } = useMarket();

  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const navItems: { id: TabType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'history', label: 'History' },
    { id: 'how-it-works', label: 'How It Works' },
  ];

  return (
    <nav className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-[#1e293b] bg-[#111827] flex-shrink-0 z-30 select-none">
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center space-x-6 sm:space-x-8">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center space-x-2 text-left cursor-pointer focus:outline-none group"
          id="brand-logo-btn"
        >
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs group-hover:bg-blue-500 transition-colors shadow-sm">
            FX
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            SmartFX <span className="text-blue-500">2.0</span>
          </span>
        </button>

        <div className="hidden sm:flex items-center space-x-6 text-sm font-medium" id="main-nav-links">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                id={`nav-link-${item.id}`}
                className={`transition-colors cursor-pointer text-sm font-medium ${
                  isActive
                    ? 'text-white border-b-2 border-blue-500 pb-4 mt-4 font-semibold'
                    : 'text-slate-400 hover:text-white pb-4 mt-4 border-b-2 border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {item.id === 'history' && opportunities.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-[#1e293b] px-1.5 py-0.2 text-[10px] font-mono text-[#06ffa5]">
                    {opportunities.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Controls, Status Badge & Profile */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Quick Scan Action Button */}
        <button
          onClick={triggerManualArbitrageScan}
          title="Force SPFA Scan"
          id="quick-scan-trigger-btn"
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded text-xs font-bold transition-colors cursor-pointer font-mono"
        >
          <Zap className="w-3 h-3 text-[#06ffa5]" />
          <span>Scan Cycle</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          id="sound-toggle-btn"
          title={soundEnabled ? 'Alert sounds active' : 'Alert sounds muted'}
          className="flex h-7 w-7 items-center justify-center rounded bg-[#1a2332] border border-[#1e293b] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-[#22c55e]" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-slate-500" />
          )}
        </button>

        {/* Connection Status Badge */}
        <div className="relative">
          <button
            onClick={() => setShowStatusMenu((prev) => !prev)}
            id="connection-status-badge"
            className="bg-[#1a2332] border border-[#1e293b] rounded-full px-3 py-1 flex items-center space-x-2 text-[10px] uppercase tracking-wider font-bold text-[#06ffa5] shadow-[0_0_10px_rgba(6,255,165,0.15)] hover:border-[#06ffa5]/50 transition-colors cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06ffa5] opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isConnected ? 'bg-[#06ffa5]' : 'bg-[#ef4444]'
                }`}
              ></span>
            </span>
            <span>⚡ {isConnected ? 'Connected' : 'Disconnected'}</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>

          {/* Connection Popover */}
          {showStatusMenu && (
            <div
              className="absolute right-0 mt-2 w-72 rounded-lg border border-[#1e293b] bg-[#111827] p-3.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs font-mono"
              id="connection-details-popover"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1e293b]">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-white">Stream Pipeline</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isConnected ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-[#ef4444]/20 text-[#ef4444]'
                  }`}
                >
                  {isConnected ? 'LIVE FEED' : 'OFFLINE'}
                </span>
              </div>

              <div className="mt-2.5 space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Endpoint:</span>
                  <span className="text-slate-200">wss://stream.smartfx.io/v2</span>
                </div>
                <div className="flex justify-between">
                  <span>Latency:</span>
                  <span className="text-[#06ffa5] font-bold">{systemStats.networkLatencyMs}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>SPFA Engine:</span>
                  <span className="text-slate-200">Active ({systemStats.lastScanDurationMs}ms)</span>
                </div>
                <div className="flex justify-between">
                  <span>Graph:</span>
                  <span className="text-slate-200">{systemStats.nodesCount} coins / {systemStats.edgesCount} pairs</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#1e293b] flex gap-2">
                <button
                  onClick={toggleConnection}
                  className={`w-full py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition-colors border ${
                    isConnected
                      ? 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/30 hover:bg-[#ef4444]/25'
                      : 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30 hover:bg-[#22c55e]/25'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Reconnect'}
                </button>
                <button
                  onClick={() => setShowStatusMenu(false)}
                  className="py-1 px-2.5 rounded text-[11px] bg-[#1e293b] text-slate-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center space-x-2 border-l border-[#1e293b] pl-3 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            John Doe
          </span>
        </div>
      </div>
    </nav>
  );
};
