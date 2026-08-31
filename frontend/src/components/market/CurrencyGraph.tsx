import React, { useState } from 'react';
import { Network, Sparkles, Eye, Info, RefreshCw } from 'lucide-react';
import { useMarket } from '../../context/MarketContext';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface NodePos {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  type: 'crypto' | 'fiat';
}

const NODES: NodePos[] = [
  { id: 'USDT', name: 'Tether USD', x: 260, y: 170, color: '#22c55e', type: 'crypto' },
  { id: 'BTC', name: 'Bitcoin', x: 130, y: 80, color: '#f59e0b', type: 'crypto' },
  { id: 'ETH', name: 'Ethereum', x: 390, y: 80, color: '#3b82f6', type: 'crypto' },
  { id: 'SOL', name: 'Solana', x: 100, y: 250, color: '#06ffa5', type: 'crypto' },
  { id: 'BNB', name: 'Binance Coin', x: 410, y: 250, color: '#eab308', type: 'crypto' },
  { id: 'EUR', name: 'Euro', x: 260, y: 310, color: '#60a5fa', type: 'fiat' },
];

interface EdgeLine {
  from: string;
  to: string;
  rate: string;
}

const EDGES: EdgeLine[] = [
  { from: 'BTC', to: 'USDT', rate: '64,250' },
  { from: 'ETH', to: 'USDT', rate: '3,480' },
  { from: 'ETH', to: 'BTC', rate: '0.0541' },
  { from: 'SOL', to: 'USDT', rate: '152.4' },
  { from: 'SOL', to: 'BTC', rate: '0.00237' },
  { from: 'BNB', to: 'USDT', rate: '592.2' },
  { from: 'BNB', to: 'ETH', rate: '0.1702' },
  { from: 'EUR', to: 'USDT', rate: '1.085' },
  { from: 'BTC', to: 'EUR', rate: '59,188' },
];

export const CurrencyGraph: React.FC = () => {
  const { activeAlert, opportunities, setSelectedOpportunity } = useMarket();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const activePath = activeAlert ? activeAlert.path : opportunities[0]?.path || ['USDT', 'BTC', 'ETH', 'USDT'];

  const isEdgeInCycle = (from: string, to: string) => {
    for (let i = 0; i < activePath.length - 1; i++) {
      if (
        (activePath[i] === from && activePath[i + 1] === to) ||
        (activePath[i] === to && activePath[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  const getNodeCoord = (id: string) => {
    return NODES.find((n) => n.id === id) || { x: 260, y: 170 };
  };

  return (
    <Card
      className="p-0 border-[#1e293b] bg-[#111827]"
      hoverable={false}
      header={
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#06ffa5]" />
          <span>Currency Exchange Network Graph</span>
        </div>
      }
      headerRight={
        <div className="flex items-center gap-2">
          <Badge variant="neon" size="sm" dot glow>
            SPFA Negative Cycle Highlighted
          </Badge>
        </div>
      }
    >
      {/* Graph Subheader description */}
      <div className="p-4 pb-2 flex items-center justify-between text-xs text-[#94a3b8] border-b border-[#1e293b]/60 bg-[#0d1322]/30">
        <div className="flex items-center gap-2">
          <span className="text-[#06ffa5] font-mono font-semibold">Active Arbitrage Ring:</span>
          <span className="font-mono text-white bg-[#06ffa5]/10 px-2 py-0.5 rounded border border-[#06ffa5]/30">
            {activePath.join(' ➔ ')}
          </span>
        </div>
        {activeAlert && (
          <button
            onClick={() => setSelectedOpportunity(activeAlert)}
            className="text-xs text-[#06ffa5] hover:underline font-mono flex items-center gap-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Inspect Path ({activeAlert.netProfitPercent > 0 ? `+${activeAlert.netProfitPercent}%` : `${activeAlert.netProfitPercent}%`})
          </button>
        )}
      </div>

      {/* SVG Interactive Graph Canvas */}
      <div className="relative w-full h-[140px] sm:h-[150px] bg-[#0a0e17] flex items-center justify-center overflow-hidden select-none">
        {/* Radar Background grid rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[280px] h-[280px] rounded-full border border-[#1e293b]" />
          <div className="w-[180px] h-[180px] rounded-full border border-[#1e293b] absolute" />
          <div className="w-[100px] h-[100px] rounded-full border border-[#1e293b] absolute" />
          <div className="w-full h-[1px] bg-[#1e293b] absolute" />
          <div className="h-full w-[1px] bg-[#1e293b] absolute" />
        </div>

        <svg className="w-full h-full max-w-[500px]" viewBox="0 0 520 360">
          <defs>
            {/* Glow filters */}
            <filter id="neon-glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Arrow marker */}
            <marker
              id="neon-arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#06ffa5" />
            </marker>
          </defs>

          {/* Render Edges */}
          {EDGES.map((edge) => {
            const p1 = getNodeCoord(edge.from);
            const p2 = getNodeCoord(edge.to);
            const inCycle = isEdgeInCycle(edge.from, edge.to);

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={inCycle ? '#06ffa5' : '#1e293b'}
                  strokeWidth={inCycle ? 2.5 : 1.2}
                  strokeDasharray={inCycle ? '6 3' : 'none'}
                  className={inCycle ? 'animate-pulse' : ''}
                  filter={inCycle ? 'url(#neon-glow-filter)' : undefined}
                />
                {/* Midpoint Rate Label */}
                <text
                  x={(p1.x + p2.x) / 2}
                  y={(p1.y + p2.y) / 2 - 4}
                  fill={inCycle ? '#06ffa5' : '#64748b'}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  className="pointer-events-none"
                  fontWeight={inCycle ? 'bold' : 'normal'}
                >
                  {edge.rate}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {NODES.map((node) => {
            const isInPath = activePath.includes(node.id);
            const isHovered = hoveredNode === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-all"
              >
                {/* Node Outer Ring / Pulse */}
                {isInPath && (
                  <circle
                    r="22"
                    fill="none"
                    stroke="#06ffa5"
                    strokeWidth="1.5"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Node Base Circle */}
                <circle
                  r={isHovered ? 18 : 16}
                  fill="#111827"
                  stroke={isInPath ? '#06ffa5' : isHovered ? '#3b82f6' : '#1e293b'}
                  strokeWidth={isInPath ? 2.5 : 1.5}
                  filter={isInPath ? 'url(#neon-glow-filter)' : undefined}
                />

                {/* Inner dot */}
                <circle r="4" fill={node.color} />

                {/* Symbol Label */}
                <text
                  y="28"
                  fill={isInPath ? '#06ffa5' : '#e2e8f0'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {node.id}
                </text>

                {/* Hover Tooltip name */}
                {isHovered && (
                  <text
                    y="-22"
                    fill="#38bdf8"
                    fontSize="10"
                    fontFamily="Inter, sans-serif"
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Legend */}
        <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[11px] font-mono text-[#94a3b8] bg-[#111827]/90 px-3 py-1.5 rounded-lg border border-[#1e293b] backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 bg-[#06ffa5] rounded-sm shadow-[0_0_8px_#06ffa5]" />
            <span className="text-[#06ffa5]">Arbitrage Path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 bg-[#1e293b] rounded-sm" />
            <span>Standard Market Edge</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
