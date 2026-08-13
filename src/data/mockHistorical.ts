import { Candle, Timeframe } from '../types/trading';

const BASE_PRICES: Record<string, number> = {
  'BTC/USD': 118492.41,
  'ETH/USD': 4321.88,
  'SOL/USD': 214.50,
  'XAU/USD': 3421.70,
  'EUR/USD': 1.1672,
  'GBP/USD': 1.3120,
  'USD/JPY': 148.45,
  'US100': 23481.20,
  'US500': 6042.80,
  'US30': 44982.20,
  'WTI/USD': 78.40,
  'XAG/USD': 38.60,
  'XRP/USD': 2.45,
  'AUD/USD': 0.6720,
  'USD/CAD': 1.3850,
};

export const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '3m': 180,
  '5m': 300,
  '15m': 900,
  '30m': 1800,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
  '1W': 604800,
};

/**
 * Generate historical candles with realistic drift, volatility clusters, and market structure
 */
export function generateHistoricalCandles(
  symbol: string,
  timeframe: Timeframe,
  count = 200
): Candle[] {
  const basePrice = BASE_PRICES[symbol] || 100;
  const stepSec = TIMEFRAME_SECONDS[timeframe] || 300;
  
  // Align now to exact timeframe step boundary so historical and live tick candles align seamlessly
  const rawNow = Math.floor(Date.now() / 1000);
  const now = Math.floor(rawNow / stepSec) * stepSec;
  
  // Base volatility per candle depending on asset & timeframe
  let volFactor = 0.002;
  if (symbol.includes('BTC') || symbol.includes('SOL')) volFactor = 0.004;
  if (symbol.includes('EUR') || symbol.includes('GBP')) volFactor = 0.0008;
  if (symbol.includes('US100')) volFactor = 0.0025;

  const candles: Candle[] = [];
  let currentPrice = basePrice * (1 - volFactor * Math.sqrt(count) * 0.3);

  const startTime = now - (count - 1) * stepSec;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * stepSec;
    // Introduce periodic wave / trend cycles
    const cycle = Math.sin(i / 15) * 0.5 + Math.cos(i / 7) * 0.3;
    const randomNoise = (Math.random() - 0.49) * 2;
    const pctChange = (cycle * 0.3 + randomNoise) * volFactor;

    const open = currentPrice;
    const close = Math.max(0.0001, open * (1 + pctChange));
    
    // High & Low
    const highWick = Math.random() * volFactor * 1.5;
    const lowWick = Math.random() * volFactor * 1.5;

    const high = Math.max(open, close) * (1 + highWick);
    const low = Math.min(open, close) * (1 - lowWick);

    const baseVol = symbol.includes('BTC') ? 1200 : 8500;
    const volume = Math.round(baseVol * (1 + Math.random() * 2) * (1 + Math.abs(pctChange) * 50));

    candles.push({
      time,
      open: Number(open.toFixed(symbol.includes('EUR') || symbol.includes('GBP') ? 5 : 2)),
      high: Number(high.toFixed(symbol.includes('EUR') || symbol.includes('GBP') ? 5 : 2)),
      low: Number(low.toFixed(symbol.includes('EUR') || symbol.includes('GBP') ? 5 : 2)),
      close: Number(close.toFixed(symbol.includes('EUR') || symbol.includes('GBP') ? 5 : 2)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}
