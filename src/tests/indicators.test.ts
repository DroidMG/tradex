import { describe, it, expect } from 'vitest';
import { calculateEMA, calculateSMA, calculateRSI, calculateATR, calculateVWAP } from '../indicators/indicatorsEngine';
import { generateHistoricalCandles } from '../data/mockHistorical';

describe('Technical Indicators Engine', () => {
  it('should correctly calculate Simple Moving Average (SMA)', () => {
    const prices = [10, 20, 30, 40, 50];
    const sma3 = calculateSMA(prices, 3);
    expect(sma3[2]).toBe(20);
    expect(sma3[4]).toBe(40);
  });

  it('should correctly calculate Exponential Moving Average (EMA)', () => {
    const prices = [10, 20, 30, 40, 50, 60, 70];
    const ema5 = calculateEMA(prices, 5);
    expect(ema5[4]).not.toBeNull();
    expect(ema5[6]!).toBeGreaterThan(ema5[4]!);
  });

  it('should calculate Relative Strength Index (RSI) within bounds 0-100', () => {
    const candles = generateHistoricalCandles('BTC/USD', '15m', 50);
    const closes = candles.map((c) => c.close);
    const rsi = calculateRSI(closes, 14);

    const validRsi = rsi.filter((v): v is number => v !== null);
    expect(validRsi.length).toBeGreaterThan(0);
    validRsi.forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });

  it('should calculate Average True Range (ATR)', () => {
    const candles = generateHistoricalCandles('BTC/USD', '15m', 50);
    const atr = calculateATR(candles, 14);
    const validAtr = atr.filter((v): v is number => v !== null);
    expect(validAtr.length).toBeGreaterThan(0);
    expect(validAtr[validAtr.length - 1]).toBeGreaterThan(0);
  });

  it('should calculate Volume Weighted Average Price (VWAP)', () => {
    const candles = generateHistoricalCandles('BTC/USD', '15m', 20);
    const vwap = calculateVWAP(candles);
    expect(vwap.length).toBe(20);
    expect(vwap[19]).toBeGreaterThan(0);
  });
});
