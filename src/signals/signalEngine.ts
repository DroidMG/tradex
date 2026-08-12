import { Candle, IndicatorValues, SignalResult, SMCAnalysis, Timeframe } from '../types/trading';
import { generateTradeSetup } from './tradeSetup';

export function evaluateSignal(
  symbol: string,
  timeframe: Timeframe,
  candles: Candle[],
  indicators: IndicatorValues,
  smc: SMCAnalysis
): SignalResult {
  const last = candles[candles.length - 1];

  // 1. Technical Score (EMA alignment, VWAP, Bollinger)
  let techScore = 50;
  const ema20 = indicators.ema[20] || last.close;
  const ema50 = indicators.ema[50] || last.close;
  if (last.close > ema20 && ema20 > ema50) techScore += 25;
  else if (last.close < ema20 && ema20 < ema50) techScore -= 25;
  if (indicators.vwap && last.close > indicators.vwap) techScore += 15;

  // 2. Market Structure Score
  let structScore = 50;
  if (smc.overallBias === 'Bullish') structScore = Math.min(95, 50 + smc.biasConfidence * 0.4);
  else if (smc.overallBias === 'Bearish') structScore = Math.max(10, 50 - smc.biasConfidence * 0.4);

  // 3. Momentum Score (RSI, Stoch RSI, MACD)
  let momScore = 50;
  if (indicators.rsi !== null) {
    if (indicators.rsi > 60) momScore += 25;
    else if (indicators.rsi < 40) momScore -= 25;
  }
  if (indicators.macd && indicators.macd.histogram > 0) momScore += 15;

  // 4. Volume Score
  let volScore = 50;
  const rvol = indicators.relativeVolume ?? 1.0;
  if (rvol > 1.3) volScore += 30;

  // 5. SMC Confluence Score
  let smcScore = 50;
  if (smc.orderBlocks.length > 0) smcScore += 20;
  if (smc.fairValueGaps.length > 0) smcScore += 15;

  // 6. Volatility Score
  let volatilityScore = 65;
  if (indicators.adx && indicators.adx.adx > 25) volatilityScore += 20;

  // Composite Score
  const composite = Math.round(
    techScore * 0.2 +
      structScore * 0.25 +
      momScore * 0.2 +
      volScore * 0.15 +
      smcScore * 0.15 +
      volatilityScore * 0.05
  );

  let direction: 'BULLISH BIAS' | 'BEARISH BIAS' | 'NO CLEAR EDGE' = 'NO CLEAR EDGE';
  if (composite >= 62) direction = 'BULLISH BIAS';
  else if (composite <= 38) direction = 'BEARISH BIAS';

  const setup = generateTradeSetup(symbol, candles, indicators, smc, composite);

  return {
    symbol,
    timestamp: Date.now(),
    timeframe,
    direction,
    confidence: Math.min(96, Math.max(20, composite)),
    scores: {
      technicalScore: Math.min(99, Math.max(10, techScore)),
      marketStructureScore: Math.min(99, Math.max(10, structScore)),
      momentumScore: Math.min(99, Math.max(10, momScore)),
      volumeScore: Math.min(99, Math.max(10, volScore)),
      smcConfluenceScore: Math.min(99, Math.max(10, smcScore)),
      volatilityScore: Math.min(99, Math.max(10, volatilityScore)),
      compositeScore: Math.min(99, Math.max(10, composite)),
    },
    reasons: setup.reasons,
    setup,
  };
}
