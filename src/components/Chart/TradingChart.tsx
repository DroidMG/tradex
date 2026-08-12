import React, { useEffect, useRef } from 'react';
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
import { calculateEMA, calculateVWAP, calculateBollingerBands } from '../../indicators/indicatorsEngine';

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

  // Price Lines Ref
  const priceLinesRef = useRef<IPriceLine[]>([]);

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

    // 1. Candlestick series
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

    // 3. EMA Line series
    ema20SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#3b82f6', // Blue
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'EMA 20',
    });

    ema50SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#f59e0b', // Amber
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'EMA 50',
    });

    ema200SeriesRef.current = chart.addSeries(LineSeries, {
      color: '#ec4899', // Pink
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'EMA 200',
    });

    // 4. VWAP Line series
    vwapSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#8b5cf6', // Purple
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'VWAP',
    });

    // 5. Bollinger Bands Series
    bbUpperSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      title: 'BB Upper',
    });
    bbMiddleSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 1,
      priceLineVisible: false,
      title: 'BB Middle',
    });
    bbLowerSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#06b6d4',
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
      title: 'BB Lower',
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
    };
  }, []);

  // Update candle data & overlays whenever store updates
  useEffect(() => {
    return tradingStore.subscribe(() => {
      if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

      const symbol = tradingStore.selectedSymbol;
      const candles = tradingStore.candlesMap.get(symbol) || [];
      if (candles.length === 0) return;

      const overlays = tradingStore.overlayToggles;
      const smc = tradingStore.smcAnalysis;

      // Candlestick Data
      const chartCandles: CandlestickData<Time>[] = candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      // Volume Data
      const chartVolume = overlays.volume
        ? candles.map((c) => ({
            time: c.time as Time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)',
          }))
        : [];

      candlestickSeriesRef.current.setData(chartCandles);
      volumeSeriesRef.current.setData(chartVolume);

      const closes = candles.map((c) => c.close);

      // --- 1. EMA Overlay ---
      if (overlays.ema) {
        const ema20Values = calculateEMA(closes, 20);
        const ema50Values = calculateEMA(closes, 50);
        const ema200Values = calculateEMA(closes, 200);

        const ema20Data: LineData<Time>[] = [];
        const ema50Data: LineData<Time>[] = [];
        const ema200Data: LineData<Time>[] = [];

        candles.forEach((c, i) => {
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
        const vwapValues = calculateVWAP(candles);
        const vwapData: LineData<Time>[] = [];
        candles.forEach((c, i) => {
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

        candles.forEach((c, i) => {
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

      // --- 4. Price Lines & Markers Clean / Re-render ---
      priceLinesRef.current.forEach((pl) => {
        try {
          candlestickSeriesRef.current?.removePriceLine(pl);
        } catch {
          // Ignore
        }
      });
      priceLinesRef.current = [];

      const validTimesSet = new Set(candles.map((c) => c.time));
      const markers: SeriesMarker<Time>[] = [];

      // --- Order Blocks Overlay ---
      if (overlays.orderBlocks && smc?.orderBlocks) {
        smc.orderBlocks.forEach((ob) => {
          const color = ob.bias === 'Bullish' ? '#10b981' : '#f43f5e';

          const plTop = candlestickSeriesRef.current?.createPriceLine({
            price: ob.top,
            color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `${ob.bias.toUpperCase()} OB (${ob.timeframe})`,
          });
          const plBot = candlestickSeriesRef.current?.createPriceLine({
            price: ob.bottom,
            color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `${ob.bias.toUpperCase()} OB LOW`,
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

      // --- Fair Value Gaps Overlay ---
      if (overlays.fvg && smc?.fairValueGaps) {
        smc.fairValueGaps.forEach((fvg) => {
          const color = fvg.bias === 'Bullish' ? '#06b6d4' : '#f59e0b';

          const plTop = candlestickSeriesRef.current?.createPriceLine({
            price: fvg.top,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: true,
            title: `${fvg.bias.toUpperCase()} FVG TOP`,
          });
          const plBot = candlestickSeriesRef.current?.createPriceLine({
            price: fvg.bottom,
            color,
            lineWidth: 1,
            lineStyle: 1,
            axisLabelVisible: true,
            title: `${fvg.bias.toUpperCase()} FVG BOT`,
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

      // --- Liquidity Levels Overlay ---
      if (overlays.liquidity && smc?.liquidityLevels) {
        smc.liquidityLevels.forEach((lvl) => {
          const color = lvl.bias === 'Buy-side' ? '#a855f7' : '#ec4899';

          const pl = candlestickSeriesRef.current?.createPriceLine({
            price: lvl.price,
            color,
            lineWidth: 1,
            lineStyle: 3,
            axisLabelVisible: true,
            title: `${lvl.type}`,
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

      // --- BOS & CHoCH Structure Breaks Overlay ---
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
            axisLabelVisible: true,
            title: `${brk.bias.toUpperCase()} ${brk.type}`,
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

      // --- Support & Resistance Overlay ---
      if (overlays.supportResistance && smc?.swings) {
        const recentSwings = smc.swings.slice(-6);
        recentSwings.forEach((s) => {
          const isRes = s.type === 'HH' || s.type === 'LH';
          const color = isRes ? '#f43f5e' : '#10b981';
          const title = isRes ? `RES` : `SUP`;

          const pl = candlestickSeriesRef.current?.createPriceLine({
            price: s.price,
            color,
            lineWidth: 1,
            lineStyle: 2,
            axisLabelVisible: true,
            title: `${title} (${s.price.toFixed(2)})`,
          });
          if (pl) priceLinesRef.current.push(pl);
        });
      }

      // --- Session Levels Overlay ---
      if (overlays.sessionLevels && candles.length >= 20) {
        const recent20 = candles.slice(-20);
        const high20 = Math.max(...recent20.map((c) => c.high));
        const low20 = Math.min(...recent20.map((c) => c.low));

        const plHigh = candlestickSeriesRef.current?.createPriceLine({
          price: high20,
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'SESSION HIGH',
        });
        const plLow = candlestickSeriesRef.current?.createPriceLine({
          price: low20,
          color: '#3b82f6',
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: 'SESSION LOW',
        });

        if (plHigh) priceLinesRef.current.push(plHigh);
        if (plLow) priceLinesRef.current.push(plLow);
      }

      // Sort markers chronologically (mandatory for lightweight-charts)
      markers.sort((a, b) => (a.time as number) - (b.time as number));

      // Set markers on candlestick series
      try {
        candlestickSeriesRef.current.setMarkers(markers);
      } catch {
        // Ignore duplicate time marker edge cases
      }
    });
  }, []);

  const smc = tradingStore.smcAnalysis;

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#0c0e14]">
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
  );
};
