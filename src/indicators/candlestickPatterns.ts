import { Candle } from '../types/trading';

export interface CandlestickPatternResult {
  id: string;
  index: number;
  time: number;
  name: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  significance: 'High' | 'Medium' | 'Low';
  description: string;
  candlePrice: number;
}

export function detectCandlestickPatterns(candles: Candle[]): CandlestickPatternResult[] {
  if (candles.length < 3) return [];

  const patterns: CandlestickPatternResult[] = [];
  const len = candles.length;

  // We scan the recent candles (e.g. last 100)
  const startIdx = Math.max(0, len - 100);

  for (let i = startIdx + 2; i < len; i++) {
    const prev2 = candles[i - 2];
    const prev1 = candles[i - 1];
    const curr = candles[i];

    const bodyCurr = Math.abs(curr.close - curr.open);
    const rangeCurr = curr.high - curr.low;
    const isBullCurr = curr.close >= curr.open;
    const isBearCurr = curr.close < curr.open;

    const bodyPrev1 = Math.abs(prev1.close - prev1.open);
    const rangePrev1 = prev1.high - prev1.low;
    const isBullPrev1 = prev1.close >= prev1.open;
    const isBearPrev1 = prev1.close < prev1.open;

    const upperWickCurr = isBullCurr ? curr.high - curr.close : curr.high - curr.open;
    const lowerWickCurr = isBullCurr ? curr.open - curr.low : curr.close - curr.low;

    if (rangeCurr === 0) continue;

    // 1. Hammer (Bullish Reversal)
    if (
      lowerWickCurr >= bodyCurr * 2 &&
      upperWickCurr <= bodyCurr * 0.5 &&
      bodyCurr / rangeCurr <= 0.35 &&
      isBearPrev1
    ) {
      patterns.push({
        id: `hammer-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Hammer',
        type: 'Bullish',
        significance: 'High',
        description: 'Strong bullish rejection of lower prices after a downtrend.',
        candlePrice: curr.low,
      });
    }

    // 2. Shooting Star (Bearish Reversal)
    if (
      upperWickCurr >= bodyCurr * 2 &&
      lowerWickCurr <= bodyCurr * 0.5 &&
      bodyCurr / rangeCurr <= 0.35 &&
      isBullPrev1
    ) {
      patterns.push({
        id: `shooting-star-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Shooting Star',
        type: 'Bearish',
        significance: 'High',
        description: 'Strong bearish rejection of higher prices at resistance.',
        candlePrice: curr.high,
      });
    }

    // 3. Bullish Engulfing
    if (
      isBearPrev1 &&
      isBullCurr &&
      curr.close > prev1.open &&
      curr.open < prev1.close &&
      bodyCurr > bodyPrev1
    ) {
      patterns.push({
        id: `bull-engulf-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bullish Engulfing',
        type: 'Bullish',
        significance: 'High',
        description: 'Buyers completely override previous candle selling pressure.',
        candlePrice: curr.low,
      });
    }

    // 4. Bearish Engulfing
    if (
      isBullPrev1 &&
      isBearCurr &&
      curr.close < prev1.open &&
      curr.open > prev1.close &&
      bodyCurr > bodyPrev1
    ) {
      patterns.push({
        id: `bear-engulf-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bearish Engulfing',
        type: 'Bearish',
        significance: 'High',
        description: 'Sellers completely engulf previous candle bullish movement.',
        candlePrice: curr.high,
      });
    }

    // 5. Doji (Indecision / Pivot)
    if (bodyCurr / rangeCurr <= 0.1) {
      const isDragonfly = lowerWickCurr >= rangeCurr * 0.7;
      const isGravestone = upperWickCurr >= rangeCurr * 0.7;

      let name = 'Doji';
      let type: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';

      if (isDragonfly) {
        name = 'Dragonfly Doji';
        type = 'Bullish';
      } else if (isGravestone) {
        name = 'Gravestone Doji';
        type = 'Bearish';
      }

      patterns.push({
        id: `doji-${curr.time}`,
        index: i,
        time: curr.time,
        name,
        type,
        significance: 'Medium',
        description: 'Market indecision and potential trend reversal point.',
        candlePrice: curr.close,
      });
    }

    // 6. Morning Star (3-Candle Bullish Reversal)
    if (
      isBearPrev1 &&
      prev1.close < prev2.close &&
      bodyPrev1 / rangePrev1 <= 0.3 &&
      isBullCurr &&
      curr.close > (prev2.open + prev2.close) / 2
    ) {
      patterns.push({
        id: `morning-star-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Morning Star',
        type: 'Bullish',
        significance: 'High',
        description: 'Classic 3-candle bottom reversal setup.',
        candlePrice: curr.low,
      });
    }

    // 7. Evening Star (3-Candle Bearish Reversal)
    if (
      isBullPrev1 &&
      prev1.close > prev2.close &&
      bodyPrev1 / rangePrev1 <= 0.3 &&
      isBearCurr &&
      curr.close < (prev2.open + prev2.close) / 2
    ) {
      patterns.push({
        id: `evening-star-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Evening Star',
        type: 'Bearish',
        significance: 'High',
        description: 'Classic 3-candle top reversal setup.',
        candlePrice: curr.high,
      });
    }

    // 8. Bullish Harami
    if (
      isBearPrev1 &&
      isBullCurr &&
      curr.high < prev1.open &&
      curr.low > prev1.close &&
      bodyCurr < bodyPrev1 * 0.5
    ) {
      patterns.push({
        id: `bull-harami-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bullish Harami',
        type: 'Bullish',
        significance: 'Medium',
        description: 'Inside-bar contraction indicating selling momentum exhaustion.',
        candlePrice: curr.low,
      });
    }

    // 9. Bearish Harami
    if (
      isBullPrev1 &&
      isBearCurr &&
      curr.high < prev1.close &&
      curr.low > prev1.open &&
      bodyCurr < bodyPrev1 * 0.5
    ) {
      patterns.push({
        id: `bear-harami-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bearish Harami',
        type: 'Bearish',
        significance: 'Medium',
        description: 'Inside-bar contraction indicating buying momentum exhaustion.',
        candlePrice: curr.high,
      });
    }

    // 10. Three White Soldiers
    if (
      isBullCurr &&
      isBullPrev1 &&
      prev2.close >= prev2.open &&
      curr.close > prev1.close &&
      prev1.close > prev2.close &&
      bodyCurr > rangeCurr * 0.5 &&
      bodyPrev1 > rangePrev1 * 0.5
    ) {
      patterns.push({
        id: `three-soldiers-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Three White Soldiers',
        type: 'Bullish',
        significance: 'High',
        description: 'Powerful consecutive bullish expansion candles.',
        candlePrice: curr.low,
      });
    }

    // 11. Three Black Crows
    if (
      isBearCurr &&
      isBearPrev1 &&
      prev2.close < prev2.open &&
      curr.close < prev1.close &&
      prev1.close < prev2.close &&
      bodyCurr > rangeCurr * 0.5 &&
      bodyPrev1 > rangePrev1 * 0.5
    ) {
      patterns.push({
        id: `three-crows-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Three Black Crows',
        type: 'Bearish',
        significance: 'High',
        description: 'Powerful consecutive bearish expansion candles.',
        candlePrice: curr.high,
      });
    }
  }

  // Deduplicate and return last 15 detected patterns
  const uniqueMap = new Map<string, CandlestickPatternResult>();
  patterns.forEach((p) => uniqueMap.set(`${p.name}-${p.time}`, p));

  return Array.from(uniqueMap.values()).slice(-15);
}
