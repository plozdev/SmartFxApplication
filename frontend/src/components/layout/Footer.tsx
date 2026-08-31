import React from 'react';
import { useMarket } from '../../context/MarketContext';

export const Footer: React.FC = () => {
  const { systemStats } = useMarket();

  return (
    <footer className="h-8 bg-[#0a0e17] border-t border-[#1e293b] px-4 flex items-center justify-between text-[10px] text-slate-500 font-mono flex-shrink-0 z-20 select-none">
      <div>System: v2.0.42-stable</div>
      <div className="flex items-center space-x-4">
        <span>
          API Latency: <span className="text-[#06ffa5] font-bold">{systemStats.networkLatencyMs}ms</span>
        </span>
        <span>Uptime: 99.98%</span>
      </div>
    </footer>
  );
};

