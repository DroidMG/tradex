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

  // Scan recent candles (last 120 candles)
  const startIdx = Math.max(0, len - 120);

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

    const bodyPrev2 = Math.abs(prev2.close - prev2.open);
    const rangePrev2 = prev2.high - prev2.low;
    const isBearPrev2 = prev2.close < prev2.open;
    const isBullPrev2 = prev2.close >= prev2.open;

    const upperWickCurr = isBullCurr ? curr.high - curr.close : curr.high - curr.open;
    const lowerWickCurr = isBullCurr ? curr.open - curr.low : curr.close - curr.low;

    if (rangeCurr === 0) continue;

    // 1. Hammer (Bullish Reversal)
    if (
      lowerWickCurr >= bodyCurr * 2 &&
      upperWickCurr <= bodyCurr * 0.6 &&
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
        description: 'Bullish rejection of lower prices with a long lower wick.',
        candlePrice: curr.low,
      });
    }

    // 2. Inverted Hammer (Bullish Reversal)
    if (
      upperWickCurr >= bodyCurr * 2 &&
      lowerWickCurr <= bodyCurr * 0.6 &&
      bodyCurr / rangeCurr <= 0.35 &&
      isBearPrev1
    ) {
      patterns.push({
        id: `inv-hammer-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Inverted Hammer',
        type: 'Bullish',
        significance: 'Medium',
        description: 'Buyers tested higher prices after downtrend; potential reversal.',
        candlePrice: curr.low,
      });
    }

    // 3. Shooting Star (Bearish Reversal)
    if (
      upperWickCurr >= bodyCurr * 2 &&
      lowerWickCurr <= bodyCurr * 0.6 &&
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
        description: 'Bearish rejection of higher prices at resistance.',
        candlePrice: curr.high,
      });
    }

    // 4. Bullish Engulfing (Adapted for 24/7 continuous crypto markets)
    if (
      isBearPrev1 &&
      isBullCurr &&
      curr.close >= prev1.open &&
      curr.low <= prev1.low &&
      bodyCurr >= bodyPrev1 * 0.85
    ) {
      patterns.push({
        id: `bull-engulf-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bullish Engulfing',
        type: 'Bullish',
        significance: 'High',
        description: 'Strong buyers completely overrun prior selling candle.',
        candlePrice: curr.low,
      });
    }

    // 5. Bearish Engulfing (Adapted for 24/7 continuous crypto markets)
    if (
      isBullPrev1 &&
      isBearCurr &&
      curr.close <= prev1.open &&
      curr.high >= prev1.high &&
      bodyCurr >= bodyPrev1 * 0.85
    ) {
      patterns.push({
        id: `bear-engulf-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bearish Engulfing',
        type: 'Bearish',
        significance: 'High',
        description: 'Sellers completely overwhelm prior bullish candle body.',
        candlePrice: curr.high,
      });
    }

    // 6. Doji (Dragonfly & Gravestone)
    if (bodyCurr / rangeCurr <= 0.12) {
      const isDragonfly = lowerWickCurr >= rangeCurr * 0.65;
      const isGravestone = upperWickCurr >= rangeCurr * 0.65;

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
        description: 'Extreme equilibrium between buyers and sellers.',
        candlePrice: curr.close,
      });
    }

    // 7. Morning Star (3-Candle Bottom Reversal)
    if (
      isBearPrev2 &&
      bodyPrev2 / rangePrev2 > 0.4 &&
      bodyPrev1 / rangePrev1 <= 0.35 &&
      isBullCurr &&
      curr.close >= (prev2.open + prev2.close) / 2
    ) {
      patterns.push({
        id: `morning-star-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Morning Star',
        type: 'Bullish',
        significance: 'High',
        description: 'Classic 3-candle bottom reversal structure.',
        candlePrice: curr.low,
      });
    }

    // 8. Evening Star (3-Candle Top Reversal)
    if (
      isBullPrev2 &&
      bodyPrev2 / rangePrev2 > 0.4 &&
      bodyPrev1 / rangePrev1 <= 0.35 &&
      isBearCurr &&
      curr.close <= (prev2.open + prev2.close) / 2
    ) {
      patterns.push({
        id: `evening-star-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Evening Star',
        type: 'Bearish',
        significance: 'High',
        description: 'Classic 3-candle top reversal structure.',
        candlePrice: curr.high,
      });
    }

    // 9. Bullish Harami (Inside Bar Contraction)
    if (
      isBearPrev1 &&
      isBullCurr &&
      curr.high <= prev1.high &&
      curr.low >= prev1.low &&
      bodyCurr <= bodyPrev1 * 0.6
    ) {
      patterns.push({
        id: `bull-harami-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bullish Harami',
        type: 'Bullish',
        significance: 'Medium',
        description: 'Inside-bar contraction indicating downward momentum decay.',
        candlePrice: curr.low,
      });
    }

    // 10. Bearish Harami (Inside Bar Contraction)
    if (
      isBullPrev1 &&
      isBearCurr &&
      curr.high <= prev1.high &&
      curr.low >= prev1.low &&
      bodyCurr <= bodyPrev1 * 0.6
    ) {
      patterns.push({
        id: `bear-harami-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bearish Harami',
        type: 'Bearish',
        significance: 'Medium',
        description: 'Inside-bar contraction indicating upward momentum decay.',
        candlePrice: curr.high,
      });
    }

    // 11. Bullish Marubozu (Power Expansion)
    if (isBullCurr && bodyCurr / rangeCurr >= 0.88 && rangeCurr > rangePrev1 * 1.1) {
      patterns.push({
        id: `bull-marubozu-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bullish Marubozu',
        type: 'Bullish',
        significance: 'High',
        description: 'Uninterrupted bullish momentum with minimal wicks.',
        candlePrice: curr.low,
      });
    }

    // 12. Bearish Marubozu (Power Expansion)
    if (isBearCurr && bodyCurr / rangeCurr >= 0.88 && rangeCurr > rangePrev1 * 1.1) {
      patterns.push({
        id: `bear-marubozu-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Bearish Marubozu',
        type: 'Bearish',
        significance: 'High',
        description: 'Uninterrupted bearish momentum with minimal wicks.',
        candlePrice: curr.high,
      });
    }

    // 13. Tweezer Bottom (Bullish Support Rejection)
    if (
      isBearPrev1 &&
      isBullCurr &&
      Math.abs(curr.low - prev1.low) / Math.max(curr.low, 0.0001) <= 0.0015
    ) {
      patterns.push({
        id: `tweezer-bottom-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Tweezer Bottom',
        type: 'Bullish',
        significance: 'High',
        description: 'Matching double lows testing a key support level.',
        candlePrice: curr.low,
      });
    }

    // 14. Tweezer Top (Bearish Resistance Rejection)
    if (
      isBullPrev1 &&
      isBearCurr &&
      Math.abs(curr.high - prev1.high) / Math.max(curr.high, 0.0001) <= 0.0015
    ) {
      patterns.push({
        id: `tweezer-top-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Tweezer Top',
        type: 'Bearish',
        significance: 'High',
        description: 'Matching double highs testing a key resistance level.',
        candlePrice: curr.high,
      });
    }

    // 15. Piercing Line (Bullish Reversal)
    if (
      isBearPrev1 &&
      isBullCurr &&
      curr.close >= (prev1.open + prev1.close) / 2 &&
      curr.close < prev1.open
    ) {
      patterns.push({
        id: `piercing-line-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Piercing Line',
        type: 'Bullish',
        significance: 'High',
        description: 'Bullish candle pierces deep into prior red candle body.',
        candlePrice: curr.low,
      });
    }

    // 16. Dark Cloud Cover (Bearish Reversal)
    if (
      isBullPrev1 &&
      isBearCurr &&
      curr.close <= (prev1.open + prev1.close) / 2 &&
      curr.close > prev1.open
    ) {
      patterns.push({
        id: `dark-cloud-${curr.time}`,
        index: i,
        time: curr.time,
        name: 'Dark Cloud Cover',
        type: 'Bearish',
        significance: 'High',
        description: 'Bearish candle pierces deep into prior green candle body.',
        candlePrice: curr.high,
      });
    }
  }

  // Deduplicate and return recent detected patterns
  const uniqueMap = new Map<string, CandlestickPatternResult>();
  patterns.forEach((p) => uniqueMap.set(`${p.name}-${p.time}`, p));

  return Array.from(uniqueMap.values()).slice(-20);
}

