import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Ticker,
  ArbitrageOpportunity,
  SystemStats,
  TabType,
} from '../types';
import {
  INITIAL_TICKERS,
  buildSyntheticArbitrage,
  buildAlternativeArbitrage,
} from '../utils/arbitrageEngine';

interface MarketContextType {
  tickers: Ticker[];
  opportunities: ArbitrageOpportunity[];
  activeAlert: ArbitrageOpportunity | null;
  selectedOpportunity: ArbitrageOpportunity | null;
  systemStats: SystemStats;
  currentTab: TabType;
  isConnected: boolean;
  isScanning: boolean;
  soundEnabled: boolean;
  setCurrentTab: (tab: TabType) => void;
  setSelectedOpportunity: (opp: ArbitrageOpportunity | null) => void;
  dismissActiveAlert: () => void;
  triggerManualArbitrageScan: () => void;
  toggleConnection: () => void;
  toggleScanning: () => void;
  toggleSound: () => void;
  clearHistory: () => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [tickers, setTickers] = useState<Ticker[]>(INITIAL_TICKERS);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>(() => {
    // Initial seeded opportunities
    const initialOpp1 = buildSyntheticArbitrage(INITIAL_TICKERS, 0.4);
    const initialOpp2 = buildAlternativeArbitrage('sol', INITIAL_TICKERS);
    const initialOpp3 = buildAlternativeArbitrage('bnb', INITIAL_TICKERS);
    return [initialOpp1, initialOpp2, initialOpp3];
  });
  const [activeAlert, setActiveAlert] = useState<ArbitrageOpportunity | null>(() => opportunities[0]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<ArbitrageOpportunity | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [systemStats, setSystemStats] = useState<SystemStats>({
    scanningActive: true,
    nodesCount: 12,
    edgesCount: 38,
    lastScanDurationMs: 14,
    totalCyclesChecked: 248,
    opportunitiesToday: 3,
    totalProfitTodayUsd: 10.85,
    avgNetProfitPercent: 0.36,
    bestProfitTodayPercent: 0.42,
    networkLatencyMs: 18,
    connectedClients: 42,
    algorithmName: 'SPFA (Shortest Path Faster Algorithm)',
  });

  const dismissActiveAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const toggleConnection = useCallback(() => {
    setIsConnected((prev) => !prev);
  }, []);

  const toggleScanning = useCallback(() => {
    setIsScanning((prev) => !prev);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    setOpportunities([]);
  }, []);

  const triggerManualArbitrageScan = useCallback(() => {
    const oppTypes: ('standard' | 'sol' | 'bnb' | 'eur')[] = ['standard', 'sol', 'bnb', 'eur'];
    const selectedType = oppTypes[Math.floor(Math.random() * oppTypes.length)];
    let newOpp: ArbitrageOpportunity;
    if (selectedType === 'standard') {
      newOpp = buildSyntheticArbitrage(tickers, Math.random());
    } else {
      newOpp = buildAlternativeArbitrage(selectedType, tickers);
    }

    setOpportunities((prev) => [newOpp, ...prev.slice(0, 49)]);
    setActiveAlert(newOpp);

    setSystemStats((prev) => ({
      ...prev,
      totalCyclesChecked: prev.totalCyclesChecked + 1,
      opportunitiesToday: prev.opportunitiesToday + 1,
      totalProfitTodayUsd: Number((prev.totalProfitTodayUsd + newOpp.profitUsd).toFixed(2)),
      bestProfitTodayPercent: Math.max(prev.bestProfitTodayPercent, newOpp.netProfitPercent),
      lastScanDurationMs: Math.floor(10 + Math.random() * 15),
    }));
  }, [tickers]);

  // Live Market Ticker simulation with realistic price fluctuations & flashes
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      setTickers((prevTickers) => {
        return prevTickers.map((ticker) => {
          // 45% chance this ticker updates this tick
          if (Math.random() > 0.45) return ticker;

          const deltaPercent = (Math.random() - 0.49) * 0.0018; // micro fluctuation
          const newLast = Number((ticker.lastPrice * (1 + deltaPercent)).toFixed(
            ticker.lastPrice < 1 ? 5 : ticker.lastPrice < 10 ? 4 : 2
          ));
          const newBid = Number((newLast - ticker.spread / 2).toFixed(
            ticker.lastPrice < 1 ? 5 : ticker.lastPrice < 10 ? 4 : 2
          ));
          const newAsk = Number((newLast + ticker.spread / 2).toFixed(
            ticker.lastPrice < 1 ? 5 : ticker.lastPrice < 10 ? 4 : 2
          ));
          const flash: 'up' | 'down' = deltaPercent >= 0 ? 'up' : 'down';

          return {
            ...ticker,
            lastPrice: newLast,
            bid: newBid,
            ask: newAsk,
            spread: Number((newAsk - newBid).toFixed(4)),
            spreadPercent: Number((((newAsk - newBid) / newLast) * 100).toFixed(4)),
            change24h: Number((ticker.change24h + (deltaPercent > 0 ? 0.01 : -0.01)).toFixed(2)),
            updatedTimestamp: Date.now(),
            flashState: flash,
          };
        });
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Periodic SPFA Cycle Scan simulation (every ~12-18s)
  useEffect(() => {
    if (!isConnected || !isScanning) return;

    const scanInterval = setInterval(() => {
      setSystemStats((prev) => ({
        ...prev,
        totalCyclesChecked: prev.totalCyclesChecked + Math.floor(1 + Math.random() * 3),
        networkLatencyMs: Math.floor(14 + Math.random() * 8),
        lastScanDurationMs: Math.floor(12 + Math.random() * 10),
      }));

      // 30% chance to detect an opportunity per scan interval
      if (Math.random() < 0.35) {
        triggerManualArbitrageScan();
      }
    }, 14000);

    return () => clearInterval(scanInterval);
  }, [isConnected, isScanning, triggerManualArbitrageScan]);

  const value = useMemo(
    () => ({
      tickers,
      opportunities,
      activeAlert,
      selectedOpportunity,
      systemStats,
      currentTab,
      isConnected,
      isScanning,
      soundEnabled,
      setCurrentTab,
      setSelectedOpportunity,
      dismissActiveAlert,
      triggerManualArbitrageScan,
      toggleConnection,
      toggleScanning,
      toggleSound,
      clearHistory,
    }),
    [
      tickers,
      opportunities,
      activeAlert,
      selectedOpportunity,
      systemStats,
      currentTab,
      isConnected,
      isScanning,
      soundEnabled,
      dismissActiveAlert,
      triggerManualArbitrageScan,
      toggleConnection,
      toggleScanning,
      toggleSound,
      clearHistory,
    ]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
