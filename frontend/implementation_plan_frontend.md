# SmartFX 2.0 — Frontend Implementation Plan
## Real-Time Crypto Arbitrage Dashboard & Alert System

> **Mục tiêu:** Xây dựng giao diện web hiện đại với dark-theme FinTech, hiển thị bảng giá Crypto real-time, popup thông báo khi phát hiện Arbitrage, xem chi tiết thuật toán SPFA hoạt động từng bước, và lịch sử/thống kê cơ hội.

> [!IMPORTANT]
> Frontend hiện tại (`SmartFxApplication/frontend/`) là thư mục rỗng. Sẽ khởi tạo mới hoàn toàn bằng **Vite + React + TypeScript**.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** Có muốn deploy frontend lên GitHub Pages (static hosting) như trước không?
>
> **Gợi ý:** Có. Vite build ra thư mục `dist/` tĩnh, dễ dàng deploy lên GitHub Pages với `gh-pages` package.

> [!IMPORTANT]
> **Q2:** Dùng component library (shadcn/ui, MUI) hay styled from scratch?
>
> **Gợi ý:** Dùng **Vanilla CSS + một số micro-library nhẹ** (ví dụ: Recharts cho biểu đồ). Giữ project nhẹ, không phụ thuộc framework UI nặng, dễ customize dark theme FinTech.

---

## Proposed Changes

### Tổng quan UI Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TOP NAV BAR                                                             │
│  [Logo SmartFX]          [Dashboard]  [History]  [How It Works]    [⚡🟢] │
│                                                              connection  │
├────────────────────────────────────┬─────────────────────────────────────┤
│                                    │                                     │
│    LEFT PANEL (60%)                │    RIGHT PANEL (40%)                │
│                                    │                                     │
│  ┌──────────────────────────────┐  │  ┌───────────────────────────────┐  │
│  │   MARKET OVERVIEW TABLE      │  │  │   ARBITRAGE RADAR             │  │
│  │                              │  │  │                               │  │
│  │   Pair     Bid      Ask      │  │  │   ┌───────────────────────┐   │  │
│  │   BTC/USDT 60050.10 60050.20 │  │  │   │  Status: SCANNING... │   │  │
│  │   ETH/USDT 3020.50  3020.60  │  │  │   │  Last scan: 2s ago   │   │  │
│  │   ETH/BTC  0.05030  0.05031  │  │  │   │  Graph: 45 nodes,    │   │  │
│  │   BNB/USDT 580.20   580.30   │  │  │   │         890 edges    │   │  │
│  │   SOL/USDT 145.80   145.85   │  │  │   │  Opportunities: 3    │   │  │
│  │   ...                        │  │  │   └───────────────────────┘   │  │
│  │   (Live updates via polling) │  │  │                               │  │
│  └──────────────────────────────┘  │  │  ┌───────────────────────────┐│  │
│                                    │  │  │  🚀 ALERT POPUP           ││  │
│  ┌──────────────────────────────┐  │  │  │  +0.42% Net Profit!      ││  │
│  │   CURRENCY NETWORK GRAPH    │  │  │  │  USDT→BTC→ETH→USDT      ││  │
│  │   (Interactive Force Graph)  │  │  │  │  [View Details →]        ││  │
│  │                              │  │  │  └───────────────────────────┘│  │
│  │     ○BTC ─── ○ETH            │  │  │                               │  │
│  │      \   /    |              │  │  │  ┌───────────────────────────┐│  │
│  │       ○USDT   ○BNB           │  │  │  │  Recent Opportunities     ││  │
│  │      /   \    |              │  │  │  │  • +0.42% 2s ago         ││  │
│  │     ○SOL ─── ○XRP            │  │  │  │  • +0.18% 45s ago       ││  │
│  │                              │  │  │  │  • +0.31% 2m ago        ││  │
│  └──────────────────────────────┘  │  │  └───────────────────────────┘│  │
│                                    │  └───────────────────────────────┘  │
└────────────────────────────────────┴─────────────────────────────────────┘
```

### Arbitrage Detail View (Khi click "View Details" trên Alert)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard          ARBITRAGE OPPORTUNITY #a3f2...            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  VISUAL EXECUTION PATH                                             │  │
│  │                                                                    │  │
│  │  1000 USDT ──BUY──▶ 0.01665 BTC ──BUY──▶ 0.3310 ETH ──SELL──┐    │  │
│  │                                                               │    │  │
│  │                              1004.20 USDT ◀───────────────────┘    │  │
│  │                                                                    │  │
│  │                         💰 Net Profit: +$4.20 (+0.42%)             │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────── EXECUTION STEPS LOG ──────────────────────────────┐  │
│  │                                                                    │  │
│  │  Step  Action  Pair       Rate        Amount In    Amount Out      │  │
│  │  ───── ─────── ────────── ──────────  ──────────── ─────────────   │  │
│  │  1     BUY     BTC/USDT   60050.20    1000.00 USDT 0.01665 BTC    │  │
│  │                Fee: -0.1% (0.00002 BTC)                            │  │
│  │  2     BUY     ETH/BTC    0.05031     0.01663 BTC  0.3310 ETH     │  │
│  │                Fee: -0.1% (0.0003 ETH)                             │  │
│  │  3     SELL    ETH/USDT   3020.50     0.3307 ETH   1004.20 USDT   │  │
│  │                Fee: -0.1% (1.00 USDT)                              │  │
│  │                                                                    │  │
│  │  ─────────────────────────────────────────────────────────────     │  │
│  │  Summary: 1000.00 USDT → 1004.20 USDT                             │  │
│  │  Gross Profit: +0.72% | Total Fees: -0.30% | Net Profit: +0.42%   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────── HOW SPFA DETECTED THIS ───────────────────────────┐  │
│  │                                                                    │  │
│  │  1. Graph Construction:                                            │  │
│  │     Edge BTC/USDT: w = -ln(60050.20 × 0.999) = -11.0028          │  │
│  │     Edge ETH/BTC:  w = -ln(0.05031 × 0.999)  = +2.9896           │  │
│  │     Edge ETH/USDT: w = -ln(3020.50 × 0.999)  = -8.0135           │  │
│  │                                                                    │  │
│  │  2. Cycle Weight Sum:                                              │  │
│  │     Σw = (-11.0028) + (2.9896) + (-8.0135) + (11.0028)            │  │
│  │        = -0.0042  ← NEGATIVE! (Arbitrage confirmed)                │  │
│  │                                                                    │  │
│  │  3. Profit Calculation:                                            │  │
│  │     Multiplier = e^(-(-0.0042)) = e^0.0042 ≈ 1.0042               │  │
│  │     Net Profit = (1.0042 - 1) × 100% = +0.42%                     │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Component 1: Project Setup (Khởi tạo Vite + React + TypeScript)

#### Khởi tạo trong `SmartFxApplication/frontend/`

```bash
cd d:\Projects\SmartFxApplication\frontend
npx -y create-vite@latest ./ --template react-ts
npm install
npm install @stomp/stompjs sockjs-client recharts
npm install -D @types/sockjs-client
```

#### Cấu trúc thư mục

```
frontend/
├── public/
├── src/
│   ├── api/                    # API clients
│   │   ├── httpClient.ts       # Axios instance + base URL
│   │   ├── marketApi.ts        # GET /market/tickers, /market/graph-info
│   │   ├── arbitrageApi.ts     # GET /arbitrage/scan, /history, /stats
│   │   └── exchangeApi.ts      # GET /exchange, /currencies (giữ lại)
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useWebSocket.ts     # STOMP WebSocket connection + auto-reconnect
│   │   ├── useMarketData.ts    # Polling tickers mỗi 3s
│   │   └── useArbitrageAlerts.ts  # Subscribe /topic/arbitrage-alerts
│   │
│   ├── components/             # Reusable UI components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── ConnectionStatus.tsx   # ⚡🟢 / 🔴 WebSocket status
│   │   ├── market/
│   │   │   ├── TickerTable.tsx         # Bảng giá Bid/Ask live
│   │   │   └── CurrencyGraph.tsx       # Force-directed network graph
│   │   ├── arbitrage/
│   │   │   ├── ArbitrageRadar.tsx      # Status panel (scanning, count)
│   │   │   ├── AlertPopup.tsx          # Toast notification khi phát hiện
│   │   │   ├── RecentOpportunities.tsx # Danh sách cơ hội gần nhất
│   │   │   ├── OpportunityDetail.tsx   # Trang chi tiết (execution steps)
│   │   │   └── AlgorithmExplainer.tsx  # "How SPFA detected this" section
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ProfitBadge.tsx         # Badge xanh +0.42% / đỏ -0.12%
│   │
│   ├── pages/                  # Route pages
│   │   ├── DashboardPage.tsx   # Trang chính (Market + Radar + Alerts)
│   │   ├── HistoryPage.tsx     # Bảng lịch sử + biểu đồ thống kê
│   │   ├── DetailPage.tsx      # Chi tiết 1 cơ hội (/:id)
│   │   └── HowItWorksPage.tsx  # Giải thích thuật toán (static)
│   │
│   ├── types/                  # TypeScript interfaces
│   │   ├── market.ts           # TickerDTO, GraphInfoDTO
│   │   ├── arbitrage.ts        # ArbitrageOpportunityDTO, StatsDTO
│   │   └── exchange.ts         # ExchangeResponse (giữ lại)
│   │
│   ├── styles/
│   │   └── index.css           # Global CSS: dark theme, variables, animations
│   │
│   ├── App.tsx                 # Router setup
│   └── main.tsx                # Entry point
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

### Component 2: WebSocket Hook (Real-time Alerts)

#### [NEW] `src/hooks/useWebSocket.ts`

```typescript
// Kết nối STOMP WebSocket tới backend /ws endpoint
// Auto-reconnect khi mất kết nối
// Expose: isConnected, subscribe(topic, callback), disconnect()
```

#### [NEW] `src/hooks/useArbitrageAlerts.ts`

```typescript
// Subscribe /topic/arbitrage-alerts
// Khi nhận message:
//   1. Parse JSON → ArbitrageOpportunityDTO
//   2. Thêm vào đầu danh sách "recent opportunities"
//   3. Trigger AlertPopup toast animation
//   4. Play subtle notification sound (optional)
// Expose: alerts[], latestAlert, clearAlerts()
```

---

### Component 3: Dashboard Page (Trang chính)

#### [NEW] `src/pages/DashboardPage.tsx`

Layout 2 cột (60/40 split):

**Cột trái (60%):**
1. **TickerTable** — Bảng giá Crypto live:
   - Polling `GET /api/v1/market/tickers` mỗi 3 giây
   - Hiển thị: Pair, Bid, Ask, Spread, Spread%
   - Flash animation xanh/đỏ khi giá thay đổi so với lần trước
   - Sortable by column
   
2. **CurrencyGraph** — Biểu đồ mạng lưới tiền tệ:
   - Sử dụng SVG / Canvas vẽ force-directed graph
   - Mỗi node là 1 đồng coin (BTC, ETH, USDT, BNB, SOL...)
   - Mỗi edge là cặp giao dịch, độ dày tỷ lệ với volume/rate
   - Khi có Arbitrage: Highlight chu trình bằng đường màu xanh neon nhấp nháy
   - Hover vào node: Tooltip hiện thông tin giá

**Cột phải (40%):**
1. **ArbitrageRadar** — Panel trạng thái:
   - Status: "🔍 Scanning..." / "🚀 Opportunity Found!" / "😴 No opportunities"
   - Thống kê: Số nodes, edges, last scan time, total opportunities today
   
2. **AlertPopup** — Toast notification:
   - Xuất hiện từ góc phải khi WebSocket nhận được alert mới
   - Hiển thị: Net Profit %, Cycle Path, "View Details →" link
   - Auto-dismiss sau 10s hoặc click để đóng
   
3. **RecentOpportunities** — Danh sách cơ hội gần nhất:
   - Hiển thị 10 cơ hội gần nhất (từ WebSocket + initial fetch)
   - Mỗi item: Profit badge, cycle path ngắn gọn, thời gian "2s ago"
   - Click để navigate sang DetailPage

---

### Component 4: Arbitrage Detail Page (Chi tiết cơ hội)

#### [NEW] `src/pages/DetailPage.tsx`

Route: `/arbitrage/:id`

**3 sections chính:**

1. **Visual Execution Path:**
   - Sơ đồ ngang: `1000 USDT ──▶ 0.0166 BTC ──▶ 0.331 ETH ──▶ 1004.20 USDT`
   - Mũi tên có label (BUY/SELL), mỗi bước hiện rate
   - Badge cuối cùng: 💰 +$4.20 (+0.42%)

2. **Execution Steps Log:**
   - Bảng chi tiết từng bước giao dịch
   - Columns: Step, Action (BUY/SELL), Pair, Rate, Amount In, Amount Out, Fee

3. **Algorithm Explainer ("How SPFA Detected This"):**
   - Hiển thị trọng số $w = -\ln(\text{rate} \times (1 - \text{fee}))$ cho từng cạnh trong chu trình
   - Tính tổng: $\sum w = -0.0042$ → Negative → Arbitrage confirmed!
   - Profit: $e^{-\sum w} = 1.0042$ → +0.42%

---

### Component 5: History & Analytics Page

#### [NEW] `src/pages/HistoryPage.tsx`

Route: `/history`

1. **Bảng lịch sử:**
   - Fetch `GET /api/v1/arbitrage/history`
   - Columns: Time, Cycle, Net Profit%, Est. Profit USD, Steps
   - Click vào row → navigate sang DetailPage
   - Pagination

2. **Biểu đồ thống kê (Recharts):**
   - Line chart: Số lượng cơ hội theo giờ trong 24h
   - Bar chart: Top 5 chu trình xuất hiện nhiều nhất
   - KPI cards: Tổng cơ hội hôm nay, Avg profit, Max profit

---

### Component 6: Design System (Dark FinTech Theme)

#### [NEW] `src/styles/index.css`

**Phong cách thiết kế:** Dark mode FinTech terminal (cảm hứng từ TradingView, Binance Pro, Bloomberg Terminal)

```css
/* CSS Variables */
:root {
  --bg-primary: #0a0e17;       /* Nền chính: đen xanh deep navy */
  --bg-card: #111827;           /* Nền card: dark slate */
  --bg-card-hover: #1a2332;
  --border: #1e293b;
  
  --text-primary: #e2e8f0;      /* Chữ chính: xám sáng */
  --text-secondary: #94a3b8;    /* Chữ phụ: xám trung */
  
  --accent-green: #22c55e;      /* Giá tăng / Profit dương */
  --accent-red: #ef4444;        /* Giá giảm / Profit âm */
  --accent-blue: #3b82f6;       /* Links, buttons chính */
  --accent-gold: #f59e0b;       /* Highlights, warnings */
  --accent-neon: #06ffa5;       /* Arbitrage cycle highlight glow */
  
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

**Micro-animations:**
- Bảng giá: Flash xanh/đỏ khi giá thay đổi (CSS keyframe `@keyframes price-flash`)
- Alert popup: Slide-in từ phải + glow effect
- Currency graph: Chu trình Arbitrage nhấp nháy neon pulse
- Số liệu profit: Count-up animation

---

### Tổng hợp: Danh sách file

| Loại | File | Mô tả |
|:---|:---|:---|
| **[INIT]** | `package.json`, `vite.config.ts`, `tsconfig.json` | Vite + React + TS project setup |
| **[NEW]** | `src/api/httpClient.ts` | Axios instance |
| **[NEW]** | `src/api/marketApi.ts` | Market data endpoints |
| **[NEW]** | `src/api/arbitrageApi.ts` | Arbitrage endpoints |
| **[NEW]** | `src/hooks/useWebSocket.ts` | STOMP WebSocket hook |
| **[NEW]** | `src/hooks/useArbitrageAlerts.ts` | Alert subscription hook |
| **[NEW]** | `src/hooks/useMarketData.ts` | Ticker polling hook |
| **[NEW]** | `src/components/layout/Navbar.tsx` | Top navigation bar |
| **[NEW]** | `src/components/layout/ConnectionStatus.tsx` | WebSocket status indicator |
| **[NEW]** | `src/components/market/TickerTable.tsx` | Live price table |
| **[NEW]** | `src/components/market/CurrencyGraph.tsx` | Force-directed network graph |
| **[NEW]** | `src/components/arbitrage/ArbitrageRadar.tsx` | Scan status panel |
| **[NEW]** | `src/components/arbitrage/AlertPopup.tsx` | Toast notification |
| **[NEW]** | `src/components/arbitrage/RecentOpportunities.tsx` | Recent alerts list |
| **[NEW]** | `src/components/arbitrage/OpportunityDetail.tsx` | Detail view |
| **[NEW]** | `src/components/arbitrage/AlgorithmExplainer.tsx` | SPFA walkthrough |
| **[NEW]** | `src/pages/DashboardPage.tsx` | Main dashboard |
| **[NEW]** | `src/pages/HistoryPage.tsx` | History & analytics |
| **[NEW]** | `src/pages/DetailPage.tsx` | Opportunity detail |
| **[NEW]** | `src/pages/HowItWorksPage.tsx` | Algorithm explanation |
| **[NEW]** | `src/types/market.ts` | TypeScript interfaces |
| **[NEW]** | `src/types/arbitrage.ts` | TypeScript interfaces |
| **[NEW]** | `src/styles/index.css` | Dark FinTech theme |
| **[NEW]** | `src/App.tsx` | Router setup |

---

## Verification Plan

### Dev Server
```bash
cd frontend
npm run dev
# Mở http://localhost:5173
```

### Manual Verification
1. **Dashboard loads:** Bảng giá ticker hiển thị dữ liệu thật từ backend
2. **WebSocket connected:** Indicator góc phải hiện ⚡🟢
3. **Alert popup:** Chờ hoặc trigger scan → Toast notification xuất hiện
4. **Detail page:** Click vào opportunity → Hiển thị đầy đủ execution steps + algorithm explainer
5. **History page:** Danh sách lịch sử load đúng, biểu đồ Recharts render
6. **Responsive:** Co giãn hợp lý trên các kích thước màn hình (1280px - 1920px)
7. **Dark theme:** Tất cả trang đều dark theme nhất quán, không có vùng trắng chói
