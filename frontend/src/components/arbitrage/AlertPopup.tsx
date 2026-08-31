import React from 'react';
import { Rocket, ArrowRight, X, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const AlertPopup: React.FC = () => {
  const { activeAlert, dismissActiveAlert, setSelectedOpportunity } = useMarket();

  if (!activeAlert) return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[#06ffa5]/50 bg-gradient-to-r from-[#111827] via-[#0e2124] to-[#111827] p-4 shadow-[0_0_25px_rgba(6,255,165,0.2)] animate-in fade-in slide-in-from-right duration-300"
      id="arbitrage-alert-popup"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#06ffa5] to-transparent animate-pulse" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#06ffa5]/20 text-[#06ffa5] border border-[#06ffa5]/40 shadow-[0_0_10px_rgba(6,255,165,0.3)]">
            <Rocket className="h-4 w-4 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#06ffa5]">
                🚀 Arbitrage Detected
              </span>
              <Badge variant="neon" size="sm">
                +{activeAlert.netProfitPercent}% Net
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-[#94a3b8]">
              Estimated Profit: <span className="font-mono font-bold text-[#22c55e]">+${activeAlert.profitUsd.toFixed(2)}</span> on $1,000
            </p>
          </div>
        </div>

        <button
          onClick={dismissActiveAlert}
          className="text-[#64748b] hover:text-white transition-colors p-1 rounded-md cursor-pointer hover:bg-[#1e293b]"
          title="Dismiss Alert"
          id="dismiss-alert-btn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Cycle Path Pills */}
      <div className="mt-3 flex items-center gap-1.5 overflow-x-auto py-1 text-xs font-mono">
        {activeAlert.path.map((coin, idx) => (
          <React.Fragment key={idx}>
            <span className="rounded bg-[#0a0e17] px-2 py-0.5 font-bold text-white border border-[#1e293b]">
              {coin}
            </span>
            {idx < activeAlert.path.length - 1 && (
              <span className="text-[#06ffa5] font-bold">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Action Footer */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1e293b]/70">
        <span className="text-[11px] font-mono text-[#64748b]">
          SPFA weight: <span className="text-[#06ffa5]">{activeAlert.cycleSumWeight}</span>
        </span>

        <button
          onClick={() => setSelectedOpportunity(activeAlert)}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#06ffa5] hover:text-white transition-colors cursor-pointer bg-[#06ffa5]/10 hover:bg-[#06ffa5]/25 px-2.5 py-1 rounded-md border border-[#06ffa5]/30"
          id="view-details-alert-btn"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
