# Professional Real-Time Trading Intelligence Terminal

An institutional-grade financial market analysis and real-time trading intelligence dashboard designed for high performance, Smart Money Concepts (SMC) structure detection, multi-timeframe confluence analysis, and strategy backtesting.

![Terminal Preview](https://raw.githubusercontent.com/trading-terminal/preview.png)

## 🌟 Key Features

- **Multi-Asset Registry**: Supports BTC/USD, ETH/USD, SOL/USD, XAU/USD (Gold), EUR/USD, GBP/USD, USD/JPY, NASDAQ (US100 CFD), S&P 500 (US500 CFD), Dow Jones (US30 CFD), WTI Crude Oil, Silver (XAG/USD), and easily extendable custom symbols.
- **Provider Abstraction Architecture**: Normalizes streaming ticks across CoinGecko API, Forex feeds, CFD providers, and high-frequency Demo stochastic walk streams.
- **TradingView Lightweight Charts Integration**: High-density interactive candlestick charts with volume histogram, crosshairs, zoom/pan, real-time incremental candle updates, and custom SMC overlays.
- **Smart Money Concepts (SMC) Engine**:
  - Swing Points (HH, HL, LH, LL)
  - Break of Structure (BOS) & Change of Character (CHoCH)
  - Order Blocks (OB) with strength, freshness, and touch tracking
  - Fair Value Gaps (FVG) with size and fill percentage
  - Liquidity Sweeps (Equal Highs/Lows, PDH/PDL, Session Highs/Lows)
  - Premium / Discount Dealing Range (50% Equilibrium Line)
- **Institutional Market Pressure Score**: Explainable Buyer vs. Seller Power gauge (0-100) computed from momentum, volume, market structure, VWAP, RSI, and liquidity sweeps.
- **Quant Confluence Signal Engine**: Composite confidence score (0-100) producing `BULLISH BIAS`, `BEARISH BIAS`, or `NO CLEAR EDGE`.
- **Trade Setup Generator**: Automatic Long/Short trade scenarios with Entry Zone, Stop Loss, Take Profit 1 & 2, Risk/Reward ratio, and invalidation risk warnings.
- **Multi-Timeframe Analysis**: Parallel 5M, 15M, 1H, 4H, 1D matrix comparing trends, structures, momentum, and overall alignment.
- **Strategy Backtesting Module**: Evaluates win rate, profit factor, expectancy, Sharpe ratio, Sortino ratio, max drawdown, and equity growth curves.
- **Command Palette & Keyboard Shortcuts**:
  - `/` -> Search asset / Command palette
  - `1-5` -> Quick timeframe selection (1m, 5m, 15m, 1H, 4H)
  - `F` -> Fullscreen chart mode
  - `T` -> Theme toggle

---

## 🏗 Data Provider Architecture

```
Market Data Providers
   ├── CoinGeckoProvider (Crypto Live Feed)
   ├── ForexProvider (XAU/USD, EUR/USD, GBP/USD)
   ├── CFDProvider (US100, US500, US30, WTI)
   └── DemoProvider (Sub-second stochastic walk simulation)
            ↓
   Normalized MarketTick Stream
            ↓
     CandleAggregator
            ↓
  Technical Indicators + SMC Engine
            ↓
   Institutional Terminal UI
```

Every provider normalizes tick outputs into the standard internal structure:

```ts
interface MarketTick {
  symbol: string;
  timestamp: number;
  bid: number;
  ask: number;
  last: number;
  change24h: number;
  changePercent24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  source: string;
  spread: number;
}
```

---

## 🛠 Local Setup & Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/trading-terminal.git
   cd trading-terminal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Run Unit Tests**:
   ```bash
   npm run test
   ```

5. **Build for Production / GitHub Pages**:
   ```bash
   npm run build
   ```

---

## 🔒 Security & Deployment

- **GitHub Pages Static Hosting**: Frontend code runs purely client-side without exposing API keys or secrets in JavaScript bundles.
- **Environment Variables**: Configure non-sensitive API endpoints in `.env`.
- **GitHub Actions Workflow**: Included in `.github/workflows/deploy.yml` for automated testing, building, and deployment to GitHub Pages.

---

## ⚠️ Trading Risk Disclaimer

This software is designed solely for quantitative market analysis, educational research, and financial data visualization. It does not constitute investment advice or trading recommendations. Past performance backtests do not guarantee future live trading results.
