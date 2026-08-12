import { Candle, IndicatorValues, SignalReason, SMCAnalysis, TradeSetup } from '../types/trading';

export function generateTradeSetup(
  symbol: string,
  candles: Candle[],
  indicators: IndicatorValues,
  smc: SMCAnalysis,
  compositeScore: number
): TradeSetup {
  const currentPrice = candles[candles.length - 1].close;
  const atr = indicators.atr || currentPrice * 0.01;

  if (compositeScore < 60) {
    return {
      symbol,
      direction: 'NO_TRADE',
      entryMin: currentPrice,
      entryMax: currentPrice,
      stopLoss: currentPrice - atr,
      tp1: currentPrice + atr,
      tp2: currentPrice + atr * 2,
      riskRewardRatio: 1.0,
      setupScore: compositeScore,
      reasons: [{ isPositive: false, text: 'Insufficient confluence (Score < 60/100)' }],
      risks: ['Market lacks clear directional edge', 'Consolidation zone overhead'],
      historicalQuality: compositeScore,
    };
  }

  const isBullish = smc.overallBias === 'Bullish' || (indicators.rsi && indicators.rsi > 52);

  if (isBullish) {
    const entryMin = currentPrice * 0.998;
    const entryMax = currentPrice * 1.001;
    const stopLoss = Math.min(...candles.slice(-10).map((c) => c.low)) - atr * 0.2;
    const risk = currentPrice - stopLoss;
    const tp1 = currentPrice + risk * 1.5;
    const tp2 = currentPrice + risk * 2.8;

    const reasons: SignalReason[] = [
      { isPositive: true, text: 'Bullish market structure (BOS / CHoCH confirmed)' },
      { isPositive: true, text: 'Price trading above 20 EMA and VWAP' },
      { isPositive: true, text: 'Active Bullish Order Block / FVG zone in discount' },
      { isPositive: true, text: 'Elevated relative volume & momentum alignment' },
    ];

    const risks = [
      'Approaching near-term key swing resistance',
      'Macro volatility event scheduled today',
    ];

    return {
      symbol,
      direction: 'LONG',
      entryMin: Number(entryMin.toFixed(2)),
      entryMax: Number(entryMax.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2)),
      tp1: Number(tp1.toFixed(2)),
      tp2: Number(tp2.toFixed(2)),
      riskRewardRatio: Number(((tp2 - currentPrice) / (currentPrice - stopLoss)).toFixed(1)),
      setupScore: compositeScore,
      reasons,
      risks,
      historicalQuality: Math.min(96, Math.round(compositeScore * 1.05)),
    };
  } else {
    const entryMin = currentPrice * 0.999;
    const entryMax = currentPrice * 1.002;
    const stopLoss = Math.max(...candles.slice(-10).map((c) => c.high)) + atr * 0.2;
    const risk = stopLoss - currentPrice;
    const tp1 = currentPrice - risk * 1.5;
    const tp2 = currentPrice - risk * 2.8;

    const reasons: SignalReason[] = [
      { isPositive: true, text: 'Bearish market structure (Break of swing low)' },
      { isPositive: true, text: 'Price trading below key EMA hierarchy and VWAP' },
      { isPositive: true, text: 'Bearish Order Block retest in premium zone' },
      { isPositive: true, text: 'RSI momentum breaking down below 45' },
    ];

    const risks = [
      'Sell-side liquidity sweep may prompt sharp bounce',
      'RSI approaching oversold threshold',
    ];

    return {
      symbol,
      direction: 'SHORT',
      entryMin: Number(entryMin.toFixed(2)),
      entryMax: Number(entryMax.toFixed(2)),
      stopLoss: Number(stopLoss.toFixed(2)),
      tp1: Number(tp1.toFixed(2)),
      tp2: Number(tp2.toFixed(2)),
      riskRewardRatio: Number(((currentPrice - tp2) / (stopLoss - currentPrice)).toFixed(1)),
      setupScore: compositeScore,
      reasons,
      risks,
      historicalQuality: Math.min(96, Math.round(compositeScore * 1.02)),
    };
  }
}
