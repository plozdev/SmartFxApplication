/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketProvider } from './context/MarketContext';
import { Shell } from './components/layout/Shell';

export default function App() {
  return (
    <MarketProvider>
      <Shell />
    </MarketProvider>
  );
}

