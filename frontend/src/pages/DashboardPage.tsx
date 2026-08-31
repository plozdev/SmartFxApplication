import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  Activity,
  Network,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { Ticker, ArbitrageOpportunity } from '../types';
import { CurrencyGraph } from '../components/market/CurrencyGraph';

export const DashboardPage: React.FC = () => {
  const {
    tickers,
    opportunities,
    setSelectedOpportunity,
    triggerManualArbitrageScan,
    systemStats,
  } = useMarket();

  // Active selected ticker for the center chart
  const [selectedSymbol, setSelectedSymbol] = useState<string>('BTC/USDT');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '4H' | '1D' | '1W'>('1H');
  const [centerTab, setCenterTab] = useState<'positions' | 'graph'>('positions');
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);

  const currentTicker: Ticker = useMemo(() => {
    return tickers.find((t) => t.symbol === selectedSymbol) || tickers[0];
  }, [tickers, selectedSymbol]);

  // Synthetic price points for chart rendering
  const chartPoints = useMemo(() => {
    const basePrice = currentTicker.lastPrice;
    const isUp = currentTicker.change24h >= 0;
    const points: number[] = [];
    const count = 12;
    let curr = isUp ? basePrice * 0.96 : basePrice * 1.04;
    for (let i = 0; i < count; i++) {
      const noise = (Math.sin(i * 1.3) + (Math.random() - 0.48)) * (basePrice * 0.015);
      curr = curr + (basePrice - curr) * 0.18 + noise;
      points.push(curr);
    }
    points[count - 1] = basePrice;
    return points;
  }, [currentTicker]);

  // Generate SVG polyline string normalized to 400x120 viewBox
  const svgPolyline = useMemo(() => {
    if (chartPoints.length === 0) return '0,60 400,60';
    const min = Math.min(...chartPoints);
    const max = Math.max(...chartPoints);
    const range = max - min || 1;
    const width = 400;
    const height = 110;
    const padding = 15;

    return chartPoints
      .map((p, idx) => {
        const x = (idx / (chartPoints.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - padding * 2) - padding;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [chartPoints]);

  const handleQuickTrade = (action: 'BUY' | 'SELL') => {
    setTradeMessage(`Executed ${action} order on ${currentTicker.symbol} @ $${currentTicker.lastPrice.toLocaleString()}`);
    setTimeout(() => {
      setTradeMessage(null);
    }, 2800);
  };

  return (
    <div className="h-full w-full p-2.5 sm:p-3 overflow-y-auto lg:overflow-hidden select-none" id="high-density-dashboard">
      <div className="grid grid-cols-12 gap-2.5 sm:gap-3 h-full">
        {/* ========================================================
            COLUMN 1: MARKETS LIVE VIEW (3 of 12 cols on desktop)
           ======================================================== */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col space-y-2.5 sm:space-y-3 h-auto lg:h-full lg:overflow-hidden">
          <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-3 flex-1 flex flex-col overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5 px-1 flex-shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Markets
              </h3>
              <span className="text-[10px] font-mono text-blue-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Live View
              </span>
            </div>

            {/* Markets List */}
            <div className="space-y-1 flex-1 overflow-y-auto font-mono text-[11px] pr-0.5 custom-scroll">
              {tickers.map((t) => {
                const isSelected = t.symbol === selectedSymbol;
                const isPos = t.change24h >= 0;
                const isHotArbitrage = t.symbol === 'BTC/USDT' || t.symbol === 'ETH/BTC' || t.symbol === 'SOL/USDT';

                return (
                  <div
                    key={t.symbol}
                    onClick={() => setSelectedSymbol(t.symbol)}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#1a2332] border-[#1e293b] shadow-inner text-white font-bold'
                        : 'hover:bg-[#1a2332] border-transparent hover:border-[#1e293b] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className={isSelected ? 'text-white' : 'text-slate-200'}>
                        {t.symbol}
                      </span>
                      {isHotArbitrage && (
                        <span className="text-[9px] text-[#06ffa5] font-normal" title="Active in SPFA Ring">
                          ★
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <span
                        className={
                          isHotArbitrage && isSelected
                            ? 'text-[#06ffa5]'
                            : isPos
                            ? 'text-[#22c55e]'
                            : 'text-[#ef4444]'
                        }
                      >
                        {t.lastPrice >= 1000
                          ? t.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                          : t.lastPrice.toFixed(4)}
                      </span>
                      <span
                        className={`text-[9px] ${
                          isPos ? 'text-[#22c55e]' : 'text-[#ef4444]'
                        }`}
                      >
                        {isPos ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Button */}
            <button
              onClick={triggerManualArbitrageScan}
              className="mt-2.5 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors text-white cursor-pointer shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
              id="markets-add-asset-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Asset / Scan</span>
            </button>
          </div>
        </aside>

        {/* ========================================================
            COLUMN 2: CHART & POSITIONS / NETWORK (6 of 12 cols)
           ======================================================== */}
        <section className="col-span-12 lg:col-span-6 flex flex-col space-y-2.5 sm:space-y-3 h-auto lg:h-full lg:overflow-hidden">
          {/* Top Panel: Chart & Ticker Stats */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-3.5 sm:p-4 flex-1 flex flex-col relative overflow-hidden shadow-sm">
            {/* Header: Symbol, Delta, Timeframe & Current Price */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center">
                  {currentTicker.symbol}
                  <span
                    className={`text-xs font-mono ml-2 ${
                      currentTicker.change24h >= 0 ? 'text-[#06ffa5]' : 'text-[#ef4444]'
                    }`}
                  >
                    {currentTicker.change24h >= 0 ? `+${currentTicker.change24h}%` : `${currentTicker.change24h}%`}
                  </span>
                </h2>

                <div className="flex bg-[#0a0e17] rounded p-0.5 text-[10px] space-x-1 border border-[#1e293b]">
                  {(['1H', '4H', '1D', '1W'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-2 py-0.5 rounded cursor-pointer font-mono font-medium transition-colors ${
                        selectedTimeframe === tf
                          ? 'bg-blue-600 text-white font-bold'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                  Current Price
                </div>
                <div className="text-lg sm:text-xl font-mono font-bold text-white">
                  ${currentTicker.lastPrice >= 100
                    ? currentTicker.lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : currentTicker.lastPrice.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Price Chart & Depth Bar Simulation */}
            <div className="flex-1 border-b border-[#1e293b] relative min-h-[140px] flex items-center justify-center overflow-hidden">
              {/* Background Volume Depth Bars */}
              <div className="absolute inset-0 flex items-end justify-between px-2 opacity-30 pointer-events-none">
                <div className="h-[40%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
                <div className="h-[55%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
                <div className="h-[45%] w-3 sm:w-4 bg-red-500/20 border-t border-red-500"></div>
                <div className="h-[70%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
                <div className="h-[60%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
                <div className="h-[80%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
                <div className="h-[75%] w-3 sm:w-4 bg-red-500/20 border-t border-red-500"></div>
                <div className="h-[90%] w-3 sm:w-4 bg-[#06ffa5]/20 border-t border-[#06ffa5]"></div>
                <div className="h-[85%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
                <div className="h-[95%] w-3 sm:w-4 bg-green-500/20 border-t border-green-500"></div>
              </div>

              {/* Foreground Multi-point SVG Curve */}
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={svgPolyline}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Trade execution floating toast */}
              {tradeMessage && (
                <div className="absolute top-2 right-2 bg-blue-600/90 text-white px-3 py-1 rounded text-xs font-mono font-semibold shadow-lg animate-in fade-in">
                  {tradeMessage}
                </div>
              )}
            </div>

            {/* 24h Metrics (High / Low / Volume) */}
            <div className="h-16 grid grid-cols-3 gap-3 pt-3 text-center flex-shrink-0">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 font-mono">
                  24h High
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-slate-200">
                  ${(currentTicker.lastPrice * 1.025).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 font-mono">
                  24h Low
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-slate-200">
                  ${(currentTicker.lastPrice * 0.978).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 font-mono">
                  Volume (24h)
                </div>
                <div className="font-mono text-xs sm:text-sm font-semibold text-blue-400">
                  {(currentTicker.volume24h / 1e6).toFixed(1)}M USDT
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Open Positions & Network View Switcher */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-3 h-48 lg:h-52 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCenterTab('positions')}
                  className={`text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                    centerTab === 'positions' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Open Positions
                </button>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => setCenterTab('graph')}
                  className={`text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors ${
                    centerTab === 'graph' ? 'text-[#06ffa5]' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Network Graph
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500">
                {centerTab === 'positions' ? '2 Active Bots' : 'SPFA 6 Nodes'}
              </span>
            </div>

            {centerTab === 'positions' ? (
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="text-slate-500 border-b border-[#1e293b]">
                    <tr>
                      <th className="pb-1.5 font-semibold">Pair</th>
                      <th className="pb-1.5 font-semibold">Type</th>
                      <th className="pb-1.5 font-semibold">Entry</th>
                      <th className="pb-1.5 font-semibold">Current</th>
                      <th className="pb-1.5 font-semibold text-right">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300 divide-y divide-[#1e293b]/50">
                    <tr className="hover:bg-[#1a2332]/50 transition-colors">
                      <td className="py-2 font-sans font-bold text-white">BTC/USDT</td>
                      <td className="py-2 text-green-500 font-semibold">Long 20x</td>
                      <td className="py-2 text-slate-400">48,220</td>
                      <td className="py-2 text-slate-200">
                        {tickers.find((t) => t.symbol === 'BTC/USDT')?.lastPrice.toLocaleString() || '51,204'}
                      </td>
                      <td className="py-2 text-[#06ffa5] font-bold text-right">+$1,452.12</td>
                    </tr>
                    <tr className="hover:bg-[#1a2332]/50 transition-colors">
                      <td className="py-2 font-sans font-bold text-white">ETH/USDT</td>
                      <td className="py-2 text-red-500 font-semibold">Short 10x</td>
                      <td className="py-2 text-slate-400">3,012</td>
                      <td className="py-2 text-slate-200">
                        {tickers.find((t) => t.symbol === 'ETH/USDT')?.lastPrice.toLocaleString() || '2,982'}
                      </td>
                      <td className="py-2 text-[#22c55e] font-bold text-right">+$410.05</td>
                    </tr>
                    <tr className="hover:bg-[#1a2332]/50 transition-colors">
                      <td className="py-2 font-sans font-bold text-white">SOL/USDT</td>
                      <td className="py-2 text-[#3b82f6] font-semibold">SPFA Ring</td>
                      <td className="py-2 text-slate-400">148.50</td>
                      <td className="py-2 text-slate-200">152.40</td>
                      <td className="py-2 text-[#06ffa5] font-bold text-right">+$118.90</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden">
                <CurrencyGraph />
              </div>
            )}
          </div>
        </section>

        {/* ========================================================
            COLUMN 3: ARBITRAGE SCAN & QUICK TRADE (3 of 12 cols)
           ======================================================== */}
        <aside className="col-span-12 lg:col-span-3 flex flex-col space-y-2.5 sm:space-y-3 h-auto lg:h-full lg:overflow-hidden">
          {/* Top Panel: Arbitrage Scan & Portfolio Balance */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-3 flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Arbitrage Scan
              </h3>
              <span className="text-[10px] font-mono text-[#06ffa5] animate-pulse">
                ● Live SPFA
              </span>
            </div>

            {/* Opportunities List */}
            <div className="space-y-2 flex-1 overflow-y-auto pr-0.5 custom-scroll">
              {opportunities.length > 0 ? (
                opportunities.map((opp, idx) => {
                  return (
                    <div
                      key={opp.id || idx}
                      onClick={() => setSelectedOpportunity(opp)}
                      className="p-2 bg-[#0a0e17] border-l-2 border-[#06ffa5] rounded-r cursor-pointer hover:bg-[#1a2332] transition-colors group"
                    >
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span className="truncate">{opp.path.slice(0, 3).join(' ➔ ')}</span>
                        <span className="text-[#06ffa5] font-bold ml-1">
                          +{opp.netProfitPercent}% Spread
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white group-hover:text-[#06ffa5] transition-colors truncate">
                        {opp.path.join(' → ')} Arbitrage
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono flex justify-between items-center">
                        <span>Est Profit: <span className="text-[#22c55e] font-semibold">+${opp.profitUsd.toFixed(2)}</span></span>
                        <span className="text-blue-400 group-hover:underline">Inspect ➔</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="p-2 bg-[#0a0e17] border-l-2 border-[#06ffa5] rounded-r cursor-pointer hover:bg-[#1a2332] transition-colors">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>Binance ➔ Kraken</span>
                      <span className="text-[#06ffa5] font-bold">0.82% Spread</span>
                    </div>
                    <div className="text-xs font-bold text-white">ETH/BTC Arbitrage Found</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Estimated Profit: $42.10</div>
                  </div>

                  <div className="p-2 bg-[#0a0e17] border-l-2 border-[#06ffa5] rounded-r cursor-pointer hover:bg-[#1a2332] transition-colors">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>Coinbase ➔ Bybit</span>
                      <span className="text-[#06ffa5] font-bold">1.14% Spread</span>
                    </div>
                    <div className="text-xs font-bold text-white">SOL/USDT Flash Opp</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Estimated Profit: $118.90</div>
                  </div>

                  <div className="p-2 bg-[#0a0e17] border-l-2 border-slate-700 rounded-r opacity-50">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>Binance ➔ OKX</span>
                      <span className="text-slate-500 font-bold">0.02% Spread</span>
                    </div>
                    <div className="text-xs font-bold text-white">DOT/USDT Low Liquidity</div>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">Scanning...</div>
                  </div>
                </>
              )}
            </div>

            {/* Portfolio Balance Box */}
            <div className="mt-2.5 p-3 bg-blue-900/20 border border-blue-500/30 rounded flex-shrink-0">
              <div className="text-[10px] text-blue-400 font-bold uppercase mb-1 tracking-wider font-mono">
                Portfolio Balance
              </div>
              <div className="text-xl font-mono font-bold text-white">
                $42,892.44
              </div>
              <div className="text-[10px] text-[#22c55e] mt-1 font-mono font-semibold">
                +${(1220.10 + systemStats.totalProfitTodayUsd).toFixed(2)} (Today)
              </div>
            </div>
          </div>

          {/* Bottom Panel: Quick Trade */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-lg p-3 h-28 flex flex-col justify-center text-center shadow-sm flex-shrink-0">
            <div className="text-[10px] text-slate-500 uppercase mb-2 font-mono tracking-wider">
              Quick Trade ({currentTicker.symbol})
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleQuickTrade('SELL')}
                className="flex-1 py-2 bg-[#ef4444] hover:bg-red-600 text-white rounded text-xs font-bold uppercase tracking-tight transition-colors cursor-pointer shadow-sm"
                id="quick-trade-sell-btn"
              >
                Sell
              </button>
              <button
                onClick={() => handleQuickTrade('BUY')}
                className="flex-1 py-2 bg-[#22c55e] hover:bg-green-600 text-white rounded text-xs font-bold uppercase tracking-tight transition-colors cursor-pointer shadow-sm"
                id="quick-trade-buy-btn"
              >
                Buy
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
