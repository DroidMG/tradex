import { Candle, IndicatorValues, MarketPressure, PressureBreakdown, SMCAnalysis } from '../types/trading';

export function calculateMarketPressure(
  candles: Candle[],
  indicators: IndicatorValues,
  smc: SMCAnalysis
): MarketPressure {
  if (candles.length < 5) {
    return {
      buyPower: 50,
      sellPower: 50,
      buyBreakdown: [],
      sellBreakdown: [],
      dominantSide: 'BALANCED',
    };
  }

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];

  let buyScore = 0;
  let sellScore = 0;

  const buyComponents: PressureBreakdown[] = [];
  const sellComponents: PressureBreakdown[] = [];

  // 1. Price Momentum & Candle Body Strength (0-20 pts)
  const bodySize = Math.abs(lastCandle.close - lastCandle.open);
  const totalRange = lastCandle.high - lastCandle.low || 0.0001;
  const bodyRatio = bodySize / totalRange;

  if (lastCandle.close > lastCandle.open) {
    const pts = Math.round(10 + bodyRatio * 10);
    buyScore += pts;
    buyComponents.push({ component: 'Momentum', score: pts, description: 'Bullish candle body closure' });
  } else {
    const pts = Math.round(10 + bodyRatio * 10);
    sellScore += pts;
    sellComponents.push({ component: 'Momentum', score: pts, description: 'Bearish candle body closure' });
  }

  // 2. Volume & Relative Volume (0-18 pts)
  const rvol = indicators.relativeVolume ?? 1.0;
  if (rvol > 1.2) {
    const pts = Math.min(18, Math.round(rvol * 8));
    if (lastCandle.close > lastCandle.open) {
      buyScore += pts;
      buyComponents.push({ component: 'Volume', score: pts, description: `High relative volume (${rvol}x)` });
    } else {
      sellScore += pts;
      sellComponents.push({ component: 'Volume', score: pts, description: `High relative volume (${rvol}x)` });
    }
  } else {
    buyComponents.push({ component: 'Volume', score: 8, description: 'Normal relative volume' });
    sellComponents.push({ component: 'Volume', score: 8, description: 'Normal relative volume' });
    buyScore += 8;
    sellScore += 8;
  }

  // 3. Market Structure & SMC (0-20 pts)
  if (smc.overallBias === 'Bullish') {
    const pts = Math.round(smc.biasConfidence * 0.2);
    buyScore += pts;
    buyComponents.push({ component: 'Market Structure', score: pts, description: 'Bullish BOS/CHoCH alignment' });
  } else if (smc.overallBias === 'Bearish') {
    const pts = Math.round(smc.biasConfidence * 0.2);
    sellScore += pts;
    sellComponents.push({ component: 'Market Structure', score: pts, description: 'Bearish BOS/CHoCH alignment' });
  }

  // 4. VWAP Relationship (0-15 pts)
  if (indicators.vwap) {
    if (lastCandle.close > indicators.vwap) {
      const pts = 12;
      buyScore += pts;
      buyComponents.push({ component: 'VWAP', score: pts, description: 'Trading above institutional VWAP' });
    } else {
      const pts = 12;
      sellScore += pts;
      sellComponents.push({ component: 'VWAP', score: pts, description: 'Trading below institutional VWAP' });
    }
  }

  // 5. RSI Regime (0-15 pts)
  if (indicators.rsi !== null) {
    if (indicators.rsi > 55) {
      const pts = Math.min(15, Math.round((indicators.rsi - 50) * 0.6));
      buyScore += pts;
      buyComponents.push({ component: 'RSI Regime', score: pts, description: `Bullish RSI momentum (${indicators.rsi})` });
    } else if (indicators.rsi < 45) {
      const pts = Math.min(15, Math.round((50 - indicators.rsi) * 0.6));
      sellScore += pts;
      sellComponents.push({ component: 'RSI Regime', score: pts, description: `Bearish RSI momentum (${indicators.rsi})` });
    }
  }

  // 6. Liquidity & Sweep (0-12 pts)
  const sweptBuy = smc.liquidityLevels.some((l) => l.swept && l.bias === 'Buy-side');
  const sweptSell = smc.liquidityLevels.some((l) => l.swept && l.bias === 'Sell-side');

  if (sweptSell) {
    // Sell-side liquidity swept = fuel for Long move
    buyScore += 10;
    buyComponents.push({ component: 'Liquidity', score: 10, description: 'Sell-side liquidity swept (reversal fuel)' });
  }
  if (sweptBuy) {
    sellScore += 10;
    sellComponents.push({ component: 'Liquidity', score: 10, description: 'Buy-side liquidity swept (reversal fuel)' });
  }

  const finalBuy = Math.min(98, Math.max(12, buyScore));
  const finalSell = Math.min(98, Math.max(12, sellScore));

  let dominantSide: 'BUYERS' | 'SELLERS' | 'BALANCED' = 'BALANCED';
  if (finalBuy > finalSell + 15) dominantSide = 'BUYERS';
  else if (finalSell > finalBuy + 15) dominantSide = 'SELLERS';

  return {
    buyPower: finalBuy,
    sellPower: finalSell,
    buyBreakdown: buyComponents,
    sellBreakdown: sellComponents,
    dominantSide,
  };
}
