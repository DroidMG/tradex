/**
 * Core domain types for Professional Trading Intelligence Terminal
 */

export type AssetCategory = 'crypto' | 'forex' | 'cfd' | 'commodity';

export interface Asset {
  symbol: string;           // e.g., "BTC/USD", "EUR/USD", "US100"
  id: string;               // e.g., "btc-usd"
  name: string;             // e.g., "Bitcoin"
  category: AssetCategory;
  baseSymbol: string;       // e.g., "BTC"
  quoteSymbol: string;      // e.g., "USD"
  decimals: number;         // Decimal precision for display (e.g. 2 for BTC, 4 for EUR/USD)
  coingeckoId?: string;     // e.g., "bitcoin"
  description?: string;
  isFavorite?: boolean;
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
