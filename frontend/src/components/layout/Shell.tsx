import React from 'react';
import { useMarket } from '../../context/MarketContext';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { OpportunityDetailModal } from '../arbitrage/OpportunityDetailModal';
import { DashboardPage } from '../../pages/DashboardPage';
import { HistoryPage } from '../../pages/HistoryPage';
import { HowItWorksPage } from '../../pages/HowItWorksPage';

export const Shell: React.FC = () => {
  const { currentTab } = useMarket();

  return (
    <div className="flex flex-col h-screen w-full bg-[#0a0e17] text-slate-200 font-sans overflow-hidden select-none">
      {/* 1. Global High Density Navbar (h-14) */}
      <Navbar />

      {/* 2. Main High Density Workspace Viewport */}
      <main className="flex-1 overflow-hidden relative">
        {currentTab === 'dashboard' && <DashboardPage />}
        {currentTab === 'history' && <HistoryPage />}
        {currentTab === 'how-it-works' && <HowItWorksPage />}
      </main>

      {/* 3. Global High Density Status Footer (h-8) */}
      <Footer />

      {/* 4. Opportunity Details Modal */}
      <OpportunityDetailModal />
    </div>
  );
};

