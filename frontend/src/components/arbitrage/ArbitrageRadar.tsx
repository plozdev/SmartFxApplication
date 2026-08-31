import React from 'react';
import { Radar, Radio, Cpu, Activity, Zap, CheckCircle2, TrendingUp, Clock } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const ArbitrageRadar: React.FC = () => {
  const {
    systemStats,
    isScanning,
    toggleScanning,
    triggerManualArbitrageScan,
    opportunities,
  } = useMarket();

  return (
    <Card
      className="border-[#1e293b] bg-[#111827]"
      hoverable={false}
      header={
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-[#06ffa5] animate-spin" style={{ animationDuration: '6s' }} />
          <span>Arbitrage Radar Engine</span>
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant={isScanning ? 'neon' : 'neutral'} size="sm" dot glow={isScanning}>
            {isScanning ? 'SCANNING' : 'PAUSED'}
          </Badge>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Main Radar Screen / Signal Display */}
        <div className="relative rounded-xl border border-[#1e293b] bg-[#0a0e17] p-4 overflow-hidden">
          {/* Subtle radar sweep effect */}
          {isScanning && (
            <div className="absolute inset-0 radar-sweep pointer-events-none opacity-40 animate-spin" style={{ animationDuration: '4s' }} />
          )}

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#94a3b8] uppercase tracking-wider">
                  Detection Algorithm
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-white font-mono">
                {systemStats.algorithmName}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-mono text-[#94a3b8]">
                <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Last cycle pass: </span>
                <span className="text-[#06ffa5] font-bold">{systemStats.lastScanDurationMs} ms</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-[#94a3b8]">Graph Metrics</span>
              <p className="text-sm font-mono font-bold text-[#e2e8f0]">
                {systemStats.nodesCount} Nodes / {systemStats.edgesCount} Edges
              </p>
              <p className="text-[11px] font-mono text-[#64748b]">
                {systemStats.totalCyclesChecked} cycles probed
              </p>
            </div>
          </div>
        </div>

        {/* Live KPI Metric Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-[#0d1322] p-3 border border-[#1e293b]/70">
            <span className="text-[11px] font-mono text-[#94a3b8] flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#06ffa5]" /> Detected Today
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-mono font-black text-white">
                {systemStats.opportunitiesToday}
              </span>
              <span className="text-[10px] font-mono text-[#06ffa5]">Active Rings</span>
            </div>
          </div>

          <div className="rounded-lg bg-[#0d1322] p-3 border border-[#1e293b]/70">
            <span className="text-[11px] font-mono text-[#94a3b8] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#22c55e]" /> Best Net Spread
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-mono font-black text-[#22c55e]">
                +{systemStats.bestProfitTodayPercent}%
              </span>
              <span className="text-[10px] font-mono text-[#64748b]">After fees</span>
            </div>
          </div>
        </div>

        {/* Scan Actions & Control */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="neon"
            size="sm"
            onClick={triggerManualArbitrageScan}
            icon={<Zap className="w-3.5 h-3.5" />}
            className="w-full"
            id="radar-trigger-scan-btn"
          >
            Force SPFA Graph Scan
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={toggleScanning}
            className="whitespace-nowrap text-xs"
            id="radar-toggle-scanning-btn"
          >
            {isScanning ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
