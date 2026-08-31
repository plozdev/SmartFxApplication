import React from 'react';
import {
  X,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calculator,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const OpportunityDetailModal: React.FC = () => {
  const { selectedOpportunity, setSelectedOpportunity } = useMarket();

  if (!selectedOpportunity) return null;

  const opp = selectedOpportunity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      id="opportunity-detail-modal"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-[#1e293b] bg-[#111827] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0d1322]/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="text-xs font-mono text-[#94a3b8] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← Back
            </button>
            <span className="text-[#64748b]">|</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white uppercase">
                Arbitrage Opportunity
              </span>
              <span className="font-mono text-xs text-[#64748b]">#{opp.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="neon" size="md" dot glow>
              +{opp.netProfitPercent}% Net Profit
            </Badge>
            <button
              onClick={() => setSelectedOpportunity(null)}
              className="rounded-lg p-1 text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* SECTION 1: VISUAL EXECUTION PATH */}
          <div className="rounded-xl border border-[#1e293b] bg-[#0a0e17] p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#3b82f6]" /> Visual Execution Path
              </span>
              <span className="text-xs font-mono text-[#22c55e] font-semibold">
                Simulated on $1,000.00 Base Capital
              </span>
            </div>

            {/* Path Pipeline Diagram */}
            <div className="flex flex-wrap items-center justify-between gap-3 py-4 px-2">
              {opp.steps.map((step, idx) => (
                <React.Fragment key={idx}>
                  {/* Step Input Box */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-[#64748b] mb-1">
                      {idx === 0 ? 'START' : `STEP ${idx}`}
                    </span>
                    <div className="rounded-lg border border-[#1e293b] bg-[#111827] px-3.5 py-2 text-center shadow-md">
                      <p className="text-xs font-mono font-bold text-white">
                        {step.inputAmount >= 100
                          ? step.inputAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : step.inputAmount.toFixed(5)}{' '}
                        <span className="text-[#3b82f6]">{step.inputCurrency}</span>
                      </p>
                    </div>
                  </div>

                  {/* Transition Arrow with Action Badge */}
                  <div className="flex flex-col items-center my-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border mb-1 ${
                        step.action === 'BUY'
                          ? 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30'
                          : 'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/30'
                      }`}
                    >
                      {step.action} {step.outputCurrency}
                    </span>
                    <div className="flex items-center text-[#06ffa5]">
                      <div className="w-6 h-[2px] bg-[#06ffa5]" />
                      <ArrowRight className="w-4 h-4 -ml-1" />
                    </div>
                    <span className="text-[10px] font-mono text-[#94a3b8] mt-1">
                      @{typeof step.rate === 'number' && step.rate >= 100 ? step.rate.toLocaleString() : step.rate}
                    </span>
                  </div>
                </React.Fragment>
              ))}

              {/* Final Output Box */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono text-[#06ffa5] mb-1 font-bold">
                  FINAL RETURN
                </span>
                <div className="rounded-lg border border-[#06ffa5]/60 bg-[#06ffa5]/10 px-3.5 py-2 text-center shadow-[0_0_15px_rgba(6,255,165,0.2)]">
                  <p className="text-xs font-mono font-bold text-[#06ffa5]">
                    {opp.expectedOutput.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    <span>USDT</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Profit Callout Banner */}
            <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono">
              <span className="text-[#94a3b8]">Net Outcome after fees:</span>
              <div className="flex items-center gap-2">
                <span className="text-[#22c55e] font-bold text-sm">
                  💰 Net Profit: +${opp.profitUsd.toFixed(2)} (+{opp.netProfitPercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: EXECUTION STEPS LOG */}
          <div className="rounded-xl border border-[#1e293b] bg-[#0a0e17] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#1e293b] bg-[#0d1322]/80 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#94a3b8] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e]" /> Execution Steps Breakdown
              </span>
              <span className="text-[11px] font-mono text-[#64748b]">Taker Fee: 0.10% / leg</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#1e293b] bg-[#0d1322] text-[#94a3b8]">
                    <th className="py-2.5 px-4 font-semibold">Step</th>
                    <th className="py-2.5 px-4 font-semibold">Action</th>
                    <th className="py-2.5 px-4 font-semibold">Pair</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Rate</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount In</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount Out</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]/60">
                  {opp.steps.map((step) => (
                    <tr key={step.stepNumber} className="hover:bg-[#1a2332]/50">
                      <td className="py-2.5 px-4 text-white font-bold">{step.stepNumber}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            step.action === 'BUY'
                              ? 'bg-[#22c55e]/15 text-[#22c55e]'
                              : 'bg-[#3b82f6]/15 text-[#3b82f6]'
                          }`}
                        >
                          {step.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-[#e2e8f0] font-semibold">{step.pair}</td>
                      <td className="py-2.5 px-4 text-right text-[#94a3b8]">
                        {typeof step.rate === 'number' && step.rate >= 100
                          ? step.rate.toLocaleString(undefined, { minimumFractionDigits: 2 })
                          : step.rate}
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#e2e8f0]">
                        {step.inputAmount >= 100
                          ? step.inputAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : step.inputAmount.toFixed(5)}{' '}
                        {step.inputCurrency}
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#22c55e] font-semibold">
                        {step.outputAmount >= 100
                          ? step.outputAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : step.outputAmount.toFixed(5)}{' '}
                        {step.outputCurrency}
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#ef4444]">
                        -{step.feePercent}% ({step.feeAmount >= 0.01 ? step.feeAmount.toFixed(2) : step.feeAmount.toFixed(6)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="p-4 bg-[#0d1322] border-t border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="text-[#94a3b8]">
                Summary:{' '}
                <span className="text-white font-bold">
                  {opp.startAmount.toFixed(2)} {opp.path[0]}
                </span>{' '}
                →{' '}
                <span className="text-[#06ffa5] font-bold">
                  {opp.expectedOutput.toFixed(2)} {opp.path[opp.path.length - 1]}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Gross Profit: <span className="text-white">+{opp.grossProfitPercent}%</span>
                </span>
                <span className="text-[#64748b]">|</span>
                <span>
                  Total Fees: <span className="text-[#ef4444]">-{opp.totalFeesPercent}%</span>
                </span>
                <span className="text-[#64748b]">|</span>
                <span>
                  Net Profit: <span className="text-[#22c55e] font-bold">+{opp.netProfitPercent}%</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: HOW SPFA DETECTED THIS (MATHEMATICAL ENGINE) */}
          <div className="rounded-xl border border-[#1e293b] bg-[#0a0e17] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-[#06ffa5]" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                How SPFA (Shortest Path Faster Algorithm) Detected This
              </span>
            </div>

            <div className="space-y-4 text-xs font-mono text-[#94a3b8]">
              {/* Step 1: Graph Construction */}
              <div className="rounded-lg bg-[#111827] p-3.5 border border-[#1e293b]">
                <p className="font-bold text-white mb-2">1. Graph Transformation (Logarithmic Weights):</p>
                <p className="text-[#64748b] mb-2">
                  Arbitrage exists when product of rates &gt; 1. Taking $-\ln(R)$ maps multiplication into negative cycle shortest path problem:
                </p>
                <div className="space-y-1.5 bg-[#0a0e17] p-3 rounded border border-[#1e293b]/70">
                  {opp.steps.map((s, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        Edge {s.pair} ({s.action}):
                      </span>
                      <span className="text-[#e2e8f0]">
                        w = -ln({s.rate} × 0.999) ={' '}
                        <span className={s.edgeWeight < 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}>
                          {s.edgeWeight.toFixed(4)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Cycle Sum */}
              <div className="rounded-lg bg-[#111827] p-3.5 border border-[#1e293b]">
                <p className="font-bold text-white mb-2">2. Cycle Weight Summation ($\sum w$):</p>
                <div className="bg-[#0a0e17] p-3 rounded border border-[#1e293b]/70 flex items-center justify-between">
                  <span>
                    &Sigma;w ={' '}
                    {opp.steps.map((s) => `(${s.edgeWeight.toFixed(4)})`).join(' + ')}
                  </span>
                  <span className="font-bold text-[#06ffa5]">
                    = {opp.cycleSumWeight}{' '}
                    <span className="text-[#22c55e]">← NEGATIVE! (Arbitrage Confirmed)</span>
                  </span>
                </div>
              </div>

              {/* Step 3: Multiplier calculation */}
              <div className="rounded-lg bg-[#111827] p-3.5 border border-[#1e293b]">
                <p className="font-bold text-white mb-2">3. Profit Multiplier Derivation:</p>
                <div className="bg-[#0a0e17] p-3 rounded border border-[#1e293b]/70 space-y-1">
                  <div className="flex justify-between">
                    <span>Capital Multiplier = e^(-(&Sigma;w)):</span>
                    <span className="text-[#06ffa5] font-bold">
                      e^(-({opp.cycleSumWeight})) &approx; {(1 + opp.netProfitPercent / 100).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Profit Percentage:</span>
                    <span className="text-[#22c55e] font-bold">
                      ({(1 + opp.netProfitPercent / 100).toFixed(4)} - 1) &times; 100% = +{opp.netProfitPercent}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3 border-t border-[#1e293b] bg-[#0d1322] flex items-center justify-between">
          <span className="text-xs font-mono text-[#64748b]">
            Algorithmic verification completed in {opp.executionTimeMs} ms
          </span>
          <Button variant="secondary" size="sm" onClick={() => setSelectedOpportunity(null)}>
            Close View
          </Button>
        </div>
      </div>
    </div>
  );
};
