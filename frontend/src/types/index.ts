export type TabType = 'dashboard' | 'history' | 'how-it-works';

export interface Ticker {
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  bid: number;
  ask: number;
  lastPrice: number;
  change24h: number;
  spread: number;
  spreadPercent: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  updatedTimestamp: number;
  flashState: 'up' | 'down' | null;
  category: 'crypto' | 'forex';
}

export type TradeAction = 'BUY' | 'SELL';

export interface ArbitrageStep {
  stepNumber: number;
  action: TradeAction;
  pair: string;
  rate: number;
  inputCurrency: string;
  inputAmount: number;
  outputCurrency: string;
  outputAmount: number;
  feePercent: number;
  feeAmount: number;
  edgeWeight: number; // -ln(rate * (1 - fee))
  description: string;
}

export type OpportunityStatus = 'detected' | 'executing' | 'settled' | 'expired';

export interface ArbitrageOpportunity {
  id: string;
  timestamp: number;
  path: string[]; // e.g. ["USDT", "BTC", "ETH", "USDT"]
  pairs: string[]; // e.g. ["BTC/USDT", "ETH/BTC", "ETH/USDT"]
  steps: ArbitrageStep[];
  grossProfitPercent: number;
  totalFeesPercent: number;
  netProfitPercent: number;
  startAmount: number;
  expectedOutput: number;
  profitUsd: number;
  cycleSumWeight: number; // e.g. -0.0042
  status: OpportunityStatus;
  executionTimeMs: number;
  confidenceScore: number;
}

export interface GraphNode {
  id: string;
  symbol: string;
  name: string;
  x: number;
  y: number;
  category: 'crypto' | 'fiat';
  color?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  pair: string;
  rate: number;
  weight: number;
  isArbitrageCycle?: boolean;
}

export interface SystemStats {
  scanningActive: boolean;
  nodesCount: number;
  edgesCount: number;
  lastScanDurationMs: number;
  totalCyclesChecked: number;
  opportunitiesToday: number;
  totalProfitTodayUsd: number;
  avgNetProfitPercent: number;
  bestProfitTodayPercent: number;
  networkLatencyMs: number;
  connectedClients: number;
  algorithmName: string;
}
