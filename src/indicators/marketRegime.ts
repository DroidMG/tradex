import { Candle, IndicatorValues, MarketRegime, MarketRegimeType, VolatilityState } from '../types/trading';

export function calculateMarketRegime(
  candles: Candle[],
  indicators: IndicatorValues
): MarketRegime {
  const adxVal = indicators.adx?.adx ?? 20;
  const bbWidth = indicators.bollingerBands?.width ?? 2.0;
  const atr = indicators.atr ?? 1.0;

  let regime: MarketRegimeType = 'RANGING';
  let volatilityState: VolatilityState = 'NORMAL';
  let isTradable = true;
  let description = '';

  if (adxVal > 28) {
    regime = 'TRENDING';
    description = 'Strong trending environment with directional momentum.';
  } else if (adxVal < 18) {
    regime = 'RANGING';
    description = 'Ranging / sideways consolidation phase.';
  } else if (bbWidth < 1.2) {
    regime = 'COMPRESSION' as MarketRegimeType;
    volatilityState = 'COMPRESSING';
    description = 'Bollinger Band volatility squeeze detected. Expect imminent expansion.';
  }

  if (bbWidth > 4.0 || (indicators.relativeVolume && indicators.relativeVolume > 2.2)) {
    volatilityState = 'EXPANDING';
    if (regime !== 'TRENDING') regime = 'BREAKOUT';
    description = 'High volatility expansion with elevated volume.';
  }

  if (adxVal < 14 && bbWidth < 1.0) {
    volatilityState = 'COMPRESSING';
    isTradable = false;
    description = 'Low liquidity compression. Caution recommended.';
  }

  return {
    regime,
    volatilityState,
    adxValue: adxVal,
    atrPercentile: Math.min(99, Math.round((atr / (candles[candles.length - 1]?.close || 1)) * 5000)),
    description,
    isTradable,
  };
}
