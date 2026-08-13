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
  if (candles.length < 20) return [];

  const patterns: ChartPatternResult[] = [];
  const latestCandle = candles[candles.length - 1];
  const lastClose = latestCandle.close;

  // Filter highs and lows from swings or calculate local peaks/valleys directly
  let highs = swings.filter((s) => s.type === 'HH' || s.type === 'LH');
  let lows = swings.filter((s) => s.type === 'HL' || s.type === 'LL');

  // Fallback: If swing points are sparse, calculate local 5-bar extrema directly
  if (highs.length < 2 || lows.length < 2) {
    highs = [];
    lows = [];
    for (let i = 5; i < candles.length - 5; i++) {
      const c = candles[i];
      let isHigh = true;
      let isLow = true;
      for (let j = 1; j <= 4; j++) {
        if (candles[i - j].high > c.high || candles[i + j].high > c.high) isHigh = false;
        if (candles[i - j].low < c.low || candles[i + j].low < c.low) isLow = false;
      }
      if (isHigh) highs.push({ index: i, time: c.time, price: c.high, type: 'HH' });
      if (isLow) lows.push({ index: i, time: c.time, price: c.low, type: 'LL' });
    }
  }

  // Relative price tolerance based on asset price scale
  const tolerance = 0.025; // 2.5% maximum variance for double bottom/top/wedges

  // --- 1. Double Bottom Detection (W-Pattern) ---
  if (lows.length >= 2) {
    const l1 = lows[lows.length - 2];
    const l2 = lows[lows.length - 1];
    const diffPercent = Math.abs(l1.price - l2.price) / Math.max(l1.price, 0.0001);

    if (diffPercent <= tolerance) {
      const interveningHighs = highs.filter((h) => h.index > l1.index && h.index < l2.index);
      const neckline = interveningHighs.length > 0 ? interveningHighs[0].price : Math.max(l1.price, l2.price) * 1.02;
      const height = neckline - Math.min(l1.price, l2.price);
      const isBreakout = lastClose >= neckline;

      patterns.push({
        id: `double-bottom-${l2.time}`,
        name: 'Double Bottom (W)',
        type: 'Bullish',
        confidence: isBreakout ? 92 : 80,
        time: l2.time,
        price: l2.price,
        necklineOrBoundary: neckline,
        targetPrice: neckline + height,
        stopLossPrice: Math.min(l1.price, l2.price) * 0.992,
        description: isBreakout
          ? 'Confirmed Double Bottom breakout above neckline resistance!'
          : 'Double Bottom support test; potential bullish accumulation zone.',
      });
    }
  }

  // --- 2. Double Top Detection (M-Pattern) ---
  if (highs.length >= 2) {
    const h1 = highs[highs.length - 2];
    const h2 = highs[highs.length - 1];
    const diffPercent = Math.abs(h1.price - h2.price) / Math.max(h1.price, 0.0001);

    if (diffPercent <= tolerance) {
      const interveningLows = lows.filter((l) => l.index > h1.index && l.index < h2.index);
      const neckline = interveningLows.length > 0 ? interveningLows[0].price : Math.min(h1.price, h2.price) * 0.98;
      const height = Math.max(h1.price, h2.price) - neckline;
      const isBreakout = lastClose <= neckline;

      patterns.push({
        id: `double-top-${h2.time}`,
        name: 'Double Top (M)',
        type: 'Bearish',
        confidence: isBreakout ? 92 : 80,
        time: h2.time,
        price: h2.price,
        necklineOrBoundary: neckline,
        targetPrice: neckline - height,
        stopLossPrice: Math.max(h1.price, h2.price) * 1.008,
        description: isBreakout
          ? 'Confirmed Double Top breakdown below neckline support!'
          : 'Double Top resistance test; potential distribution reversal.',
      });
    }
  }

  // --- 3. Head & Shoulders & Inverse Head & Shoulders ---
  if (highs.length >= 3) {
    const s1 = highs[highs.length - 3];
    const head = highs[highs.length - 2];
    const s2 = highs[highs.length - 1];

    if (head.price > s1.price && head.price > s2.price) {
      const shoulderDiff = Math.abs(s1.price - s2.price) / Math.max(s1.price, 0.0001);
      if (shoulderDiff <= 0.035) {
        const interveningLows = lows.filter((l) => l.index > s1.index && l.index < s2.index);
        const neckline = interveningLows.length > 0 ? interveningLows[0].price : (s1.price + s2.price) / 2 * 0.98;
        const height = head.price - neckline;

        patterns.push({
          id: `hs-${head.time}`,
          name: 'Head & Shoulders',
          type: 'Bearish',
          confidence: 86,
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
      const shoulderDiff = Math.abs(s1.price - s2.price) / Math.max(s1.price, 0.0001);
      if (shoulderDiff <= 0.035) {
        const interveningHighs = highs.filter((h) => h.index > s1.index && h.index < s2.index);
        const neckline = interveningHighs.length > 0 ? interveningHighs[0].price : (s1.price + s2.price) / 2 * 1.02;
        const height = neckline - head.price;

        patterns.push({
          id: `inv-hs-${head.time}`,
          name: 'Inverse Head & Shoulders',
          type: 'Bullish',
          confidence: 86,
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

  // --- 4. Falling Wedge (Bullish Reversal / Continuation) & Rising Wedge (Bearish) ---
  if (highs.length >= 2 && lows.length >= 2) {
    const h1 = highs[highs.length - 2];
    const h2 = highs[highs.length - 1];
    const l1 = lows[lows.length - 2];
    const l2 = lows[lows.length - 1];

    // Falling Wedge: Lower highs AND lower lows, but lows are converging faster (slopes)
    if (h2.price < h1.price && l2.price < l1.price) {
      const highSlope = (h1.price - h2.price) / h1.price;
      const lowSlope = (l1.price - l2.price) / l1.price;

      if (highSlope > lowSlope) {
        patterns.push({
          id: `falling-wedge-${latestCandle.time}`,
          name: 'Falling Wedge',
          type: 'Bullish',
          confidence: 84,
          time: latestCandle.time,
          price: lastClose,
          necklineOrBoundary: h2.price,
          targetPrice: h1.price,
          stopLossPrice: l2.price * 0.99,
          description: 'Bullish converging wedge structure indicating seller exhaustion.',
        });
      }
    }

    // Rising Wedge: Higher highs AND higher lows, but highs are converging (slopes)
    if (h2.price > h1.price && l2.price > l1.price) {
      const highSlope = (h2.price - h1.price) / h1.price;
      const lowSlope = (l2.price - l1.price) / l1.price;

      if (lowSlope > highSlope) {
        patterns.push({
          id: `rising-wedge-${latestCandle.time}`,
          name: 'Rising Wedge',
          type: 'Bearish',
          confidence: 84,
          time: latestCandle.time,
          price: lastClose,
          necklineOrBoundary: l2.price,
          targetPrice: l1.price,
          stopLossPrice: h2.price * 1.01,
          description: 'Bearish converging wedge structure indicating buyer exhaustion.',
        });
      }
    }
  }

  // --- 5. Bull / Bear Flag Continuation ---
  if (candles.length >= 15) {
    const recent10 = candles.slice(-10);
    const prev10 = candles.slice(-20, -10);

    if (prev10.length > 0) {
      const poleReturn = (prev10[prev10.length - 1].close - prev10[0].open) / prev10[0].open;
      const flagReturn = (recent10[recent10.length - 1].close - recent10[0].open) / recent10[0].open;

      if (poleReturn > 0.02 && Math.abs(flagReturn) < 0.015) {
        patterns.push({
          id: `bull-flag-${latestCandle.time}`,
          name: 'Bullish Flag',
          type: 'Bullish',
          confidence: 88,
          time: latestCandle.time,
          price: lastClose,
          targetPrice: lastClose * (1 + poleReturn),
          stopLossPrice: Math.min(...recent10.map((c) => c.low)),
          description: 'Bullish continuation flag consolidation following strong upward pole move.',
        });
      } else if (poleReturn < -0.02 && Math.abs(flagReturn) < 0.015) {
        patterns.push({
          id: `bear-flag-${latestCandle.time}`,
          name: 'Bearish Flag',
          type: 'Bearish',
          confidence: 88,
          time: latestCandle.time,
          price: lastClose,
          targetPrice: lastClose * (1 + poleReturn),
          stopLossPrice: Math.max(...recent10.map((c) => c.high)),
          description: 'Bearish continuation flag consolidation following sharp drop pole move.',
        });
      }
    }
  }

  return patterns;
}

