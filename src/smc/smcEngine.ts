import {
  Candle,
  DealingRange,
  FairValueGap,
  LiquidityLevel,
  OrderBlock,
  SMCAnalysis,
  StructureBreak,
  SwingPoint,
  Timeframe,
} from '../types/trading';

/**
 * Detect swing highs and swing lows using N-bar left and right lookback
 */
export function detectSwingPoints(candles: Candle[], swingLength = 5): SwingPoint[] {
  const swings: SwingPoint[] = [];

  for (let i = swingLength; i < candles.length - swingLength; i++) {
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;

    let isHigh = true;
    let isLow = true;

    for (let j = 1; j <= swingLength; j++) {
      if (candles[i - j].high >= currentHigh || candles[i + j].high >= currentHigh) {
        isHigh = false;
      }
      if (candles[i - j].low <= currentLow || candles[i + j].low <= currentLow) {
        isLow = false;
      }
    }

    if (isHigh) {
      const prevHigh = swings.filter((s) => s.type === 'HH' || s.type === 'LH').slice(-1)[0];
      const type = !prevHigh || currentHigh > prevHigh.price ? 'HH' : 'LH';
      swings.push({ index: i, time: candles[i].time, price: currentHigh, type });
    } else if (isLow) {
      const prevLow = swings.filter((s) => s.type === 'HL' || s.type === 'LL').slice(-1)[0];
      const type = !prevLow || currentLow > prevLow.price ? 'HL' : 'LL';
      swings.push({ index: i, time: candles[i].time, price: currentLow, type });
    }
  }

  return swings;
}

/**
 * Detect BOS (Break of Structure) and CHoCH (Change of Character)
 */
export function detectStructureBreaks(candles: Candle[], swings: SwingPoint[]): StructureBreak[] {
  const breaks: StructureBreak[] = [];
  let currentTrend: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';

  const highSwings = swings.filter((s) => s.type === 'HH' || s.type === 'LH');
  const lowSwings = swings.filter((s) => s.type === 'HL' || s.type === 'LL');

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];

    // Check high break
    const activeHigh = highSwings.filter((s) => s.time < c.time).slice(-1)[0];
    if (activeHigh && c.close > activeHigh.price) {
      const isChoch = currentTrend === 'Bearish';
      breaks.push({
        time: c.time,
        price: activeHigh.price,
        type: isChoch ? 'CHoCH' : 'BOS',
        bias: 'Bullish',
        description: isChoch
          ? 'Bullish CHoCH: Character shifted upward'
          : 'Bullish BOS: Break of key swing structure',
      });
      currentTrend = 'Bullish';
    }

    // Check low break
    const activeLow = lowSwings.filter((s) => s.time < c.time).slice(-1)[0];
    if (activeLow && c.close < activeLow.price) {
      const isChoch = currentTrend === 'Bullish';
      breaks.push({
        time: c.time,
        price: activeLow.price,
        type: isChoch ? 'CHoCH' : 'BOS',
        bias: 'Bearish',
        description: isChoch
          ? 'Bearish CHoCH: Character shifted downward'
          : 'Bearish BOS: Break of key swing structure',
      });
      currentTrend = 'Bearish';
    }
  }

  return breaks.slice(-10); // keep recent 10
}

/**
 * Detect Order Blocks (OB)
 * Bullish OB: last down candle before a strong bullish impulse break
 * Bearish OB: last up candle before a strong bearish impulse break
 */
export function detectOrderBlocks(candles: Candle[], timeframe: Timeframe): OrderBlock[] {
  const orderBlocks: OrderBlock[] = [];

  for (let i = 2; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];

    // Impulse body threshold (e.g. 1.2% move in next candle)
    const movePct = Math.abs(next.close - curr.open) / curr.open;

    if (curr.close < curr.open && next.close > curr.high && movePct > 0.005) {
      // Bullish OB
      const top = curr.high;
      const bottom = curr.low;

      // Check if mitigated later
      let touches = 0;
      let status: 'Active' | 'Mitigated' = 'Active';
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].low <= top) touches++;
        if (candles[j].close < bottom) {
          status = 'Mitigated';
          break;
        }
      }

      orderBlocks.push({
        id: `ob-bull-${i}`,
        bias: 'Bullish',
        top,
        bottom,
        startTime: curr.time,
        strength: Math.min(95, Math.round(70 + movePct * 1000)),
        freshness: status === 'Mitigated' ? 'Mitigated' : touches === 0 ? 'Fresh' : 'Tested',
        touches,
        timeframe,
        status,
      });
    } else if (curr.close > curr.open && next.close < curr.low && movePct > 0.005) {
      // Bearish OB
      const top = curr.high;
      const bottom = curr.low;

      let touches = 0;
      let status: 'Active' | 'Mitigated' = 'Active';
      for (let j = i + 1; j < candles.length; j++) {
        if (candles[j].high >= bottom) touches++;
        if (candles[j].close > top) {
          status = 'Mitigated';
          break;
        }
      }

      orderBlocks.push({
        id: `ob-bear-${i}`,
        bias: 'Bearish',
        top,
        bottom,
        startTime: curr.time,
        strength: Math.min(95, Math.round(70 + movePct * 1000)),
        freshness: status === 'Mitigated' ? 'Mitigated' : touches === 0 ? 'Fresh' : 'Tested',
        touches,
        timeframe,
        status,
      });
    }
  }

  // Return active or fresh order blocks sorted by recentness
  return orderBlocks.filter((ob) => ob.status === 'Active').slice(-6);
}

/**
 * Detect Fair Value Gaps (FVG)
 * Bullish FVG: Low of candle[i+2] > High of candle[i]
 * Bearish FVG: High of candle[i+2] < Low of candle[i]
 */
export function detectFairValueGaps(candles: Candle[]): FairValueGap[] {
  const fvgs: FairValueGap[] = [];

  for (let i = 0; i < candles.length - 2; i++) {
    const c1 = candles[i];
    const c3 = candles[i + 2];

    if (c3.low > c1.high) {
      // Bullish FVG
      const gapBottom = c1.high;
      const gapTop = c3.low;
      const size = gapTop - gapBottom;
      const sizePercent = (size / gapBottom) * 100;

      let fillPercentage = 0;
      let status: 'Unfilled' | 'Partially Filled' | 'Mitigated' = 'Unfilled';

      for (let j = i + 3; j < candles.length; j++) {
        if (candles[j].low <= gapTop) {
          const depth = gapTop - candles[j].low;
          fillPercentage = Math.min(100, Math.round((depth / size) * 100));
          if (fillPercentage >= 100) {
            status = 'Mitigated';
            break;
          } else {
            status = 'Partially Filled';
          }
        }
      }

      if (status !== 'Mitigated') {
        fvgs.push({
          id: `fvg-bull-${i}`,
          bias: 'Bullish',
          top: gapTop,
          bottom: gapBottom,
          time: candles[i + 1].time,
          size,
          sizePercent: Number(sizePercent.toFixed(2)),
          fillPercentage,
          status,
        });
      }
    } else if (c3.high < c1.low) {
      // Bearish FVG
      const gapTop = c1.low;
      const gapBottom = c3.high;
      const size = gapTop - gapBottom;
      const sizePercent = (size / gapBottom) * 100;

      let fillPercentage = 0;
      let status: 'Unfilled' | 'Partially Filled' | 'Mitigated' = 'Unfilled';

      for (let j = i + 3; j < candles.length; j++) {
        if (candles[j].high >= gapBottom) {
          const depth = candles[j].high - gapBottom;
          fillPercentage = Math.min(100, Math.round((depth / size) * 100));
          if (fillPercentage >= 100) {
            status = 'Mitigated';
            break;
          } else {
            status = 'Partially Filled';
          }
        }
      }

      if (status !== 'Mitigated') {
        fvgs.push({
          id: `fvg-bear-${i}`,
          bias: 'Bearish',
          top: gapTop,
          bottom: gapBottom,
          time: candles[i + 1].time,
          size,
          sizePercent: Number(sizePercent.toFixed(2)),
          fillPercentage,
          status,
        });
      }
    }
  }

  return fvgs.slice(-8);
}

/**
 * Detect Liquidity Levels & Sweeps
 */
export function detectLiquidityLevels(candles: Candle[], swings: SwingPoint[]): LiquidityLevel[] {
  const levels: LiquidityLevel[] = [];
  const recentSwings = swings.slice(-10);

  // Equal Highs / Lows detection
  for (let i = 0; i < recentSwings.length; i++) {
    for (let j = i + 1; j < recentSwings.length; j++) {
      const s1 = recentSwings[i];
      const s2 = recentSwings[j];

      if ((s1.type === 'HH' || s1.type === 'LH') && (s2.type === 'HH' || s2.type === 'LH')) {
        const diffPct = Math.abs(s1.price - s2.price) / s1.price;
        if (diffPct < 0.001) {
          levels.push({
            id: `eq-high-${i}-${j}`,
            type: 'Equal Highs',
            price: (s1.price + s2.price) / 2,
            bias: 'Buy-side',
            swept: false,
          });
        }
      }

      if ((s1.type === 'HL' || s1.type === 'LL') && (s2.type === 'HL' || s2.type === 'LL')) {
        const diffPct = Math.abs(s1.price - s2.price) / s1.price;
        if (diffPct < 0.001) {
          levels.push({
            id: `eq-low-${i}-${j}`,
            type: 'Equal Lows',
            price: (s1.price + s2.price) / 2,
            bias: 'Sell-side',
            swept: false,
          });
        }
      }
    }
  }

  // Previous Day High / Low
  const dayCandles = candles.slice(-24); // roughly last day
  const pdh = Math.max(...dayCandles.map((c) => c.high));
  const pdl = Math.min(...dayCandles.map((c) => c.low));

  levels.push({
    id: 'pdh',
    type: 'PDH',
    price: pdh,
    bias: 'Buy-side',
    swept: false,
  });

  levels.push({
    id: 'pdl',
    type: 'PDL',
    price: pdl,
    bias: 'Sell-side',
    swept: false,
  });

  // Check liquidity sweeps by recent candle wicks
  const lastCandle = candles[candles.length - 1];
  levels.forEach((lvl) => {
    if (lvl.bias === 'Buy-side' && lastCandle.high > lvl.price && lastCandle.close < lvl.price) {
      lvl.swept = true;
      lvl.sweepTime = lastCandle.time;
    }
    if (lvl.bias === 'Sell-side' && lastCandle.low < lvl.price && lastCandle.close > lvl.price) {
      lvl.swept = true;
      lvl.sweepTime = lastCandle.time;
    }
  });

  return levels;
}

/**
 * Calculate Premium / Discount Dealing Range
 */
export function calculateDealingRange(candles: Candle[]): DealingRange {
  const recent = candles.slice(-50);
  const high = Math.max(...recent.map((c) => c.high));
  const low = Math.min(...recent.map((c) => c.low));
  const eq = (high + low) / 2;

  const lastClose = candles[candles.length - 1].close;

  let currentZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';
  if (lastClose > eq + (high - eq) * 0.1) currentZone = 'PREMIUM';
  else if (lastClose < eq - (eq - low) * 0.1) currentZone = 'DISCOUNT';

  return {
    high,
    low,
    equilibrium: eq,
    premiumZone: { min: eq, max: high },
    discountZone: { min: low, max: eq },
    currentZone,
  };
}

/**
 * Run full SMC Analysis Pipeline
 */
export function analyzeSMC(candles: Candle[], timeframe: Timeframe): SMCAnalysis {
  const swings = detectSwingPoints(candles);
  const breaks = detectStructureBreaks(candles, swings);
  const obs = detectOrderBlocks(candles, timeframe);
  const fvgs = detectFairValueGaps(candles);
  const liquidity = detectLiquidityLevels(candles, swings);
  const range = calculateDealingRange(candles);

  const lastBreak = breaks.slice(-1)[0];
  const overallBias = lastBreak ? lastBreak.bias : 'Neutral';
  const confidence = Math.min(95, 60 + obs.length * 5 + fvgs.length * 4);

  return {
    swings,
    structureBreaks: breaks,
    orderBlocks: obs,
    fairValueGaps: fvgs,
    liquidityLevels: liquidity,
    dealingRange: range,
    overallBias,
    biasConfidence: confidence,
  };
}
