import { ArbitrageOpportunity, ArbitrageStep, Ticker } from '../types';

export const TRADING_FEE = 0.001; // 0.1% standard taker fee per leg

export const INITIAL_TICKERS: Ticker[] = [
  {
    symbol: 'BTC/USDT',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
    bid: 64250.2,
    ask: 64251.8,
    lastPrice: 64251.0,
    change24h: 2.45,
    spread: 1.6,
    spreadPercent: 0.0025,
    volume24h: 842190000,
    high24h: 65100.0,
    low24h: 63800.0,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'ETH/USDT',
    baseCurrency: 'ETH',
    quoteCurrency: 'USDT',
    bid: 3480.1,
    ask: 3480.8,
    lastPrice: 3480.45,
    change24h: 3.12,
    spread: 0.7,
    spreadPercent: 0.0201,
    volume24h: 531200000,
    high24h: 3520.0,
    low24h: 3410.0,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'ETH/BTC',
    baseCurrency: 'ETH',
    quoteCurrency: 'BTC',
    bid: 0.05412,
    ask: 0.05415,
    lastPrice: 0.05414,
    change24h: 0.65,
    spread: 0.00003,
    spreadPercent: 0.0554,
    volume24h: 189400000,
    high24h: 0.0548,
    low24h: 0.0538,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'SOL/USDT',
    baseCurrency: 'SOL',
    quoteCurrency: 'USDT',
    bid: 152.4,
    ask: 152.5,
    lastPrice: 152.45,
    change24h: -1.18,
    spread: 0.1,
    spreadPercent: 0.0656,
    volume24h: 312000000,
    high24h: 158.0,
    low24h: 150.2,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'SOL/BTC',
    baseCurrency: 'SOL',
    quoteCurrency: 'BTC',
    bid: 0.002368,
    ask: 0.002372,
    lastPrice: 0.00237,
    change24h: -3.55,
    spread: 0.000004,
    spreadPercent: 0.1687,
    volume24h: 76000000,
    high24h: 0.00245,
    low24h: 0.00234,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'BNB/USDT',
    baseCurrency: 'BNB',
    quoteCurrency: 'USDT',
    bid: 592.1,
    ask: 592.4,
    lastPrice: 592.25,
    change24h: 1.84,
    spread: 0.3,
    spreadPercent: 0.0506,
    volume24h: 210000000,
    high24h: 605.0,
    low24h: 588.0,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'BNB/ETH',
    baseCurrency: 'BNB',
    quoteCurrency: 'ETH',
    bid: 0.1701,
    ask: 0.1703,
    lastPrice: 0.1702,
    change24h: -1.24,
    spread: 0.0002,
    spreadPercent: 0.1175,
    volume24h: 42000000,
    high24h: 0.174,
    low24h: 0.169,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'XRP/USDT',
    baseCurrency: 'XRP',
    quoteCurrency: 'USDT',
    bid: 0.584,
    ask: 0.5843,
    lastPrice: 0.5841,
    change24h: 4.82,
    spread: 0.0003,
    spreadPercent: 0.0513,
    volume24h: 195000000,
    high24h: 0.61,
    low24h: 0.56,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  },
  {
    symbol: 'EUR/USDT',
    baseCurrency: 'EUR',
    quoteCurrency: 'USDT',
    bid: 1.0852,
    ask: 1.0854,
    lastPrice: 1.0853,
    change24h: 0.08,
    spread: 0.0002,
    spreadPercent: 0.0184,
    volume24h: 89000000,
    high24h: 1.088,
    low24h: 1.083,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'forex',
  },
  {
    symbol: 'BTC/EUR',
    baseCurrency: 'BTC',
    quoteCurrency: 'EUR',
    bid: 59180.0,
    ask: 59195.0,
    lastPrice: 59188.0,
    change24h: 2.38,
    spread: 15.0,
    spreadPercent: 0.0253,
    volume24h: 112000000,
    high24h: 59800.0,
    low24h: 58600.0,
    updatedTimestamp: Date.now(),
    flashState: null,
    category: 'crypto',
  }
];

export function calculateEdgeWeight(rate: number, fee: number = TRADING_FEE): number {
  return -Math.log(rate * (1 - fee));
}

export function buildSyntheticArbitrage(tickers: Ticker[], customSeed?: number): ArbitrageOpportunity {
  const tickerMap = new Map(tickers.map((t) => [t.symbol, t]));
  const btcUsdt = tickerMap.get('BTC/USDT') || INITIAL_TICKERS[0];
  const ethBtc = tickerMap.get('ETH/BTC') || INITIAL_TICKERS[2];
  const ethUsdt = tickerMap.get('ETH/USDT') || INITIAL_TICKERS[1];

  const now = Date.now();
  const seed = customSeed !== undefined ? customSeed : Math.random();

  // Synthetic discrepancy factor: ~ 0.25% to 0.95% profit
  const boost = 1 + (0.0035 + seed * 0.0045);

  // Step 1: USDT -> BTC (BUY BTC using USDT at ask)
  const rate1 = 1 / btcUsdt.ask;
  const w1 = calculateEdgeWeight(rate1);

  // Step 2: BTC -> ETH (BUY ETH using BTC at ask)
  const rate2 = 1 / ethBtc.ask;
  const w2 = calculateEdgeWeight(rate2);

  // Step 3: ETH -> USDT (SELL ETH for USDT at bid * boost)
  const adjustedEthBid = ethUsdt.bid * boost;
  const rate3 = adjustedEthBid;
  const w3 = calculateEdgeWeight(rate3);

  const cycleWeightSum = w1 + w2 + w3;
  const multiplier = Math.exp(-cycleWeightSum);
  const netProfitPercent = (multiplier - 1) * 100;
  const grossMultiplier = (1 / btcUsdt.ask) * (1 / ethBtc.ask) * adjustedEthBid;
  const grossProfitPercent = (grossMultiplier - 1) * 100;
  const totalFeesPercent = grossProfitPercent - netProfitPercent;

  const startAmount = 1000; // $1,000 USDT baseline
  const btcAfterFee = (startAmount / btcUsdt.ask) * (1 - TRADING_FEE);
  const ethAfterFee = (btcAfterFee / ethBtc.ask) * (1 - TRADING_FEE);
  const usdtFinal = ethAfterFee * adjustedEthBid * (1 - TRADING_FEE);
  const profitUsd = usdtFinal - startAmount;

  const steps: ArbitrageStep[] = [
    {
      stepNumber: 1,
      action: 'BUY',
      pair: 'BTC/USDT',
      rate: btcUsdt.ask,
      inputCurrency: 'USDT',
      inputAmount: startAmount,
      outputCurrency: 'BTC',
      outputAmount: btcAfterFee,
      feePercent: TRADING_FEE * 100,
      feeAmount: (startAmount / btcUsdt.ask) * TRADING_FEE,
      edgeWeight: w1,
      description: `Buy BTC with USDT at ask price $${btcUsdt.ask.toLocaleString()}`,
    },
    {
      stepNumber: 2,
      action: 'BUY',
      pair: 'ETH/BTC',
      rate: ethBtc.ask,
      inputCurrency: 'BTC',
      inputAmount: btcAfterFee,
      outputCurrency: 'ETH',
      outputAmount: ethAfterFee,
      feePercent: TRADING_FEE * 100,
      feeAmount: (btcAfterFee / ethBtc.ask) * TRADING_FEE,
      edgeWeight: w2,
      description: `Buy ETH with BTC at ask price ${ethBtc.ask.toFixed(5)} BTC`,
    },
    {
      stepNumber: 3,
      action: 'SELL',
      pair: 'ETH/USDT',
      rate: adjustedEthBid,
      inputCurrency: 'ETH',
      inputAmount: ethAfterFee,
      outputCurrency: 'USDT',
      outputAmount: usdtFinal,
      feePercent: TRADING_FEE * 100,
      feeAmount: usdtFinal * TRADING_FEE,
      edgeWeight: w3,
      description: `Sell ETH for USDT at bid price $${adjustedEthBid.toFixed(2)}`,
    },
  ];

  return {
    id: `arb-${now.toString(36)}-${Math.floor(Math.random() * 1000).toString(36)}`,
    timestamp: now,
    path: ['USDT', 'BTC', 'ETH', 'USDT'],
    pairs: ['BTC/USDT', 'ETH/BTC', 'ETH/USDT'],
    steps,
    grossProfitPercent: Number(grossProfitPercent.toFixed(3)),
    totalFeesPercent: Number(totalFeesPercent.toFixed(3)),
    netProfitPercent: Number(netProfitPercent.toFixed(3)),
    startAmount,
    expectedOutput: Number(usdtFinal.toFixed(2)),
    profitUsd: Number(profitUsd.toFixed(2)),
    cycleSumWeight: Number(cycleWeightSum.toFixed(5)),
    status: 'detected',
    executionTimeMs: Math.floor(18 + Math.random() * 14),
    confidenceScore: 99.4,
  };
}

export function buildAlternativeArbitrage(type: 'sol' | 'bnb' | 'eur', tickers: Ticker[]): ArbitrageOpportunity {
  const now = Date.now();
  if (type === 'sol') {
    // USDT -> SOL -> BTC -> USDT
    const steps: ArbitrageStep[] = [
      {
        stepNumber: 1,
        action: 'BUY',
        pair: 'SOL/USDT',
        rate: 152.5,
        inputCurrency: 'USDT',
        inputAmount: 1000,
        outputCurrency: 'SOL',
        outputAmount: 6.551,
        feePercent: 0.1,
        feeAmount: 0.0065,
        edgeWeight: -5.0261,
        description: 'Buy SOL with USDT at ask price $152.50',
      },
      {
        stepNumber: 2,
        action: 'SELL',
        pair: 'SOL/BTC',
        rate: 0.002375,
        inputCurrency: 'SOL',
        inputAmount: 6.551,
        outputCurrency: 'BTC',
        outputAmount: 0.01554,
        feePercent: 0.1,
        feeAmount: 0.000015,
        edgeWeight: 6.0416,
        description: 'Sell SOL for BTC at bid price 0.002375 BTC',
      },
      {
        stepNumber: 3,
        action: 'SELL',
        pair: 'BTC/USDT',
        rate: 64550.0,
        inputCurrency: 'BTC',
        inputAmount: 0.01554,
        outputCurrency: 'USDT',
        outputAmount: 1003.1,
        feePercent: 0.1,
        feeAmount: 1.003,
        edgeWeight: -11.074,
        description: 'Sell BTC for USDT at bid price $64,550.00',
      },
    ];

    return {
      id: `arb-sol-${now.toString(36)}`,
      timestamp: now,
      path: ['USDT', 'SOL', 'BTC', 'USDT'],
      pairs: ['SOL/USDT', 'SOL/BTC', 'BTC/USDT'],
      steps,
      grossProfitPercent: 0.61,
      totalFeesPercent: 0.3,
      netProfitPercent: 0.31,
      startAmount: 1000,
      expectedOutput: 1003.1,
      profitUsd: 3.1,
      cycleSumWeight: -0.00309,
      status: 'detected',
      executionTimeMs: 22,
      confidenceScore: 98.7,
    };
  } else if (type === 'bnb') {
    // USDT -> BNB -> ETH -> USDT
    const steps: ArbitrageStep[] = [
      {
        stepNumber: 1,
        action: 'BUY',
        pair: 'BNB/USDT',
        rate: 592.4,
        inputCurrency: 'USDT',
        inputAmount: 1000,
        outputCurrency: 'BNB',
        outputAmount: 1.6864,
        feePercent: 0.1,
        feeAmount: 0.00168,
        edgeWeight: -6.3832,
        description: 'Buy BNB with USDT at ask price $592.40',
      },
      {
        stepNumber: 2,
        action: 'SELL',
        pair: 'BNB/ETH',
        rate: 0.1706,
        inputCurrency: 'BNB',
        inputAmount: 1.6864,
        outputCurrency: 'ETH',
        outputAmount: 0.2874,
        feePercent: 0.1,
        feeAmount: 0.000287,
        edgeWeight: 1.7674,
        description: 'Sell BNB for ETH at bid price 0.1706 ETH',
      },
      {
        stepNumber: 3,
        action: 'SELL',
        pair: 'ETH/USDT',
        rate: 3495.2,
        inputCurrency: 'ETH',
        inputAmount: 0.2874,
        outputCurrency: 'USDT',
        outputAmount: 1003.55,
        feePercent: 0.1,
        feeAmount: 1.003,
        edgeWeight: -8.1581,
        description: 'Sell ETH for USDT at bid price $3,495.20',
      },
    ];

    return {
      id: `arb-bnb-${now.toString(36)}`,
      timestamp: now,
      path: ['USDT', 'BNB', 'ETH', 'USDT'],
      pairs: ['BNB/USDT', 'BNB/ETH', 'ETH/USDT'],
      steps,
      grossProfitPercent: 0.655,
      totalFeesPercent: 0.3,
      netProfitPercent: 0.355,
      startAmount: 1000,
      expectedOutput: 1003.55,
      profitUsd: 3.55,
      cycleSumWeight: -0.00354,
      status: 'detected',
      executionTimeMs: 16,
      confidenceScore: 99.1,
    };
  } else {
    // USDT -> EUR -> BTC -> USDT (Forex Triangular)
    const steps: ArbitrageStep[] = [
      {
        stepNumber: 1,
        action: 'SELL',
        pair: 'EUR/USDT',
        rate: 1.0854,
        inputCurrency: 'USDT',
        inputAmount: 1000,
        outputCurrency: 'EUR',
        outputAmount: 920.42,
        feePercent: 0.05,
        feeAmount: 0.46,
        edgeWeight: 0.0824,
        description: 'Convert USDT to EUR at rate 1.0854',
      },
      {
        stepNumber: 2,
        action: 'BUY',
        pair: 'BTC/EUR',
        rate: 59195.0,
        inputCurrency: 'EUR',
        inputAmount: 920.42,
        outputCurrency: 'BTC',
        outputAmount: 0.01554,
        feePercent: 0.1,
        feeAmount: 0.0000155,
        edgeWeight: -10.9875,
        description: 'Buy BTC with EUR at ask price €59,195.00',
      },
      {
        stepNumber: 3,
        action: 'SELL',
        pair: 'BTC/USDT',
        rate: 64620.0,
        inputCurrency: 'BTC',
        inputAmount: 0.01554,
        outputCurrency: 'USDT',
        outputAmount: 1003.2,
        feePercent: 0.1,
        feeAmount: 1.003,
        edgeWeight: -11.0751,
        description: 'Sell BTC for USDT at bid price $64,620.00',
      },
    ];

    return {
      id: `arb-eur-${now.toString(36)}`,
      timestamp: now,
      path: ['USDT', 'EUR', 'BTC', 'USDT'],
      pairs: ['EUR/USDT', 'BTC/EUR', 'BTC/USDT'],
      steps,
      grossProfitPercent: 0.57,
      totalFeesPercent: 0.25,
      netProfitPercent: 0.32,
      startAmount: 1000,
      expectedOutput: 1003.2,
      profitUsd: 3.2,
      cycleSumWeight: -0.00319,
      status: 'detected',
      executionTimeMs: 31,
      confidenceScore: 97.9,
    };
  }
}
