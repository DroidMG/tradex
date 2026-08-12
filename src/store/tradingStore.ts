import { Asset, AssetCategory, Candle, IndicatorConfig, IndicatorValues, MarketAlert, MarketPressure, MarketRegime, MarketTick, MTFAnalysisResult, SignalResult, SMCAnalysis, Timeframe } from '../types/trading';
import { INITIAL_ASSETS } from '../data/assets';
import { generateHistoricalCandles } from '../data/mockHistorical';
import { MarketDataProvider } from '../services/providers/MarketDataProvider';
import { DemoProvider } from '../services/providers/DemoProvider';
import { CoinGeckoProvider } from '../services/providers/CoinGeckoProvider';
import { CandleAggregator } from '../services/CandleAggregator';
import { calculateAllIndicators } from '../indicators/indicatorsEngine';
import { analyzeSMC } from '../smc/smcEngine';
import { calculateMarketPressure } from '../indicators/marketPressure';
import { calculateMarketRegime } from '../indicators/marketRegime';
import { evaluateSignal } from '../signals/signalEngine';
import { analyzeMultiTimeframe } from '../signals/mtfAnalysis';

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

class TradingStore {
  public assets: Asset[] = [...INITIAL_ASSETS];
  public selectedSymbol = 'BTC/USD';
  public selectedTimeframe: Timeframe = '15m';

  public isDemoMode = true;
  public provider: MarketDataProvider = new DemoProvider();

  public ticks: Map<string, MarketTick> = new Map();
  public priceFlashes: Map<string, 'up' | 'down' | null> = new Map();
  private prevPrices: Map<string, number> = new Map();

  public candlesMap: Map<string, Candle[]> = new Map();
  public indicatorValues: IndicatorValues | null = null;
  public smcAnalysis: SMCAnalysis | null = null;
  public marketPressure: MarketPressure | null = null;
  public marketRegime: MarketRegime | null = null;
  public currentSignal: SignalResult | null = null;
  public mtfResult: MTFAnalysisResult | null = null;

  public overlayToggles: ChartOverlayToggles = {
    ema: true,
    vwap: true,
    bollingerBands: false,
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
  public selectedCategoryFilter: AssetCategory | 'all' | 'favorites' = 'all';
  public searchQuery = '';

  public theme: 'dark' | 'light' = 'dark';
  public isSettingsOpen = false;
  public isBacktestOpen = false;
  public isCommandPaletteOpen = false;
  public isAlertModalOpen = false;

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
      this.provider = new CoinGeckoProvider();
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

  public setTheme(mode: 'dark' | 'light') {
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
