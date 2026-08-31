import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, Layers } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { Ticker } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export const TickerTable: React.FC = () => {
  const { tickers } = useMarket();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex'>('all');
  const [sortField, setSortField] = useState<keyof Ticker>('volume24h');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: keyof Ticker) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const filteredTickers = useMemo(() => {
    return tickers
      .filter((t) => {
        const matchesSearch =
          t.symbol.toLowerCase().includes(search.toLowerCase()) ||
          t.baseCurrency.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [tickers, search, selectedCategory, sortField, sortAsc]);

  const formatPrice = (val: number) => {
    if (val >= 1000) return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val >= 1) return val.toFixed(4);
    return val.toFixed(6);
  };

  const formatVolume = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <Card
      className="p-0 border-[#1e293b] bg-[#111827]"
      hoverable={false}
      header={
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-[#3b82f6]" />
          <span>Market Order Book & Tickers</span>
          <Badge variant="neutral" size="sm">
            {filteredTickers.length} Active Feeds
          </Badge>
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          {/* Category Filter Pills */}
          <div className="flex items-center rounded-lg bg-[#0a0e17] p-1 border border-[#1e293b]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#1e293b] text-white shadow-sm font-semibold'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('crypto')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                selectedCategory === 'crypto'
                  ? 'bg-[#1e293b] text-white shadow-sm font-semibold'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Crypto
            </button>
            <button
              onClick={() => setSelectedCategory('forex')}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                selectedCategory === 'forex'
                  ? 'bg-[#1e293b] text-white shadow-sm font-semibold'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Forex
            </button>
          </div>
        </div>
      }
    >
      {/* Search & Filter Bar */}
      <div className="p-4 border-b border-[#1e293b] bg-[#0d1322]/40 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search coin or pair (e.g. BTC, ETH, EUR)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#0a0e17] border border-[#1e293b] rounded-lg text-[#e2e8f0] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6] font-mono transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748b]">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" /> Flash Up
          </span>
          <span className="flex items-center gap-1 ml-2">
            <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> Flash Down
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse" id="market-tickers-table">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#0d1322] text-[#94a3b8]">
              <th
                onClick={() => handleSort('symbol')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Pair</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('bid')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Bid Price</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ask')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Ask Price</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('spreadPercent')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right hidden sm:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Spread (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('change24h')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>24h Change</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                </div>
              </th>
              <th
                onClick={() => handleSort('volume24h')}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors text-right hidden md:table-cell"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>24h Volume</span>
                  <ArrowUpDown className="w-3 h-3 text-[#64748b]" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/60">
            {filteredTickers.map((ticker) => {
              const isProfit = ticker.change24h >= 0;
              const flashClass =
                ticker.flashState === 'up'
                  ? 'flash-up text-[#22c55e]'
                  : ticker.flashState === 'down'
                  ? 'flash-down text-[#ef4444]'
                  : '';

              return (
                <tr
                  key={ticker.symbol}
                  className={`hover:bg-[#1a2332] transition-colors group ${flashClass}`}
                >
                  {/* Pair Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1e293b] font-bold text-[10px] text-white">
                        {ticker.baseCurrency.slice(0, 3)}
                      </div>
                      <div>
                        <span className="font-semibold text-[#e2e8f0] group-hover:text-[#3b82f6] transition-colors">
                          {ticker.symbol}
                        </span>
                        <span className="ml-2 text-[10px] text-[#64748b] uppercase">
                          {ticker.category}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Bid */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-[#22c55e] font-semibold">
                      {formatPrice(ticker.bid)}
                    </span>
                  </td>

                  {/* Ask */}
                  <td className="py-3 px-4 text-right">
                    <span className="text-[#ef4444] font-semibold">
                      {formatPrice(ticker.ask)}
                    </span>
                  </td>

                  {/* Spread */}
                  <td className="py-3 px-4 text-right text-[#94a3b8] hidden sm:table-cell">
                    <span>{ticker.spreadPercent.toFixed(4)}%</span>
                  </td>

                  {/* 24h Change */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isProfit
                          ? 'bg-[#22c55e]/15 text-[#22c55e]'
                          : 'bg-[#ef4444]/15 text-[#ef4444]'
                      }`}
                    >
                      {isProfit ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {isProfit ? `+${ticker.change24h}%` : `${ticker.change24h}%`}
                    </span>
                  </td>

                  {/* 24h Volume */}
                  <td className="py-3 px-4 text-right text-[#94a3b8] hidden md:table-cell">
                    {formatVolume(ticker.volume24h)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
