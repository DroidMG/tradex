import { describe, it, expect } from 'vitest';
import { detectSwingPoints, detectFairValueGaps, calculateDealingRange, analyzeSMC } from '../smc/smcEngine';
import { generateHistoricalCandles } from '../data/mockHistorical';

describe('SMC Market Structure Engine', () => {
  it('should detect swing points in candle series', () => {
    const candles = generateHistoricalCandles('BTC/USD', '15m', 100);
    const swings = detectSwingPoints(candles, 3);
    expect(swings.length).toBeGreaterThan(0);
  });

  it('should calculate dealing range equilibrium correctly', () => {
    const candles = generateHistoricalCandles('BTC/USD', '15m', 50);
    const range = calculateDealingRange(candles);
    expect(range.high).toBeGreaterThan(range.low);
    expect(range.equilibrium).toBe((range.high + range.low) / 2);
  });

  it('should run full SMC analysis pipeline', () => {
    const candles = generateHistoricalCandles('BTC/USD', '15m', 100);
    const smc = analyzeSMC(candles, '15m');

    expect(smc.swings).toBeDefined();
    expect(smc.orderBlocks).toBeDefined();
    expect(smc.fairValueGaps).toBeDefined();
    expect(smc.dealingRange).toBeDefined();
  });
});
