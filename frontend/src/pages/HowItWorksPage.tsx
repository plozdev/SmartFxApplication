import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Calculator,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const HowItWorksPage: React.FC = () => {
  // Interactive Simulator State
  const [btcUsdtAsk, setBtcUsdtAsk] = useState<number>(64250.0);
  const [ethBtcAsk, setEthBtcAsk] = useState<number>(0.05415);
  const [ethUsdtBid, setEthUsdtBid] = useState<number>(3498.5);
  const [feePercent, setFeePercent] = useState<number>(0.1);
  const [baseCapital, setBaseCapital] = useState<number>(1000);

  const feeFactor = 1 - feePercent / 100;

  // Edge 1: USDT -> BTC (Buy BTC at ask)
  const rate1 = 1 / btcUsdtAsk;
  const w1 = -Math.log(rate1 * feeFactor);

  // Edge 2: BTC -> ETH (Buy ETH at ask)
  const rate2 = 1 / ethBtcAsk;
  const w2 = -Math.log(rate2 * feeFactor);

  // Edge 3: ETH -> USDT (Sell ETH at bid)
  const rate3 = ethUsdtBid;
  const w3 = -Math.log(rate3 * feeFactor);

  const sumWeight = w1 + w2 + w3;
  const multiplier = Math.exp(-sumWeight);
  const netProfitPercent = (multiplier - 1) * 100;
  const finalCapital = baseCapital * multiplier;
  const netProfitUsd = finalCapital - baseCapital;
  const isArbitrage = sumWeight < 0;

  const resetSimulator = () => {
    setBtcUsdtAsk(64250.0);
    setEthBtcAsk(0.05415);
    setEthUsdtBid(3498.5);
    setFeePercent(0.1);
    setBaseCapital(1000);
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4 max-w-5xl mx-auto select-none" id="how-it-works-view">
      {/* Hero Header */}
      <div className="rounded-lg border border-[#1e293b] bg-gradient-to-br from-[#111827] via-[#0d1322] to-[#111827] p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#06ffa5]/20 text-[#06ffa5] border border-[#06ffa5]/30">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white font-sans">
              SmartFX 2.0 Algorithmic Architecture
            </h1>
            <p className="text-[10px] font-mono text-[#94a3b8]">
              SPFA Negative Cycle Detection & Mathematical Proof
            </p>
          </div>
        </div>
        <p className="text-xs text-[#cbd5e1] leading-relaxed max-w-3xl">
          In cryptocurrency and forex markets, triangular arbitrage opportunities exist when the exchange rates between three or more currencies diverge from equilibrium. SmartFX transforms this multiplicative arbitrage search into an additive graph shortest-path problem by taking negative logarithms of the fee-adjusted exchange rates.
        </p>
      </div>

      {/* 3 Core Mathematical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card
          className="border-[#1e293b] bg-[#111827]"
          hoverable
          header={
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b82f6]/20 text-[#3b82f6] font-mono text-xs font-bold">
                1
              </span>
              <span>Graph Modeling</span>
            </div>
          }
        >
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Currencies (BTC, ETH, USDT, SOL) form graph <span className="font-mono text-white">vertices V</span>. Order books form directed <span className="font-mono text-white">edges E</span> with conversion rate R(u &rarr; v).
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0e17] p-3 border border-[#1e293b] text-xs font-mono text-[#38bdf8]">
            V = {'{USDT, BTC, ETH, ...}'}
            <br />
            E = (u, v) with rate R
          </div>
        </Card>

        <Card
          className="border-[#1e293b] bg-[#111827]"
          hoverable
          header={
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#06ffa5]/20 text-[#06ffa5] font-mono text-xs font-bold">
                2
              </span>
              <span>Log Transformation</span>
            </div>
          }
        >
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Arbitrage requires &prod; R_i &gt; 1. By applying w = -ln(R_i &times; (1 - fee)), the product becomes an additive sum:
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0e17] p-3 border border-[#1e293b] text-xs font-mono text-[#06ffa5]">
            &Sigma; w_i &lt; 0 &hArr; &prod; R_i &gt; 1
            <br />
            Negative Cycle = Profit!
          </div>
        </Card>

        <Card
          className="border-[#1e293b] bg-[#111827]"
          hoverable
          header={
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22c55e]/20 text-[#22c55e] font-mono text-xs font-bold">
                3
              </span>
              <span>SPFA Algorithm</span>
            </div>
          }
        >
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            SPFA is a queue-optimized Bellman-Ford variant. It runs in $O(k \cdot |E|)$ average time, ideal for millisecond orderbook ticks.
          </p>
          <div className="mt-4 rounded-lg bg-[#0a0e17] p-3 border border-[#1e293b] text-xs font-mono text-[#22c55e]">
            Detects cycles when node is relaxed &ge; |V| times.
          </div>
        </Card>
      </div>

      {/* INTERACTIVE ARBITRAGE SIMULATOR SANDBOX */}
      <Card
        className="border-[#06ffa5]/40 bg-[#111827] shadow-[0_0_20px_rgba(6,255,165,0.1)]"
        hoverable={false}
        header={
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#06ffa5]" />
            <span className="text-white font-bold">Interactive SPFA Cycle Simulator & Mathematical Sandbox</span>
          </div>
        }
        headerRight={
          <button
            onClick={resetSimulator}
            className="text-xs font-mono text-[#94a3b8] hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reset Rates
          </button>
        }
      >
        <div className="space-y-6">
          <p className="text-xs text-[#94a3b8]">
            Adjust live orderbook rates to simulate arbitrage discrepancies. Watch the logarithmic weights ($w_1, w_2, w_3$), the total cycle sum ($\sum w$), and the derived net profit percentage update dynamically in real time:
          </p>

          {/* Interactive Sliders / Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Leg 1 */}
            <div className="rounded-xl border border-[#1e293b] bg-[#0a0e17] p-4 space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] block">
                Leg 1: USDT ➔ BTC (Ask Price)
              </span>
              <input
                type="number"
                step="50"
                value={btcUsdtAsk}
                onChange={(e) => setBtcUsdtAsk(Number(e.target.value))}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#3b82f6]"
              />
              <span className="text-[10px] font-mono text-[#64748b] block">
                w₁ = -ln(1/{btcUsdtAsk} × {feeFactor.toFixed(3)}) ={' '}
                <span className="text-white">{w1.toFixed(4)}</span>
              </span>
            </div>

            {/* Leg 2 */}
            <div className="rounded-xl border border-[#1e293b] bg-[#0a0e17] p-4 space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] block">
                Leg 2: BTC ➔ ETH (Ask Price)
              </span>
              <input
                type="number"
                step="0.0001"
                value={ethBtcAsk}
                onChange={(e) => setEthBtcAsk(Number(e.target.value))}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#3b82f6]"
              />
              <span className="text-[10px] font-mono text-[#64748b] block">
                w₂ = -ln(1/{ethBtcAsk} × {feeFactor.toFixed(3)}) ={' '}
                <span className="text-white">{w2.toFixed(4)}</span>
              </span>
            </div>

            {/* Leg 3 */}
            <div className="rounded-xl border border-[#1e293b] bg-[#0a0e17] p-4 space-y-2">
              <span className="text-[11px] font-mono text-[#94a3b8] block">
                Leg 3: ETH ➔ USDT (Bid Price)
              </span>
              <input
                type="number"
                step="1"
                value={ethUsdtBid}
                onChange={(e) => setEthUsdtBid(Number(e.target.value))}
                className="w-full bg-[#111827] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#3b82f6]"
              />
              <span className="text-[10px] font-mono text-[#64748b] block">
                w₃ = -ln({ethUsdtBid} × {feeFactor.toFixed(3)}) ={' '}
                <span className="text-white">{w3.toFixed(4)}</span>
              </span>
            </div>
          </div>

          {/* Real-time Math Output Card */}
          <div
            className={`rounded-xl border p-5 transition-all ${
              isArbitrage
                ? 'border-[#06ffa5]/50 bg-[#06ffa5]/5 shadow-[0_0_20px_rgba(6,255,165,0.15)]'
                : 'border-[#ef4444]/40 bg-[#ef4444]/5'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={isArbitrage ? 'neon' : 'loss'} size="md" dot>
                    {isArbitrage ? 'ARBITRAGE NEGATIVE CYCLE CONFIRMED' : 'NO ARBITRAGE (POSITIVE CYCLE)'}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1 font-mono text-xs">
                  <p className="text-[#94a3b8]">
                    Cycle Weight Sum: <span className="text-white">&Sigma;w = {w1.toFixed(4)} + {w2.toFixed(4)} + {w3.toFixed(4)} = </span>
                    <span className={`font-bold ${isArbitrage ? 'text-[#06ffa5]' : 'text-[#ef4444]'}`}>
                      {sumWeight.toFixed(5)}
                    </span>
                  </p>
                  <p className="text-[#94a3b8]">
                    Multiplier Factor: <span className="text-white">e^(-(&Sigma;w)) = </span>
                    <span className="text-[#38bdf8] font-bold">{multiplier.toFixed(5)}</span>
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-[#94a3b8]">Calculated Net Return</span>
                <p className={`text-2xl font-black ${isArbitrage ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {netProfitPercent >= 0 ? `+${netProfitPercent.toFixed(3)}%` : `${netProfitPercent.toFixed(3)}%`}
                </p>
                <p className="text-xs text-[#94a3b8]">
                  ${baseCapital.toFixed(2)} ➔ ${finalCapital.toFixed(2)} USD (
                  <span className={netProfitUsd >= 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                    {netProfitUsd >= 0 ? `+$${netProfitUsd.toFixed(2)}` : `-$${Math.abs(netProfitUsd).toFixed(2)}`}
                  </span>
                  )
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
