import { Candle, SwingPoint } from '../types/trading';

export interface ChartPatternResult {
  id: string;
  name: string;
  type: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number; // 0 - 100
  time: number;
  price: number;
  targetPrice?: number;
  stopLossPrice?: number;
  necklineOrBoundary?: number;
  description: string;
}

export function detectChartPatterns(
  candles: Candle[],
  swings: SwingPoint[]
): ChartPatternResult[] {
  if (candles.length < 30 || swings.length < 4) return [];

  const patterns: ChartPatternResult[] = [];
  const latestCandle = candles[candles.length - 1];
  const lastClose = latestCandle.close;

  const highs = swings.filter((s) => s.type === 'HH' || s.type === 'LH');
  const lows = swings.filter((s) => s.type === 'HL' || s.type === 'LL');

  // --- 1. Double Bottom Detection ---
  if (lows.length >= 2) {
    const l1 = lows[lows.length - 2];
    const l2 = lows[lows.length - 1];
    const diffPercent = Math.abs(l1.price - l2.price) / l1.price;

    if (diffPercent < 0.015) {
      // Find intervening high between the two lows
      const interveningHighs = highs.filter((h) => h.index > l1.index && h.index < l2.index);
      if (interveningHighs.length > 0) {
        const neckline = interveningHighs[0].price;
        const height = neckline - Math.min(l1.price, l2.price);
        const isBreakout = lastClose > neckline;

        patterns.push({
          id: `double-bottom-${l2.time}`,
          name: 'Double Bottom (W)',
          type: 'Bullish',
          confidence: isBreakout ? 88 : 74,
          time: l2.time,
          price: l2.price,
          necklineOrBoundary: neckline,
          targetPrice: neckline + height,
          stopLossPrice: Math.min(l1.price, l2.price) * 0.995,
          description: isBreakout
            ? 'Confirmed Double Bottom breakout above neckline resistance!'
            : 'Potential Double Bottom forming at key support level.',
        });
      }
    }
  }

  // --- 2. Double Top Detection ---
  if (highs.length >= 2) {
    const h1 = highs[highs.length - 2];
    const h2 = highs[highs.length - 1];
    const diffPercent = Math.abs(h1.price - h2.price) / h1.price;

    if (diffPercent < 0.015) {
      const interveningLows = lows.filter((l) => l.index > h1.index && l.index < h2.index);
      if (interveningLows.length > 0) {
        const neckline = interveningLows[0].price;
        const height = Math.max(h1.price, h2.price) - neckline;
        const isBreakout = lastClose < neckline;

        patterns.push({
          id: `double-top-${h2.time}`,
          name: 'Double Top (M)',
          type: 'Bearish',
          confidence: isBreakout ? 88 : 74,
          time: h2.time,
          price: h2.price,
          necklineOrBoundary: neckline,
          targetPrice: neckline - height,
          stopLossPrice: Math.max(h1.price, h2.price) * 1.005,
          description: isBreakout
            ? 'Confirmed Double Top breakdown below neckline support!'
            : 'Potential Double Top forming at key resistance level.',
        });
      }
    }
  }

  // --- 3. Head & Shoulders & Inverse Head & Shoulders ---
  if (highs.length >= 3) {
    const s1 = highs[highs.length - 3];
    const head = highs[highs.length - 2];
    const s2 = highs[highs.length - 1];

    if (head.price > s1.price && head.price > s2.price) {
      const shoulderDiff = Math.abs(s1.price - s2.price) / s1.price;
      if (shoulderDiff < 0.025) {
        const interveningLows = lows.filter((l) => l.index > s1.index && l.index < s2.index);
        const neckline = interveningLows.length > 0 ? interveningLows[0].price : (s1.price + s2.price) / 2 * 0.98;
        const height = head.price - neckline;

        patterns.push({
          id: `hs-${head.time}`,
          name: 'Head & Shoulders',
          type: 'Bearish',
          confidence: 82,
          time: s2.time,
          price: s2.price,
          necklineOrBoundary: neckline,
          targetPrice: neckline - height,
          stopLossPrice: head.price,
          description: 'Classic Head & Shoulders reversal structure pointing to downside target.',
        });
      }
    }
  }

  if (lows.length >= 3) {
    const s1 = lows[lows.length - 3];
    const head = lows[lows.length - 2];
    const s2 = lows[lows.length - 1];

    if (head.price < s1.price && head.price < s2.price) {
      const shoulderDiff = Math.abs(s1.price - s2.price) / s1.price;
      if (shoulderDiff < 0.025) {
        const interveningHighs = highs.filter((h) => h.index > s1.index && h.index < s2.index);
        const neckline = interveningHighs.length > 0 ? interveningHighs[0].price : (s1.price + s2.price) / 2 * 1.02;
        const height = neckline - head.price;

        patterns.push({
          id: `inv-hs-${head.time}`,
          name: 'Inverse Head & Shoulders',
          type: 'Bullish',
          confidence: 82,
          time: s2.time,
          price: s2.price,
          necklineOrBoundary: neckline,
          targetPrice: neckline + height,
          stopLossPrice: head.price,
          description: 'Inverse Head & Shoulders structure pointing to bullish reversal target.',
        });
      }
    }
  }

  // --- 4. Ascending / Descending Triangle ---
  if (highs.length >= 2 && lows.length >= 2) {
    const recentHighs = highs.slice(-3);
    const recentLows = lows.slice(-3);

    const highPrices = recentHighs.map((h) => h.price);
    const lowPrices = recentLows.map((l) => l.price);

    // Flat resistance, higher lows -> Ascending Triangle
    const resDiff = Math.abs(highPrices[highPrices.length - 1] - highPrices[0]) / highPrices[0];
    const isHigherLows = lowPrices[lowPrices.length - 1] > lowPrices[0];

    if (resDiff < 0.015 && isHigherLows) {
      const flatResistance = Math.max(...highPrices);
      patterns.push({
        id: `asc-triangle-${latestCandle.time}`,
        name: 'Ascending Triangle',
        type: 'Bullish',
        confidence: 79,
        time: latestCandle.time,
        price: lastClose,
        necklineOrBoundary: flatResistance,
        targetPrice: flatResistance * 1.03,
        stopLossPrice: lowPrices[lowPrices.length - 1],
        description: 'Bullish accumulation pattern compressing against horizontal resistance.',
      });
    }

    // Flat support, lower highs -> Descending Triangle
    const supDiff = Math.abs(lowPrices[lowPrices.length - 1] - lowPrices[0]) / lowPrices[0];
    const isLowerHighs = highPrices[highPrices.length - 1] < highPrices[0];

    if (supDiff < 0.015 && isLowerHighs) {
      const flatSupport = Math.min(...lowPrices);
      patterns.push({
        id: `desc-triangle-${latestCandle.time}`,
        name: 'Descending Triangle',
        type: 'Bearish',
        confidence: 79,
        time: latestCandle.time,
        price: lastClose,
        necklineOrBoundary: flatSupport,
        targetPrice: flatSupport * 0.97,
        stopLossPrice: highPrices[highPrices.length - 1],
        description: 'Bearish distribution pattern compressing against horizontal support.',
      });
    }
  }

  // --- 5. Bull / Bear Flag ---
  if (candles.length >= 20) {
    const recent10 = candles.slice(-10);
    const prev10 = candles.slice(-20, -10);

    const poleReturn = (prev10[prev10.length - 1].close - prev10[0].open) / prev10[0].open;
    const flagReturn = (recent10[recent10.length - 1].close - recent10[0].open) / recent10[0].open;

    if (poleReturn > 0.03 && Math.abs(flagReturn) < 0.015) {
      patterns.push({
        id: `bull-flag-${latestCandle.time}`,
        name: 'Bullish Flag',
        type: 'Bullish',
        confidence: 85,
        time: latestCandle.time,
        price: lastClose,
        targetPrice: lastClose * (1 + poleReturn),
        stopLossPrice: Math.min(...recent10.map((c) => c.low)),
        description: 'Bullish continuation flag forming after strong pole expansion.',
      });
    } else if (poleReturn < -0.03 && Math.abs(flagReturn) < 0.015) {
      patterns.push({
        id: `bear-flag-${latestCandle.time}`,
        name: 'Bearish Flag',
        type: 'Bearish',
        confidence: 85,
        time: latestCandle.time,
        price: lastClose,
        targetPrice: lastClose * (1 + poleReturn),
        stopLossPrice: Math.max(...recent10.map((c) => c.high)),
        description: 'Bearish continuation flag forming after strong downward expansion.',
      });
    }
  }

  return patterns;
}
