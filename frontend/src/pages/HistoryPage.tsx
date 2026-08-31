import React, { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  DollarSign,
  Zap,
  Clock,
  Eye,
  Trash2,
  Download,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { ArbitrageOpportunity } from '../types';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const HistoryPage: React.FC = () => {
  const {
    opportunities,
    setSelectedOpportunity,
    systemStats,
    clearHistory,
  } = useMarket();

  const [search, setSearch] = useState('');
  const [filterCoin, setFilterCoin] = useState<string>('all');
  const [sortField, setSortField] = useState<'timestamp' | 'netProfitPercent' | 'profitUsd'>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: 'timestamp' | 'netProfitPercent' | 'profitUsd') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        const pathStr = opp.path.join(' ');
        const matchesSearch =
          pathStr.toLowerCase().includes(search.toLowerCase()) ||
          opp.id.toLowerCase().includes(search.toLowerCase());
        const matchesCoin = filterCoin === 'all' || opp.path.includes(filterCoin);
        return matchesSearch && matchesCoin;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [opportunities, search, filterCoin, sortField, sortAsc]);

  const exportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(opportunities, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smartfx_arbitrage_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 select-none" id="history-view">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
            <span>Total Captured</span>
            <Zap className="w-3.5 h-3.5 text-[#06ffa5]" />
          </div>
          <p className="mt-1 text-xl font-mono font-bold text-white">
            {opportunities.length}
          </p>
          <p className="text-[10px] font-mono text-[#64748b]">
            Historical cycle executions
          </p>
        </div>

        <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
            <span>Cumulative Profit</span>
            <DollarSign className="w-3.5 h-3.5 text-[#22c55e]" />
          </div>
          <p className="mt-1 text-xl font-mono font-bold text-[#22c55e]">
            +${systemStats.totalProfitTodayUsd.toFixed(2)}
          </p>
          <p className="text-[10px] font-mono text-[#64748b]">
            On $1,000 baseline capital
          </p>
        </div>

        <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
            <span>Avg Net Spread</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#3b82f6]" />
          </div>
          <p className="mt-1 text-xl font-mono font-bold text-[#3b82f6]">
            +{systemStats.avgNetProfitPercent}%
          </p>
          <p className="text-[10px] font-mono text-[#64748b]">
            After 0.1% taker fees per leg
          </p>
        </div>

        <div className="rounded-lg border border-[#1e293b] bg-[#111827] p-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8]">
            <span>Best Single Arbitrage</span>
            <Zap className="w-3.5 h-3.5 text-[#06ffa5]" />
          </div>
          <p className="mt-1 text-xl font-mono font-bold text-[#06ffa5]">
            +{systemStats.bestProfitTodayPercent}%
          </p>
          <p className="text-[10px] font-mono text-[#64748b]">
            Max profit opportunity
          </p>
        </div>
      </div>

      {/* Main Historical Table Card */}
      <Card
        className="p-0 border-[#1e293b] bg-[#111827]"
        hoverable={false}
        header={
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-[#3b82f6]" />
            <span>Arbitrage Opportunities Audit Log</span>
          </div>
        }
        headerRight={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={exportJson}
              icon={<Download className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Export JSON
            </Button>
            {opportunities.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                icon={<Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />}
                className="text-xs text-[#ef4444] hover:bg-[#ef4444]/15"
              >
                Clear
              </Button>
            )}
          </div>
        }
      >
        {/* Filters Toolbar */}
        <div className="p-4 border-b border-[#1e293b] bg-[#0d1322]/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
            <input
              type="text"
              placeholder="Search by path or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0a0e17] border border-[#1e293b] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#94a3b8]">Currency:</span>
            {['all', 'BTC', 'ETH', 'SOL', 'BNB', 'EUR'].map((coin) => (
              <button
                key={coin}
                onClick={() => setFilterCoin(coin)}
                className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                  filterCoin === coin
                    ? 'bg-[#3b82f6] text-white font-bold'
                    : 'bg-[#0a0e17] text-[#94a3b8] hover:text-white border border-[#1e293b]'
                }`}
              >
                {coin.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1e293b] bg-[#0d1322] text-[#94a3b8]">
                <th
                  onClick={() => handleSort('timestamp')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Cycle Route</th>
                <th className="py-3 px-4 font-semibold">Legs</th>
                <th
                  onClick={() => handleSort('netProfitPercent')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Net Profit (%)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('profitUsd')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Profit (USD)</span>
                    <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">SPFA Weight</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#64748b]">
                    No historical arbitrage records match the query.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-[#1a2332] transition-colors group">
                    <td className="py-3 px-4 text-[#94a3b8]">
                      {new Date(opp.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white group-hover:text-[#06ffa5] transition-colors">
                      {opp.path.join(' → ')}
                    </td>
                    <td className="py-3 px-4 text-[#64748b]">{opp.steps.length} Steps</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="profit" size="sm">
                        +{opp.netProfitPercent}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#22c55e]">
                      +${opp.profitUsd.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right text-[#06ffa5] font-mono">
                      {opp.cycleSumWeight}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOpportunity(opp)}
                        className="p-1 text-[#3b82f6] hover:text-white rounded hover:bg-[#3b82f6]/20 transition-colors cursor-pointer"
                        title="View Full Math & Step Breakdown"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
