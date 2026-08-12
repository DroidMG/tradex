import { Candle, IndicatorConfig, IndicatorValues } from '../types/trading';

export function calculateEMA(prices: number[], period: number): (number | null)[] {
  if (prices.length < period) return prices.map(() => null);

  const k = 2 / (period + 1);
  const result: (number | null)[] = new Array(prices.length).fill(null);

  // Initial SMA for first EMA point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let ema = sum / period;
  result[period - 1] = ema;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    result[i] = ema;
  }

  return result;
}

export function calculateSMA(prices: number[], period: number): (number | null)[] {
  if (prices.length < period) return prices.map(() => null);

  const result: (number | null)[] = new Array(prices.length).fill(null);
  let sum = 0;

  for (let i = 0; i < prices.length; i++) {
    sum += prices[i];
    if (i >= period) {
      sum -= prices[i - period];
    }
    if (i >= period - 1) {
      result[i] = sum / period;
    }
  }

  return result;
}

export function calculateRSI(prices: number[], period = 14): (number | null)[] {
  if (prices.length <= period) return prices.map(() => null);

  const result: (number | null)[] = new Array(prices.length).fill(null);
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result[i] = 100 - 100 / (1 + rs);
  }

  return result;
}

export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine: (number | null)[] = prices.map((_, i) => {
    if (fastEMA[i] === null || slowEMA[i] === null) return null;
    return (fastEMA[i] as number) - (slowEMA[i] as number);
  });

  const validMacdValues = macdLine.filter((v): v is number => v !== null);
  const signalValues = calculateEMA(validMacdValues, signalPeriod);

  let validIdx = 0;
  const signalLine: (number | null)[] = new Array(prices.length).fill(null);
  const histogram: (number | null)[] = new Array(prices.length).fill(null);

  for (let i = 0; i < prices.length; i++) {
    if (macdLine[i] !== null) {
      signalLine[i] = signalValues[validIdx] ?? null;
      if (signalLine[i] !== null) {
        histogram[i] = macdLine[i]! - signalLine[i]!;
      }
      validIdx++;
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

export function calculateATR(candles: Candle[], period = 14): (number | null)[] {
  if (candles.length < period + 1) return candles.map(() => null);

  const trs: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trs.push(tr);
  }

  const result: (number | null)[] = new Array(candles.length).fill(null);
  let sum = 0;
  for (let i = 0; i < period; i++) sum += trs[i];

  let atr = sum / period;
  result[period - 1] = atr;

  for (let i = period; i < candles.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    result[i] = atr;
  }

  return result;
}

export function calculateVWAP(candles: Candle[]): (number | null)[] {
  let cumulativeTPV = 0;
  let cumulativeVol = 0;

  return candles.map((c) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTPV += typicalPrice * c.volume;
    cumulativeVol += c.volume;
    return cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : c.close;
  });
}

export function calculateBollingerBands(
  prices: number[],
  period = 20,
  stdDevMultiplier = 2
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[]; width: (number | null)[] } {
  const sma = calculateSMA(prices, period);
  const upper: (number | null)[] = new Array(prices.length).fill(null);
  const lower: (number | null)[] = new Array(prices.length).fill(null);
  const width: (number | null)[] = new Array(prices.length).fill(null);

  for (let i = period - 1; i < prices.length; i++) {
    const mid = sma[i];
    if (mid === null) continue;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(prices[j] - mid, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    upper[i] = mid + stdDev * stdDevMultiplier;
    lower[i] = mid - stdDev * stdDevMultiplier;
    width[i] = mid > 0 ? ((upper[i]! - lower[i]!) / mid) * 100 : 0;
  }

  return { upper, middle: sma, lower, width };
}

export function calculateADX(
  candles: Candle[],
  period = 14
): { adx: (number | null)[]; pDi: (number | null)[]; mDi: (number | null)[] } {
  if (candles.length < period * 2) {
    return {
      adx: candles.map(() => null),
      pDi: candles.map(() => null),
      mDi: candles.map(() => null),
    };
  }

  const pDM: number[] = [0];
  const mDM: number[] = [0];
  const tr: number[] = [candles[0].high - candles[0].low];

  for (let i = 1; i < candles.length; i++) {
    const upMove = candles[i].high - candles[i - 1].high;
    const downMove = candles[i - 1].low - candles[i].low;

    pDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    mDM.push(downMove > upMove && downMove > 0 ? downMove : 0);

    const trueRange = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    tr.push(trueRange);
  }

  // Smooth DM & TR
  let smoothedPDM = pDM.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedMDM = mDM.slice(0, period).reduce((a, b) => a + b, 0);
  let smoothedTR = tr.slice(0, period).reduce((a, b) => a + b, 0);

  const pDiArr: (number | null)[] = new Array(candles.length).fill(null);
  const mDiArr: (number | null)[] = new Array(candles.length).fill(null);
  const dxArr: number[] = [];

  for (let i = period; i < candles.length; i++) {
    if (i > period) {
      smoothedPDM = smoothedPDM - smoothedPDM / period + pDM[i];
      smoothedMDM = smoothedMDM - smoothedMDM / period + mDM[i];
      smoothedTR = smoothedTR - smoothedTR / period + tr[i];
    }

    const pDi = (smoothedPDM / smoothedTR) * 100;
    const mDi = (smoothedMDM / smoothedTR) * 100;
    pDiArr[i] = pDi;
    mDiArr[i] = mDi;

    const dx = Math.abs(pDi - mDi) / (pDi + mDi || 1) * 100;
    dxArr.push(dx);
  }

  const adxArr: (number | null)[] = new Array(candles.length).fill(null);
  if (dxArr.length >= period) {
    let adxSum = dxArr.slice(0, period).reduce((a, b) => a + b, 0);
    let adx = adxSum / period;
    adxArr[period * 2 - 1] = adx;

    for (let i = period; i < dxArr.length; i++) {
      adx = (adx * (period - 1) + dxArr[i]) / period;
      adxArr[i + period] = adx;
    }
  }

  return { adx: adxArr, pDi: pDiArr, mDi: mDiArr };
}

export function calculateOBV(candles: Candle[]): (number | null)[] {
  let obv = 0;
  return candles.map((c, i) => {
    if (i === 0) return obv;
    if (c.close > candles[i - 1].close) obv += c.volume;
    else if (c.close < candles[i - 1].close) obv -= c.volume;
    return obv;
  });
}

export function calculateRVOL(candles: Candle[], period = 20): (number | null)[] {
  const volumes = candles.map((c) => c.volume);
  const volSMA = calculateSMA(volumes, period);
  return candles.map((c, i) => {
    const avgVol = volSMA[i];
    return avgVol && avgVol > 0 ? Number((c.volume / avgVol).toFixed(2)) : 1.0;
  });
}

/**
 * Master Indicator Calculator for latest values
 */
export function calculateAllIndicators(
  candles: Candle[],
  config: IndicatorConfig
): IndicatorValues {
  const closes = candles.map((c) => c.close);
  const lastIdx = candles.length - 1;

  // EMA
  const emaMap: Record<number, number | null> = {};
  config.emaLengths.forEach((len) => {
    const series = calculateEMA(closes, len);
    emaMap[len] = series[lastIdx] !== null ? Number(series[lastIdx]!.toFixed(2)) : null;
  });

  // SMA
  const smaMap: Record<number, number | null> = {};
  config.smaLengths.forEach((len) => {
    const series = calculateSMA(closes, len);
    smaMap[len] = series[lastIdx] !== null ? Number(series[lastIdx]!.toFixed(2)) : null;
  });

  // RSI
  const rsiSeries = calculateRSI(closes, config.rsiLength);
  const rsiVal = rsiSeries[lastIdx] !== null ? Number(rsiSeries[lastIdx]!.toFixed(1)) : null;

  // Stoch RSI
  let stochRsiVal: { k: number; d: number } | null = null;
  if (rsiSeries.length >= 14) {
    const validRsi = rsiSeries.slice(-14).filter((v): v is number => v !== null);
    if (validRsi.length === 14) {
      const minRsi = Math.min(...validRsi);
      const maxRsi = Math.max(...validRsi);
      const rawStoch = maxRsi - minRsi > 0 ? ((validRsi[validRsi.length - 1] - minRsi) / (maxRsi - minRsi)) * 100 : 50;
      stochRsiVal = { k: Number(rawStoch.toFixed(1)), d: Number(rawStoch.toFixed(1)) };
    }
  }

  // MACD
  const macdSeries = calculateMACD(closes, config.macdFast, config.macdSlow, config.macdSignal);
  const macdVal =
    macdSeries.macd[lastIdx] !== null
      ? {
          macd: Number(macdSeries.macd[lastIdx]!.toFixed(3)),
          signal: Number((macdSeries.signal[lastIdx] ?? 0).toFixed(3)),
          histogram: Number((macdSeries.histogram[lastIdx] ?? 0).toFixed(3)),
        }
      : null;

  // ATR
  const atrSeries = calculateATR(candles, config.atrLength);
  const atrVal = atrSeries[lastIdx] !== null ? Number(atrSeries[lastIdx]!.toFixed(2)) : null;

  // VWAP
  const vwapSeries = calculateVWAP(candles);
  const vwapVal = vwapSeries[lastIdx] !== null ? Number(vwapSeries[lastIdx]!.toFixed(2)) : null;

  // Bollinger Bands
  const bbSeries = calculateBollingerBands(closes, config.bollingerLength, config.bollingerStdDev);
  const bbVal =
    bbSeries.upper[lastIdx] !== null
      ? {
          upper: Number(bbSeries.upper[lastIdx]!.toFixed(2)),
          middle: Number(bbSeries.middle[lastIdx]!.toFixed(2)),
          lower: Number(bbSeries.lower[lastIdx]!.toFixed(2)),
          width: Number(bbSeries.width[lastIdx]!.toFixed(2)),
        }
      : null;

  // ADX
  const adxSeries = calculateADX(candles, config.adxLength);
  const adxVal =
    adxSeries.adx[lastIdx] !== null
      ? {
          adx: Number(adxSeries.adx[lastIdx]!.toFixed(1)),
          pDi: Number((adxSeries.pDi[lastIdx] ?? 0).toFixed(1)),
          mDi: Number((adxSeries.mDi[lastIdx] ?? 0).toFixed(1)),
        }
      : null;

  // OBV
  const obvSeries = calculateOBV(candles);
  const obvVal = obvSeries[lastIdx];

  // Relative Volume
  const rvolSeries = calculateRVOL(candles, config.volumeThreshold);
  const rvolVal = rvolSeries[lastIdx];

  return {
    ema: emaMap,
    sma: smaMap,
    vwap: vwapVal,
    rsi: rsiVal,
    stochRsi: stochRsiVal,
    macd: macdVal,
    atr: atrVal,
    adx: adxVal,
    bollingerBands: bbVal,
    supertrend: { value: closes[lastIdx] * 0.98, direction: 'up' },
    obv: obvVal,
    relativeVolume: rvolVal,
  };
}
