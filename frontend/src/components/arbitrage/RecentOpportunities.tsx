import React from 'react';
import { History, ArrowRight, Zap, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const RecentOpportunities: React.FC = () => {
  const { opportunities, setSelectedOpportunity } = useMarket();

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card
      className="p-0 border-[#1e293b] bg-[#111827]"
      hoverable={false}
      header={
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#3b82f6]" />
          <span>Recent Opportunities</span>
        </div>
      }
      headerRight={
        <Badge variant="neutral" size="sm">
          {opportunities.length} Captured
        </Badge>
      }
    >
      <div className="divide-y divide-[#1e293b]/60 max-h-[340px] overflow-y-auto" id="recent-opportunities-list">
        {opportunities.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-[#64748b]">
            No arbitrage cycles detected yet. Scanning...
          </div>
        ) : (
          opportunities.map((opp) => {
            return (
              <div
                key={opp.id}
                onClick={() => setSelectedOpportunity(opp)}
                className="p-3.5 hover:bg-[#1a2332] transition-colors cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white group-hover:text-[#06ffa5] transition-colors">
                      {opp.path.join(' → ')}
                    </span>
                    <Badge variant="profit" size="sm">
                      +{opp.netProfitPercent}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#64748b]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTimeAgo(opp.timestamp)}
                    </span>
                    <span>•</span>
                    <span className="text-[#94a3b8]">
                      +${opp.profitUsd.toFixed(2)} USD
                    </span>
                    <span>•</span>
                    <span>{opp.executionTimeMs}ms</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#64748b] group-hover:text-[#06ffa5] transition-colors">
                  <span className="text-xs font-mono hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
                    Inspect
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
