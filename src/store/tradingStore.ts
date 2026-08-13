import { AlertRule, Asset, AssetCategory, Candle, DashboardLayout, DashboardWidget, IndicatorConfig, IndicatorValues, MarketAlert, MarketPressure, MarketRegime, MarketTick, MTFAnalysisResult, PaperOrder, PaperPosition, SavedScreener, SignalResult, SMCAnalysis, Timeframe, UserProProfile } from '../types/trading';
import { INITIAL_ASSETS } from '../data/assets';
import { generateHistoricalCandles } from '../data/mockHistorical';
import { MarketDataProvider } from '../services/providers/MarketDataProvider';
import { DemoProvider } from '../services/providers/DemoProvider';
import { RealtimeLiveProvider } from '../services/providers/RealtimeLiveProvider';
import { CandleAggregator } from '../services/CandleAggregator';
import { calculateAllIndicators } from '../indicators/indicatorsEngine';
import { analyzeSMC } from '../smc/smcEngine';
import { calculateMarketPressure } from '../indicators/marketPressure';
import { calculateMarketRegime } from '../indicators/marketRegime';
import { evaluateSignal } from '../signals/signalEngine';
import { analyzeMultiTimeframe } from '../signals/mtfAnalysis';
import { CandlestickPatternResult, detectCandlestickPatterns } from '../indicators/candlestickPatterns';
import { ChartPatternResult, detectChartPatterns } from '../indicators/chartPatterns';

export type MainTab =
  | 'dashboard'
  | 'markets'
  | 'chart'
  | 'derivatives'
  | 'onchain'
  | 'scanner'
  | 'portfolio'
  | 'quant';

export const DEFAULT_INDICATOR_CONFIG: IndicatorConfig = {
  emaLengths: [20, 50, 200],
  smaLengths: [20, 50, 200],
  rsiLength: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  stochRsiLength: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  atrLength: 14,
  adxLength: 14,
  bollingerLength: 20,
  bollingerStdDev: 2,
  supertrendPeriod: 10,
  supertrendMultiplier: 3,
  fvgSensitivity: 1,
  obSensitivity: 1,
  swingLength: 5,
  volumeThreshold: 1.2,
};

export interface ChartOverlayToggles {
  ema: boolean;
  vwap: boolean;
  bollingerBands: boolean;
  supertrend: boolean;
  pivotPoints: boolean;
  fibonacci: boolean;
  candlestickPatterns: boolean;
  chartPatterns: boolean;
  orderBlocks: boolean;
  fvg: boolean;
  liquidity: boolean;
  bos: boolean;
  choch: boolean;
  supportResistance: boolean;
  sessionLevels: boolean;
  volume: boolean;
}

export type StoreListener = () => void;

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'w-1', type: 'global_overview', title: 'Global Market Intelligence', colSpan: 4 },
  { id: 'w-2', type: 'ai_summary', title: 'Executive Market Intelligence Brief', colSpan: 2 },
  { id: 'w-3', type: 'fear_greed', title: 'Fear & Greed Index', colSpan: 2 },
  { id: 'w-4', type: 'market_cap', title: 'Total Crypto Market Cap', colSpan: 1 },
  { id: 'w-5', type: 'btc_dominance', title: 'BTC Dominance', colSpan: 1 },
  { id: 'w-6', type: 'eth_dominance', title: 'ETH Dominance', colSpan: 1 },
  { id: 'w-7', type: 'stablecoin_cap', title: 'Stablecoin Market Cap', colSpan: 1 },
  { id: 'w-8', type: 'top_gainers', title: 'Top 24h Gainers', colSpan: 2 },
  { id: 'w-9', type: 'top_losers', title: 'Top 24h Losers', colSpan: 2 },
  { id: 'w-10', type: 'highest_volume', title: 'Highest Volume Assets', colSpan: 2 },
  { id: 'w-11', type: 'sector_perf', title: 'Sector Performance Matrix', colSpan: 2 },
  { id: 'w-12', type: 'whale_feed_quick', title: 'Whale Alert Feed ($100K+)', colSpan: 2 },
  { id: 'w-13', type: 'derivatives_quick', title: 'Derivatives Open Interest & Funding', colSpan: 2 },
  { id: 'w-14', type: 'user_watchlist', title: 'Pinned Watchlist Assets', colSpan: 4 },
];

class TradingStore {
  public assets: Asset[] = [...INITIAL_ASSETS];
  public selectedSymbol = 'BTC/USD';
  public selectedTimeframe: Timeframe = '15m';

  public activeTab: MainTab = 'dashboard';
  public refreshIntervalSec = 1; // 1s live

  public isDemoMode = false;
  public provider: MarketDataProvider = new RealtimeLiveProvider();

  public ticks: Map<string, MarketTick> = new Map();
  public priceFlashes: Map<string, 'up' | 'down' | null> = new Map();
  private prevPrices: Map<string, number> = new Map();

  public candlesMap: Map<string, Candle[]> = new Map();
  public indicatorValues: IndicatorValues | null = null;
  public smcAnalysis: SMCAnalysis | null = null;
  public candlestickPatterns: CandlestickPatternResult[] = [];
  public chartPatterns: ChartPatternResult[] = [];
  public marketPressure: MarketPressure | null = null;
  public marketRegime: MarketRegime | null = null;
  public currentSignal: SignalResult | null = null;
  public mtfResult: MTFAnalysisResult | null = null;

  public chartType: 'candlestick' | 'heikinAshi' | 'line' = 'candlestick';

  public overlayToggles: ChartOverlayToggles = {
    ema: true,
    vwap: true,
    bollingerBands: false,
    supertrend: true,
    pivotPoints: false,
    fibonacci: false,
    candlestickPatterns: true,
    chartPatterns: true,
    orderBlocks: true,
    fvg: true,
    liquidity: true,
    bos: true,
    choch: true,
    supportResistance: true,
    sessionLevels: false,
    volume: true,
  };

  public indicatorConfig: IndicatorConfig = { ...DEFAULT_INDICATOR_CONFIG };
  public alerts: MarketAlert[] = [];
  public customAlertRules: AlertRule[] = [];
  public selectedCategoryFilter: AssetCategory | 'all' | 'favorites' = 'all';
  public searchQuery = '';

  public theme: 'dark' | 'light' | 'terminal' = 'dark';
  public isSettingsOpen = false;
  public isBacktestOpen = false;
  public isCommandPaletteOpen = false;
  public isAlertModalOpen = false;
  public isPatternPanelOpen = false;
  public isProModalOpen = false;

  // Pro Entitlements
  public proProfile: UserProProfile = {
    isPro: true,
    planName: 'Pro Annual',
    aiRequestsLimit: 1000,
    aiRequestsUsed: 42,
    apiCallsLimit: 10000,
    apiCallsUsed: 820,
    backtestRunsLimit: 500,
    backtestRunsUsed: 18,
    apiKey: 'tx_pro_live_9f8a2e7c1d3b4a5e6f7a',
    webhookUrl: 'https://api.tradexpro.ai/v1/webhook/user_main',
  };

  // Dashboards Layouts
  public dashboardLayouts: DashboardLayout[] = [
    {
      id: 'default_pro',
      name: 'Executive Intelligence',
      widgets: [...DEFAULT_WIDGETS],
    },
    {
      id: 'trader_quant',
      name: 'Quant & Derivatives Focus',
      widgets: DEFAULT_WIDGETS.filter((w) => ['derivatives_quick', 'whale_feed_quick', 'sector_perf', 'ai_summary'].includes(w.type)),
    },
  ];
  public activeLayoutId = 'default_pro';

  // Paper Trading State
  public paperBalanceUSD = 100000;
  public paperOrders: PaperOrder[] = [];
  public paperPositions: PaperPosition[] = [
    {
      id: 'pos-1',
      symbol: 'BTC/USD',
      side: 'LONG',
      entryPrice: 94200,
      currentPrice: 95400,
      amount: 0.5,
      unrealizedPnl: 600,
      unrealizedPnlPercent: 1.27,
      leverage: 5,
      stopLoss: 92000,
      takeProfit: 98000,
      openedAt: Date.now() - 3600000 * 12,
    },
  ];

  // Saved Screeners
  public savedScreeners: SavedScreener[] = [
    {
      id: 'scr-1',
      name: 'Bullish Momentum & Whale Inflow',
      description: 'Volume > $50M, RSI 50-70, positive 24h price change',
      logic: 'AND',
      conditions: [
        { id: 'c1', metric: 'priceChange24h', operator: '>', value: 2 },
        { id: 'c2', metric: 'rsi14', operator: '>', value: 50 },
      ],
    },
  ];

  private listeners: Set<StoreListener> = new Set();
  private aggregator: CandleAggregator | null = null;

  constructor() {
    this.loadPersistedConfig();
    this.initializeSymbol(this.selectedSymbol);
    this.startDataStream();
  }

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify() {
    this.listeners.forEach((l) => l());
  }

  public setActiveTab(tab: MainTab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.notify();
  }

  public setRefreshInterval(sec: number) {
    this.refreshIntervalSec = sec;
    this.notify();
  }

  public toggleProStatus() {
    this.proProfile.isPro = !this.proProfile.isPro;
    this.notify();
  }

  public selectSymbol(symbol: string) {
    if (this.selectedSymbol === symbol) return;
    this.selectedSymbol = symbol;
    this.initializeSymbol(symbol);
    this.notify();
  }

  public selectTimeframe(tf: Timeframe) {
    if (this.selectedTimeframe === tf) return;
    this.selectedTimeframe = tf;
    this.initializeSymbol(this.selectedSymbol);
    this.notify();
  }

  public toggleDemoMode(enableDemo: boolean) {
    if (this.isDemoMode === enableDemo) return;
    this.isDemoMode = enableDemo;
    this.provider.unsubscribe(this.assets.map((a) => a.symbol));

    if (enableDemo) {
      this.provider = new DemoProvider();
    } else {
      this.provider = new RealtimeLiveProvider();
    }

    this.startDataStream();
    this.notify();
  }

  public toggleFavorite(symbol: string) {
    const asset = this.assets.find((a) => a.symbol === symbol);
    if (asset) {
      asset.isFavorite = !asset.isFavorite;
      this.notify();
    }
  }

  public setChartType(type: 'candlestick' | 'heikinAshi' | 'line') {
    if (this.chartType === type) return;
    this.chartType = type;
    this.notify();
  }

  public toggleOverlay(key: keyof ChartOverlayToggles) {
    this.overlayToggles[key] = !this.overlayToggles[key];
    this.notify();
  }

  public updateIndicatorConfig(newConfig: Partial<IndicatorConfig>) {
    this.indicatorConfig = { ...this.indicatorConfig, ...newConfig };
    this.savePersistedConfig();
    this.recalculateAll();
    this.notify();
  }

  public addWidgetToActiveLayout(widgetType: DashboardWidget['type'], title: string) {
    const layout = this.dashboardLayouts.find((l) => l.id === this.activeLayoutId);
    if (layout) {
      layout.widgets.push({
        id: `w-${Date.now()}`,
        type: widgetType,
        title,
        colSpan: 2,
      });
      this.notify();
    }
  }

  public removeWidgetFromActiveLayout(widgetId: string) {
    const layout = this.dashboardLayouts.find((l) => l.id === this.activeLayoutId);
    if (layout) {
      layout.widgets = layout.widgets.filter((w) => w.id !== widgetId);
      this.notify();
    }
  }

  public resetActiveDashboardLayout() {
    const layout = this.dashboardLayouts.find((l) => l.id === this.activeLayoutId);
    if (layout) {
      layout.widgets = [...DEFAULT_WIDGETS];
      this.notify();
    }
  }

  public placePaperOrder(order: Omit<PaperOrder, 'id' | 'status' | 'timestamp'>) {
    const newOrder: PaperOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      status: 'FILLED',
      timestamp: Date.now(),
    };
    this.paperOrders.unshift(newOrder);

    // Create or modify paper position
    const existing = this.paperPositions.find((p) => p.symbol === order.symbol && p.side === (order.side === 'BUY' ? 'LONG' : 'SHORT'));
    if (existing) {
      existing.amount += order.amount;
    } else {
      this.paperPositions.push({
        id: `pos-${Date.now()}`,
        symbol: order.symbol,
        side: order.side === 'BUY' ? 'LONG' : 'SHORT',
        entryPrice: order.price,
        currentPrice: order.price,
        amount: order.amount,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        leverage: 1,
        openedAt: Date.now(),
      });
    }

    if (this.proProfile) this.proProfile.backtestRunsUsed += 1;
    this.notify();
  }

  public closePaperPosition(positionId: string) {
    this.paperPositions = this.paperPositions.filter((p) => p.id !== positionId);
    this.notify();
  }

  public addAlertRule(rule: Omit<AlertRule, 'id' | 'triggered' | 'createdAt'>) {
    this.customAlertRules.unshift({
      ...rule,
      id: `rule-${Date.now()}`,
      triggered: false,
      createdAt: Date.now(),
    });
    this.notify();
  }

  public deleteAlertRule(ruleId: string) {
    this.customAlertRules = this.customAlertRules.filter((r) => r.id !== ruleId);
    this.notify();
  }

  public setTheme(mode: 'dark' | 'light' | 'terminal') {
    this.theme = mode;
    this.notify();
  }

  private initializeSymbol(symbol: string) {
    const candles = generateHistoricalCandles(symbol, this.selectedTimeframe, 200);
    this.candlesMap.set(symbol, candles);

    this.aggregator = new CandleAggregator({ [this.selectedTimeframe]: candles });

    this.aggregator.subscribe(this.selectedTimeframe, (updatedCandle) => {
      const currentArr = this.candlesMap.get(symbol) || [];
      if (currentArr.length === 0) return;

      const last = currentArr[currentArr.length - 1];
      if (last.time === updatedCandle.time) {
        currentArr[currentArr.length - 1] = { ...updatedCandle };
      } else {
        currentArr.push({ ...updatedCandle });
      }
      this.recalculateAll();
      this.notify();
    });

    this.recalculateAll();
  }

  private recalculateAll() {
    const candles = this.candlesMap.get(this.selectedSymbol) || [];
    if (candles.length === 0) return;

    this.indicatorValues = calculateAllIndicators(candles, this.indicatorConfig);
    this.smcAnalysis = analyzeSMC(candles, this.selectedTimeframe);
    this.candlestickPatterns = detectCandlestickPatterns(candles);
    this.chartPatterns = detectChartPatterns(candles, this.smcAnalysis.swings);
    this.marketPressure = calculateMarketPressure(candles, this.indicatorValues, this.smcAnalysis);
    this.marketRegime = calculateMarketRegime(candles, this.indicatorValues);
    this.currentSignal = evaluateSignal(
      this.selectedSymbol,
      this.selectedTimeframe,
      candles,
      this.indicatorValues,
      this.smcAnalysis
    );
    this.mtfResult = analyzeMultiTimeframe(this.selectedSymbol);
  }

  private startDataStream() {
    const symbols = this.assets.map((a) => a.symbol);
    this.provider.subscribe(symbols, (tick: MarketTick) => {
      const prevPrice = this.prevPrices.get(tick.symbol);
      if (prevPrice !== undefined) {
        if (tick.last > prevPrice) this.priceFlashes.set(tick.symbol, 'up');
        else if (tick.last < prevPrice) this.priceFlashes.set(tick.symbol, 'down');
      }
      this.prevPrices.set(tick.symbol, tick.last);
      this.ticks.set(tick.symbol, tick);

      if (tick.symbol === this.selectedSymbol && this.aggregator) {
        this.aggregator.processTick(tick, [this.selectedTimeframe]);
      }

      this.notify();
    });
  }

  private loadPersistedConfig() {
    try {
      const stored = localStorage.getItem('trader_indicator_config');
      if (stored) {
        this.indicatorConfig = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  private savePersistedConfig() {
    try {
      localStorage.setItem('trader_indicator_config', JSON.stringify(this.indicatorConfig));
    } catch {
      // Ignore
    }
  }
}

export const tradingStore = new TradingStore();

