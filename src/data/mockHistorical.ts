import { Candle, Timeframe } from '../types/trading';

const BASE_PRICES: Record<string, number> = {
  'BTC/USD': 96450.00,
  'ETH/USD': 3420.50,
  'SOL/USD': 214.80,
  'AVAX/USD': 36.40,
  'SUI/USD': 3.85,
  'ARB/USD': 0.98,
  'OP/USD': 2.15,
  'FET/USD': 1.62,
  'RENDER/USD': 6.45,
  'UNI/USD': 9.80,
  'AAVE/USD': 194.20,
  'DOGE/USD': 0.285,
  'PEPE/USD': 0.00001850,
  'ONDO/USD': 1.12,
  'BNB/USD': 642.10,
  'XRP/USD': 2.45,
  'XAU/USD': 2942.50,
  'EUR/USD': 1.0845,
  'GBP/USD': 1.2980,
  'USD/JPY': 152.40,
  'US100': 21450.00,
  'US500': 5980.00,
  'US30': 43850.00,
  'WTI/USD': 74.20,
  'XAG/USD': 32.60,
  'AUD/USD': 0.6540,
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
