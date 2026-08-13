import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  LineData,
  Time,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  IPriceLine,
  SeriesMarker,
} from 'lightweight-charts';
import { tradingStore } from '../../store/tradingStore';
import {
  calculateEMA,
  calculateVWAP,
  calculateBollingerBands,
  calculateSupertrend,
  calculatePivotPoints,
  calculateFibonacciLevels,
} from '../../indicators/indicatorsEngine';
import { calculateHeikinAshi } from '../../utils/heikinAshi';
import { formatPrice } from '../../utils/formatters';

export const TradingChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Series Refs
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const bbUpperSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const supertrendSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Price Lines Ref
  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Local state for HTML top legend
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 480,
      layout: {
        background: { color: '#0c0e14' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: '#1a1f2c' },
        horzLines: { color: '#1a1f2c' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#6366f1', width: 1, style: 2 },
        horzLine: { color: '#6366f1', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#1a1f2c',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: '#1a1f2c',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // 1. Candlestick series (Prominent live price scale label)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderUpColor: '#10b981',
      borderDownColor: '#f43f5e',
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });
    candlestickSeriesRef.current = candlestickSeries;

    // 2. Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // 3. EMA Line series - NO TITLE to prevent text boxes on chart canvas!
    ema20SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#3b82f6',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });

    ema50SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#f59e0b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });

    ema200SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#ec4899',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });

    // 4. VWAP Line series - NO TITLE
    vwapSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });

    // 5. Bollinger Bands Series - NO TITLE
    bbUpperSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });
    bbMiddleSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });
    bbLowerSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });

    // 6. Supertrend Series - NO TITLE
    supertrendSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#10b981',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      title: '',
    });

    // Resize Observer
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      ema20SeriesRef.current = null;
      ema50SeriesRef.current = null;
      ema200SeriesRef.current = null;
      vwapSeriesRef.current = null;
      bbUpperSeriesRef.current = null;
      bbMiddleSeriesRef.current = null;
      bbLowerSeriesRef.current = null;
      supertrendSeriesRef.current = null;
    };
  }, []);

  // Update candle data & overlays whenever store updates
  useEffect(() => {
    return tradingStore.subscribe(() => {
      setTick((t) => t + 1);

      if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

      const symbol = tradingStore.selectedSymbol;
      const rawCandles = tradingStore.candlesMap.get(symbol) || [];
      if (rawCandles.length === 0) return;

      const overlays = tradingStore.overlayToggles;
      const smc = tradingStore.smcAnalysis;
      const cCandlePatterns = tradingStore.candlestickPatterns;
      const cChartPatterns = tradingStore.chartPatterns;
      const chartType = tradingStore.chartType;

      // Decide whether to render standard Candlesticks or Heikin-Ashi
      const candles = chartType === 'heikinAshi' ? calculateHeikinAshi(rawCandles) : rawCandles;

      // Candlestick Data - Deduplicate and sort by ascending timestamp
      const uniqueCandlesMap = new Map<number, CandlestickData<Time>>();
      candles.forEach((c) => {
        uniqueCandlesMap.set(c.time, {
          time: c.time as Time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        });
      });
      const chartCandles = Array.from(uniqueCandlesMap.values()).sort(
        (a, b) => (a.time as number) - (b.time as number)
      );

      // Volume Data
      const uniqueVolumeMap = new Map<number, { time: Time; value: number; color: string }>();
      if (overlays.volume) {
        rawCandles.forEach((c) => {
          uniqueVolumeMap.set(c.time, {
            time: c.time as Time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
          });
        });
      }
      const chartVolume = Array.from(uniqueVolumeMap.values()).sort(
        (a, b) => (a.time as number) - (b.time as number)
      );

      candlestickSeriesRef.current.setData(chartCandles);
      volumeSeriesRef.current.setData(chartVolume);

      const closes = rawCandles.map((c) => c.close);

      // --- 1. EMA Overlay ---
      if (overlays.ema) {
        const ema20Values = calculateEMA(closes, 20);
        const ema50Values = calculateEMA(closes, 50);
        const ema200Values = calculateEMA(closes, 200);

        const ema20Data: LineData<Time>[] = [];
        const ema50Data: LineData<Time>[] = [];
        const ema200Data: LineData<Time>[] = [];

        rawCandles.forEach((c, i) => {
          if (ema20Values[i] !== null) ema20Data.push({ time: c.time as Time, value: ema20Values[i]! });
          if (ema50Values[i] !== null) ema50Data.push({ time: c.time as Time, value: ema50Values[i]! });
          if (ema200Values[i] !== null) ema200Data.push({ time: c.time as Time, value: ema200Values[i]! });
        });

        ema20SeriesRef.current?.setData(ema20Data);
        ema50SeriesRef.current?.setData(ema50Data);
        ema200SeriesRef.current?.setData(ema200Data);
      } else {
        ema20SeriesRef.current?.setData([]);
        ema50SeriesRef.current?.setData([]);
        ema200SeriesRef.current?.setData([]);
      }

      // --- 2. VWAP Overlay ---
      if (overlays.vwap) {
        const vwapValues = calculateVWAP(rawCandles);
        const vwapData: LineData<Time>[] = [];
        rawCandles.forEach((c, i) => {
          if (vwapValues[i] !== null) vwapData.push({ time: c.time as Time, value: vwapValues[i]! });
        });
        vwapSeriesRef.current?.setData(vwapData);
      } else {
        vwapSeriesRef.current?.setData([]);
      }

      // --- 3. Bollinger Bands Overlay ---
      if (overlays.bollingerBands) {
        const bb = calculateBollingerBands(closes, 20, 2);
        const upperData: LineData<Time>[] = [];
        const midData: LineData<Time>[] = [];
        const lowerData: LineData<Time>[] = [];

        rawCandles.forEach((c, i) => {
          if (bb.upper[i] !== null) upperData.push({ time: c.time as Time, value: bb.upper[i]! });
          if (bb.middle[i] !== null) midData.push({ time: c.time as Time, value: bb.middle[i]! });
          if (bb.lower[i] !== null) lowerData.push({ time: c.time as Time, value: bb.lower[i]! });
        });

        bbUpperSeriesRef.current?.setData(upperData);
        bbMiddleSeriesRef.current?.setData(midData);
        bbLowerSeriesRef.current?.setData(lowerData);
      } else {
        bbUpperSeriesRef.current?.setData([]);
        bbMiddleSeriesRef.current?.setData([]);
        bbLowerSeriesRef.current?.setData([]);
      }

      // --- 4. Supertrend Overlay ---
      if (overlays.supertrend) {
        const st = calculateSupertrend(rawCandles);
        const stData: LineData<Time>[] = [];
        rawCandles.forEach((c, i) => {
          if (st[i] !== null) stData.push({ time: c.time as Time, value: st[i]!.value });
        });
        supertrendSeriesRef.current?.setData(stData);
      } else {
        supertrendSeriesRef.current?.setData([]);
      }

      // --- 5. Clean Price Lines ---
      priceLinesRef.current.forEach((pl) => {
        try {
          candlestickSeriesRef.current?.removePriceLine(pl);
        } catch {
          // Ignore
        }
      });
      priceLinesRef.current = [];

      const validTimesSet = new Set(rawCandles.map((c) => c.time));
      const markers: SeriesMarker<Time>[] = [];

      // --- Order Blocks Overlay (axisLabelVisible: FALSE) ---
      if (overlays.orderBlocks && smc?.orderBlocks) {
        smc.orderBlocks.forEach((ob) => {
          const color = ob.bias === 'Bullish' ? '#10b981' : '#f43f5e';

          const plTop = candlestickSeriesRef.current?.createPriceLine({
            price: ob.top,
            color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: ``,
          });
          const plBot = candlestickSeriesRef.current?.createPriceLine({
            price: ob.bottom,
            color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: ``,
          });

          if (plTop) priceLinesRef.current.push(plTop);
          if (plBot) priceLinesRef.current.push(plBot);

          if (validTimesSet.has(ob.startTime)) {
            markers.push({
              time: ob.startTime as Time,
              position: ob.bias === 'Bullish' ? 'belowBar' : 'aboveBar',
              color,
              shape: 'square',
              text: `${ob.bias.toUpperCase()} OB`,
            });
          }
        });
      }

      // --- Fair Value Gaps Overlay (axisLabelVisible: FALSE) ---
      if (overlays.fvg && smc?.fairValueGaps) {
        smc.fairValueGaps.forEach((fvg) => {
          const color = fvg.bias === 'Bullish' ? '#06b6d4' : '#f59e0b';

          const plTop = candlestickSeriesRef.current?.createPriceLine({
            price: fvg.top,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: false,
            title: ``,
          });
          const plBot = candlestickSeriesRef.current?.createPriceLine({
            price: fvg.bottom,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: false,
            title: ``,
          });

          if (plTop) priceLinesRef.current.push(plTop);
          if (plBot) priceLinesRef.current.push(plBot);

          if (validTimesSet.has(fvg.time)) {
            markers.push({
              time: fvg.time as Time,
              position: fvg.bias === 'Bullish' ? 'belowBar' : 'aboveBar',
              color,
              shape: 'circle',
              text: `FVG`,
            });
          }
        });
      }

      // --- Liquidity Levels Overlay (axisLabelVisible: FALSE) ---
      if (overlays.liquidity && smc?.liquidityLevels) {
        smc.liquidityLevels.forEach((lvl) => {
          const color = lvl.bias === 'Buy-side' ? '#a855f7' : '#ec4899';

          const pl = candlestickSeriesRef.current?.createPriceLine({
            price: lvl.price,
            color,
            lineWidth: 1,
            lineStyle: 3,
            axisLabelVisible: false,
            title: ``,
          });
          if (pl) priceLinesRef.current.push(pl);

          if (lvl.swept && lvl.sweepTime && validTimesSet.has(lvl.sweepTime)) {
            markers.push({
              time: lvl.sweepTime as Time,
              position: lvl.bias === 'Buy-side' ? 'aboveBar' : 'belowBar',
              color: '#f43f5e',
              shape: lvl.bias === 'Buy-side' ? 'arrowDown' : 'arrowUp',
              text: `LIQUIDITY SWEEP`,
            });
          }
        });
      }

      // --- Structure Breaks (BOS / CHoCH) Overlay (axisLabelVisible: FALSE) ---
      if (smc?.structureBreaks) {
        smc.structureBreaks.forEach((brk) => {
          const showBreak = (brk.type === 'BOS' && overlays.bos) || (brk.type === 'CHoCH' && overlays.choch);
          if (!showBreak) return;

          const color = brk.bias === 'Bullish' ? '#10b981' : '#f43f5e';

          const pl = candlestickSeriesRef.current?.createPriceLine({
            price: brk.price,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: false,
            title: ``,
          });
          if (pl) priceLinesRef.current.push(pl);

          if (validTimesSet.has(brk.time)) {
            markers.push({
              time: brk.time as Time,
              position: brk.bias === 'Bullish' ? 'aboveBar' : 'belowBar',
              color,
              shape: brk.bias === 'Bullish' ? 'arrowUp' : 'arrowDown',
              text: `${brk.bias.toUpperCase()} ${brk.type}`,
            });
          }
        });
      }

      // --- Support & Resistance Overlay (axisLabelVisible: FALSE) ---
      if (overlays.supportResistance && smc?.swings) {
        const recentSwings = smc.swings.slice(-6);
        recentSwings.forEach((s) => {
          const isRes = s.type === 'HH' || s.type === 'LH';
          const color = isRes ? '#f43f5e' : '#10b981';

          const pl = candlestickSeriesRef.current?.createPriceLine({
            price: s.price,
            color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: ``,
          });
          if (pl) priceLinesRef.current.push(pl);
        });
      }

      // --- Session Levels Overlay (axisLabelVisible: FALSE) ---
      if (overlays.sessionLevels && rawCandles.length >= 20) {
        const recent20 = rawCandles.slice(-20);
        const high20 = Math.max(...recent20.map((c) => c.high));
        const low20 = Math.min(...recent20.map((c) => c.low));

        const plHigh = candlestickSeriesRef.current?.createPriceLine({
          price: high20,
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: false,
          title: '',
        });
        const plLow = candlestickSeriesRef.current?.createPriceLine({
          price: low20,
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: false,
          title: '',
        });

        if (plHigh) priceLinesRef.current.push(plHigh);
        if (plLow) priceLinesRef.current.push(plLow);
      }

      // --- Pivot Points Overlay (axisLabelVisible: FALSE) ---
      if (overlays.pivotPoints) {
        const pivots = calculatePivotPoints(rawCandles);
        if (pivots) {
          const plP = candlestickSeriesRef.current?.createPriceLine({
            price: pivots.pivot,
            color: '#eab308',
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: false,
            title: '',
          });
          const plR1 = candlestickSeriesRef.current?.createPriceLine({
            price: pivots.r1,
            color: '#f43f5e',
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: '',
          });
          const plS1 = candlestickSeriesRef.current?.createPriceLine({
            price: pivots.s1,
            color: '#10b981',
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: '',
          });

          if (plP) priceLinesRef.current.push(plP);
          if (plR1) priceLinesRef.current.push(plR1);
          if (plS1) priceLinesRef.current.push(plS1);
        }
      }

      // --- Fibonacci Retracement Levels (axisLabelVisible: FALSE) ---
      if (overlays.fibonacci) {
        const fibs = calculateFibonacciLevels(rawCandles);
        if (fibs) {
          const fib50 = candlestickSeriesRef.current?.createPriceLine({
            price: fibs.fib500,
            color: '#6366f1',
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: false,
            title: '',
          });
          const fib618 = candlestickSeriesRef.current?.createPriceLine({
            price: fibs.fib618,
            color: '#f59e0b',
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: false,
            title: '',
          });

          if (fib50) priceLinesRef.current.push(fib50);
          if (fib618) priceLinesRef.current.push(fib618);
        }
      }

      // --- Candlestick Patterns Markers ---
      if (overlays.candlestickPatterns && cCandlePatterns) {
        cCandlePatterns.forEach((cp) => {
          if (validTimesSet.has(cp.time)) {
            const isBull = cp.type === 'Bullish';
            const isBear = cp.type === 'Bearish';
            let shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square' = isBull ? 'arrowUp' : isBear ? 'arrowDown' : 'circle';
            let color = isBull ? '#10b981' : isBear ? '#f43f5e' : '#eab308';

            markers.push({
              time: cp.time as Time,
              position: isBull ? 'belowBar' : 'aboveBar',
              color,
              shape,
              text: `🕯️ ${cp.name}`,
            });
          }
        });
      }

      // --- Chart Patterns Markers ---
      if (overlays.chartPatterns && cChartPatterns) {
        cChartPatterns.forEach((cp) => {
          if (validTimesSet.has(cp.time)) {
            const isBull = cp.type === 'Bullish';
            let color = isBull ? '#10b981' : '#f43f5e';

            markers.push({
              time: cp.time as Time,
              position: isBull ? 'belowBar' : 'aboveBar',
              color,
              shape: isBull ? 'arrowUp' : 'arrowDown',
              text: `📐 ${cp.name}`,
            });

            if (cp.necklineOrBoundary) {
              const pl = candlestickSeriesRef.current?.createPriceLine({
                price: cp.necklineOrBoundary,
                color,
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: false,
                title: '',
              });
              if (pl) priceLinesRef.current.push(pl);
            }
          }
        });
      }

      // Sort markers chronologically (mandatory for lightweight-charts)
      markers.sort((a, b) => (a.time as number) - (b.time as number));

      // Set markers on candlestick series safely
      try {
        candlestickSeriesRef.current.setMarkers(markers);
      } catch {
        // Ignore duplicate time marker edge cases
      }
    });
  }, []);

  const smc = tradingStore.smcAnalysis;
  const indicators = tradingStore.indicatorValues;
  const symbol = tradingStore.selectedSymbol;
  const candles = tradingStore.candlesMap.get(symbol) || [];
  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#0c0e14] flex flex-col">
      {/* HTML Header Bar - Sleek Legend, OHLCV + Indicator Values Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#121622]/90 border-b border-slate-800/80 text-[11px] font-mono z-10 select-none">
        {/* Left: Active Chart Mode & Live OHLCV */}
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold uppercase">
            {tradingStore.chartType === 'heikinAshi' ? 'HEIKIN-ASHI 📊' : 'CANDLESTICK 🕯️'}
          </span>

          {latestCandle && (
            <div className="hidden sm:flex items-center gap-2.5 text-slate-300">
              <span>O: <strong className="text-slate-100">{formatPrice(latestCandle.open)}</strong></span>
              <span>H: <strong className="text-emerald-400">{formatPrice(latestCandle.high)}</strong></span>
              <span>L: <strong className="text-rose-400">{formatPrice(latestCandle.low)}</strong></span>
              <span>C: <strong className="text-slate-100">{formatPrice(latestCandle.close)}</strong></span>
            </div>
          )}
        </div>

        {/* Right: Live Technical Indicator Values Badges (EMA, VWAP, Supertrend) */}
        {indicators && (
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            {tradingStore.overlayToggles.ema && indicators.ema[20] !== null && indicators.ema[20] !== undefined && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-400">E20: {formatPrice(indicators.ema[20])}</span>
              </div>
            )}
            {tradingStore.overlayToggles.vwap && indicators.vwap !== null && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-purple-400">VWAP: {formatPrice(indicators.vwap)}</span>
              </div>
            )}
            {tradingStore.overlayToggles.supertrend && indicators.supertrend && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                <span className={indicators.supertrend.direction === 'up' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  ST: {indicators.supertrend.direction === 'up' ? 'BULL' : 'BEAR'} ({formatPrice(indicators.supertrend.value)})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chart Canvas Container */}
      <div className="relative flex-1 w-full h-full">
        <div ref={chartContainerRef} className="w-full h-full" />

        {/* SMC Overlay Status Badges */}
        {smc && (
          <div className="absolute top-3 left-3 pointer-events-none flex flex-wrap gap-2 text-[10px] font-mono z-10">
            <div className="px-2.5 py-1 rounded-full bg-[#121622]/90 border border-slate-800 text-slate-300 backdrop-blur shadow-sm">
              STRUCTURE: <span className={smc.overallBias === 'Bullish' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{smc.overallBias.toUpperCase()}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#121622]/90 border border-slate-800 text-slate-300 backdrop-blur shadow-sm">
              ZONE: <span className="text-indigo-400 font-bold">{smc.dealingRange.currentZone}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#121622]/90 border border-slate-800 text-slate-300 backdrop-blur shadow-sm">
              ACTIVE OBs: <span className="text-amber-400 font-bold">{smc.orderBlocks.length}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#121622]/90 border border-slate-800 text-slate-300 backdrop-blur shadow-sm">
              ACTIVE FVGs: <span className="text-cyan-400 font-bold">{smc.fairValueGaps.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
