/**
 * Core domain types for Professional Trading Intelligence Terminal
 */

export type AssetCategory = 'crypto' | 'forex' | 'cfd' | 'commodity';

export type SectorType = 'Layer 1' | 'Layer 2' | 'DeFi' | 'AI & Data' | 'DePIN' | 'Memes' | 'RWA' | 'Gaming & NFT' | 'Liquid Staking' | 'Exchange Tokens' | 'Stablecoins' | 'Oracles' | 'Forex & Macro';

export interface Asset {
  symbol: string;           // e.g., "BTC/USD", "EUR/USD", "US100"
  id: string;               // e.g., "btc-usd"
  name: string;             // e.g., "Bitcoin"
  category: AssetCategory;
  sector?: SectorType;
  baseSymbol: string;       // e.g., "BTC"
  quoteSymbol: string;      // e.g., "USD"
  decimals: number;         // Decimal precision for display (e.g. 2 for BTC, 4 for EUR/USD)
  coingeckoId?: string;     // e.g., "bitcoin"
  description?: string;
  isFavorite?: boolean;
  marketCap?: number;
  fdv?: number;
  circulatingSupply?: number;
  totalSupply?: number;
  maxSupply?: number | null;
  volume24h?: number;
  volumeToMcapRatio?: number;
  ath?: number;
  atl?: number;
  athChangePercent?: number;
  atlChangePercent?: number;
  rank?: number;
  liquidityScore?: number;  // 0 - 100
  exchangeCount?: number;
  ageMonths?: number;
  volatility30d?: number;   // %
  change1h?: number;
  change7d?: number;
  change30d?: number;
}

export interface MarketTick {
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

export interface Candle {
  time: number;             // UNIX timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1H' | '4H' | '1D' | '1W';

// --- SMC Types ---

export type StructureType = 'BOS' | 'CHoCH' | 'Swing';
export type BiasType = 'Bullish' | 'Bearish' | 'Neutral';

export interface SwingPoint {
  index: number;
  time: number;
  price: number;
  type: 'HH' | 'HL' | 'LH' | 'LL';
}

export interface StructureBreak {
  time: number;
  price: number;
  type: StructureType;
  bias: BiasType;
  description: string;
}

export interface OrderBlock {
  id: string;
  bias: 'Bullish' | 'Bearish';
  top: number;
  bottom: number;
  startTime: number;
  strength: number;         // 0 - 100
  freshness: 'Fresh' | 'Tested' | 'Mitigated';
  touches: number;
  timeframe: Timeframe;
  status: 'Active' | 'Mitigated';
}

export interface FairValueGap {
  id: string;
  bias: 'Bullish' | 'Bearish';
  top: number;
  bottom: number;
  time: number;
  size: number;             // Price gap width
  sizePercent: number;
  fillPercentage: number;   // 0 - 100%
  status: 'Unfilled' | 'Partially Filled' | 'Mitigated';
}

export interface LiquidityLevel {
  id: string;
  type: 'Equal Highs' | 'Equal Lows' | 'PDH' | 'PDL' | 'Session High' | 'Session Low' | 'Swing Liquidity';
  price: number;
  bias: 'Buy-side' | 'Sell-side';
  swept: boolean;
  sweepTime?: number;
}

export interface DealingRange {
  high: number;
  low: number;
  equilibrium: number;      // 50%
  premiumZone: { min: number; max: number };
  discountZone: { min: number; max: number };
  currentZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
}

export interface SMCAnalysis {
  swings: SwingPoint[];
  structureBreaks: StructureBreak[];
  orderBlocks: OrderBlock[];
  fairValueGaps: FairValueGap[];
  liquidityLevels: LiquidityLevel[];
  dealingRange: DealingRange;
  overallBias: BiasType;
  biasConfidence: number;   // 0 - 100
}

// --- Indicators Types ---

export interface IndicatorConfig {
  emaLengths: number[];
  smaLengths: number[];
  rsiLength: number;
  rsiOverbought: number;
  rsiOversold: number;
  stochRsiLength: number;
  macdFast: number;
  macdSlow: number;
  macdSignal: number;
  atrLength: number;
  adxLength: number;
  bollingerLength: number;
  bollingerStdDev: number;
  supertrendPeriod: number;
  supertrendMultiplier: number;
  fvgSensitivity: number;
  obSensitivity: number;
  swingLength: number;
  volumeThreshold: number;
}

export interface IndicatorValues {
  ema: Record<number, number | null>;
  sma: Record<number, number | null>;
  vwap: number | null;
  rsi: number | null;
  stochRsi: { k: number; d: number } | null;
  macd: { macd: number; signal: number; histogram: number } | null;
  atr: number | null;
  adx: { adx: number; pDi: number; mDi: number } | null;
  bollingerBands: { upper: number; middle: number; lower: number; width: number } | null;
  supertrend: { value: number; direction: 'up' | 'down' } | null;
  obv: number | null;
  relativeVolume: number | null;
}

// --- Market Pressure & Regime ---

export interface PressureBreakdown {
  component: string;
  score: number;
  description: string;
}

export interface MarketPressure {
  buyPower: number;         // 0 - 100
  sellPower: number;        // 0 - 100
  buyBreakdown: PressureBreakdown[];
  sellBreakdown: PressureBreakdown[];
  dominantSide: 'BUYERS' | 'SELLERS' | 'BALANCED';
}

export type VolatilityState = 'COMPRESSING' | 'EXPANDING' | 'NORMAL' | 'EXTREME';
export type MarketRegimeType = 'TRENDING' | 'RANGING' | 'BREAKOUT' | 'HIGH VOLATILITY' | 'LOW VOLATILITY';

export interface MarketRegime {
  regime: MarketRegimeType;
  volatilityState: VolatilityState;
  adxValue: number;
  atrPercentile: number;
  description: string;
  isTradable: boolean;
}

// --- Signal & Trade Setup ---

export interface MultiTimeframeRow {
  timeframe: Timeframe;
  trend: 'Up' | 'Down' | 'Sideways';
  structure: 'Bullish' | 'Bearish' | 'Neutral';
  momentum: 'Strong Bull' | 'Weak Bull' | 'Neutral' | 'Weak Bear' | 'Strong Bear';
  smcBias: BiasType;
  alignment: number;        // Percentage 0-100
}

export interface MTFAnalysisResult {
  rows: MultiTimeframeRow[];
  overallScore: number;     // 0 - 100
  overallBias: BiasType;
}

export interface SignalScoreComponents {
  technicalScore: number;
  marketStructureScore: number;
  momentumScore: number;
  volumeScore: number;
  smcConfluenceScore: number;
  volatilityScore: number;
  compositeScore: number;
}

export interface SignalReason {
  isPositive: boolean;
  text: string;
}

export interface TradeSetup {
  symbol: string;
  direction: 'LONG' | 'SHORT' | 'NO_TRADE';
  entryMin: number;
  entryMax: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  riskRewardRatio: number;
  setupScore: number;       // 0 - 100
  reasons: SignalReason[];
  risks: string[];
  historicalQuality: number; // e.g. 84/100
}

export interface SignalResult {
  symbol: string;
  timestamp: number;
  timeframe: Timeframe;
  direction: 'BULLISH BIAS' | 'BEARISH BIAS' | 'NO CLEAR EDGE';
  confidence: number;       // 0 - 100
  scores: SignalScoreComponents;
  reasons: SignalReason[];
  setup?: TradeSetup;
}

export interface SignalHistoryItem {
  id: string;
  time: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  timeframe: Timeframe;
  entry: number;
  score: number;
  reason: string;
  result: 'OPEN' | '+1.8R' | '+2.5R' | '-1.0R' | '+0.8R';
}

// --- Backtest Types ---

export interface BacktestParams {
  symbol: string;
  timeframe: Timeframe;
  strategyName: string;
  initialBalance: number;
  feePercent: number;       // e.g. 0.05%
  slippagePercent: number;  // e.g. 0.01%
}

export interface BacktestTrade {
  id: string;
  entryTime: number;
  exitTime: number;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  rMultiple: number;
  result: 'WIN' | 'LOSS';
  holdingTimeMinutes: number;
}

export interface BacktestResult {
  strategyName: string;
  symbol: string;
  timeframe: Timeframe;
  totalTrades: number;
  winRate: number;            // percentage e.g. 61.8
  profitFactor: number;       // e.g. 1.74
  expectancyR: number;        // e.g. +0.42R
  maxDrawdownPercent: number; // e.g. -11.3
  totalReturnPercent: number; // e.g. +34.5
  sharpeRatio: number;        // e.g. 1.82
  sortinoRatio: number;       // e.g. 2.14
  avgWinR: number;
  avgLossR: number;
  consecutiveLossesMax: number;
  avgHoldingTimeHours: number;
  equityCurve: { time: number; equity: number }[];
  trades: BacktestTrade[];
}

// --- News & Events ---

export interface MacroEvent {
  id: string;
  title: string;
  category: 'Crypto' | 'Macro' | 'Central Bank' | 'Forex';
  timestamp: number;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual?: string;
  forecast?: string;
  previous?: string;
  source: string;
}

// --- Session Info ---

export interface TradingSession {
  name: 'ASIA' | 'LONDON' | 'NEW YORK' | 'OVERLAP';
  startHourUTC: number;
  endHourUTC: number;
  isActive: boolean;
  high: number;
  low: number;
  rangePips: number;
}

// --- Alerts ---

export interface MarketAlert {
  id: string;
  symbol: string;
  condition: 'Price Above' | 'Price Below' | 'BOS' | 'CHoCH' | 'Liquidity Sweep' | 'FVG Created' | 'Order Block Retest' | 'RSI Overbought' | 'RSI Oversold';
  targetValue?: number;
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}

// --- Pro Dashboard Widget System ---

export type WidgetType =
  | 'market_cap'
  | 'btc_dominance'
  | 'eth_dominance'
  | 'stablecoin_cap'
  | 'global_overview'
  | 'top_gainers'
  | 'top_losers'
  | 'highest_volume'
  | 'new_ath_atl'
  | 'trending_coins'
  | 'market_breadth'
  | 'fear_greed'
  | 'btc_eth_perf'
  | 'sector_perf'
  | 'user_watchlist'
  | 'open_positions'
  | 'portfolio_perf'
  | 'recent_alerts'
  | 'ai_summary'
  | 'derivatives_quick'
  | 'whale_feed_quick'
  | 'market_pressure';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  pinned?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
}

// --- On-Chain & Whale Intelligence ---

export interface OnChainMetrics {
  symbol: string;
  activeAddresses24h: number;
  newAddresses24h: number;
  txCount24h: number;
  txVolumeUSD24h: number;
  avgGasFeeUSD: number;
  whaleTxCount24h: number;
  exchangeInflow24hUSD: number;
  exchangeOutflow24hUSD: number;
  exchangeReserveUSD: number;
  netExchangeFlow24hUSD: number;
  stablecoinNetflow24hUSD: number;
  mvrvZScore: number;
  soprRatio: number;
  nvtRatio: number;
  realizedCapUSD: number;
  top10ConcentrationPercent: number;
  top50ConcentrationPercent: number;
}

export interface WhaleTransaction {
  id: string;
  hash: string;
  timestamp: number;
  symbol: string;
  amountToken: number;
  amountUSD: number;
  fromAddress: string;
  fromLabel: string;
  toAddress: string;
  toLabel: string;
  txType: 'Exchange Deposit' | 'Exchange Withdrawal' | 'Wallet Transfer' | 'DeFi Swap';
  impact: 'High' | 'Medium' | 'Low';
}

export interface SmartMoneyWallet {
  id: string;
  address: string;
  label: string;
  category: 'VC Fund' | 'Market Maker' | 'DeFi Whale' | 'OG Hodler' | 'Trading Firm';
  portfolioValueUSD: number;
  winRate30d: number;
  pnl30dPercent: number;
  topHoldings: { symbol: string; percent: number }[];
  recentAction: string;
  isFollowing?: boolean;
}

// --- Token Unlocks & Holders ---

export interface TokenHolderCategory {
  category: 'Top 10 Whales' | 'Exchanges' | 'Team & Insiders' | 'Treasury & Reserve' | 'Vesting Escrow' | 'Retail & Community';
  percentage: number;
  amountUSD: number;
}

export interface TokenUnlockEvent {
  id: string;
  symbol: string;
  name: string;
  unlockDate: string; // YYYY-MM-DD
  unlockTimestamp: number;
  unlockAmountTokens: number;
  unlockAmountUSD: number;
  percentOfCirculating: number;
  recipientCategory: 'Team' | 'Seed Investors' | 'Ecosystem' | 'Treasury' | 'Public Sale';
  pressureImpact: 'High' | 'Medium' | 'Low';
}

// --- Derivatives Terminal & Liquidation Heatmap ---

export interface DerivativesData {
  symbol: string;
  openInterestUSD: number;
  openInterestChange24h: number;
  fundingRateCurrentPercent: number;
  fundingRate8hPredicted: number;
  liquidations24hLongUSD: number;
  liquidations24hShortUSD: number;
  longShortRatio: number; // e.g. 1.25 -> 55.5% long vs 44.5% short
  futuresVolume24hUSD: number;
  impliedVolatility30d: number;
  optionsPutCallRatio: number;
  basisPercent: number;
}

export interface ExchangeLiquidityComparison {
  exchange: 'Binance' | 'Bybit' | 'OKX' | 'Coinbase' | 'Kraken' | 'Uniswap V3';
  spotPrice: number;
  futuresPrice: number;
  bid: number;
  ask: number;
  spreadBps: number;
  depth2PercentUSD: number;
  fundingRate: number;
  openInterestUSD: number;
  volume24hUSD: number;
}

export interface LiquidationCluster {
  priceLevel: number;
  longVolumeUSD: number;
  shortVolumeUSD: number;
  leverageTier: '10x' | '25x' | '50x' | '100x';
  distancePercent: number;
}

// --- Scanner & Screeners ---

export interface ScannerCondition {
  id: string;
  metric: 'priceChange24h' | 'volume24h' | 'rsi14' | 'fundingRate' | 'openInterest' | 'mvrv' | 'whaleInflow';
  operator: '>' | '<' | 'crossingAbove' | 'crossingBelow';
  value: number;
}

export interface SavedScreener {
  id: string;
  name: string;
  description: string;
  logic: 'AND' | 'OR';
  conditions: ScannerCondition[];
}

export interface MarketOpportunity {
  id: string;
  symbol: string;
  title: string;
  type: 'Volume Spike' | 'Oversold RSI' | 'Whale Accumulation' | 'Short Squeeze Risk' | 'SMC Structure Break';
  score: number; // 0 - 100
  reasoning: string;
  timestamp: number;
}

// --- Custom Alerts ---

export interface AlertRule {
  id: string;
  symbol: string;
  metric: string;
  condition: string;
  threshold: number | string;
  channel: 'In-App' | 'Email' | 'Telegram' | 'Webhook';
  triggered: boolean;
  createdAt: number;
  lastTriggeredAt?: number;
}

// --- Paper Trading & Portfolio ---

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type OrderSide = 'BUY' | 'SELL';

export interface PaperOrder {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  timestamp: number;
}

export interface PaperPosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  amount: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss?: number;
  takeProfit?: number;
  leverage: number;
  openedAt: number;
}

export interface PortfolioRiskMetrics {
  totalBalanceUSD: number;
  dailyReturnPercent: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdownPercent: number;
  volatility30dPercent: number;
  valueAtRisk95Percent: number;
  betaToBtc: number;
  stablecoinRatioPercent: number;
  topAssetConcentrationPercent: number;
  warnings: string[];
}

// --- AI Research & Reports ---

export interface AIResearchReport {
  symbol: string;
  name: string;
  generatedAt: string;
  marketOverview: string;
  pricePerformance: string;
  technicalSummary: string;
  onChainAnalysis: string;
  derivativesOutlook: string;
  whaleSentiment: string;
  tokenomicsRating: string;
  keySupportLevels: number[];
  keyResistanceLevels: number[];
  bullishFactors: string[];
  bearishFactors: string[];
  riskScore: number; // 1 - 10
}

// --- Events & Narrative Tracker ---

export interface CryptoNarrative {
  id: string;
  name: string; // e.g. 'AI & Autonomous Agents', 'Real World Assets'
  mentionVolume24h: number;
  mentionVolumeChangePercent: number;
  marketCapPerformance7dPercent: number;
  topTokens: string[];
  momentumScore: number; // 0 - 100
}

export interface CryptoCalendarEvent {
  id: string;
  title: string;
  date: string;
  category: 'Unlock' | 'Mainnet' | 'Governance' | 'Fed Rate' | 'Airdrop' | 'Conference';
  symbol?: string;
  impact: 'High' | 'Medium' | 'Low';
  description: string;
}

export interface SecurityIntelligence {
  symbol: string;
  auditScore: number; // 0 - 100
  auditors: string[];
  adminKeyMultisig: string;
  upgradeabilityRisk: 'Low' | 'Medium' | 'High';
  oracleDependency: string;
  tvlUSD?: number;
  exploitHistory: string;
}

// --- Pro Tier Entitlements & API ---

export interface UserProProfile {
  isPro: boolean;
  planName: 'Pro Annual' | 'Pro Monthly' | 'Enterprise' | 'Free Tier';
  aiRequestsLimit: number;
  aiRequestsUsed: number;
  apiCallsLimit: number;
  apiCallsUsed: number;
  backtestRunsLimit: number;
  backtestRunsUsed: number;
  apiKey?: string;
  webhookUrl?: string;
}

