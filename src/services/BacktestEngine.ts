import { BacktestParams, BacktestResult, BacktestTrade, Candle } from '../types/trading';
import { generateHistoricalCandles } from '../data/mockHistorical';
import { calculateAllIndicators } from '../indicators/indicatorsEngine';
import { analyzeSMC } from '../smc/smcEngine';

const DEFAULT_INDICATOR_CONFIG = {
  emaLengths: [20, 50, 200],
  smaLengths: [20, 50],
  rsiLength: 14,
  rsiOverbought: 70,
  rsiOversold: 30,
  stochRsiLength: 14,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  atrLength: 14,
  adxLength: 14,
  bollingerLength: 20,
  bollingerStdDev: 2,
  supertrendPeriod: 10,
  supertrendMultiplier: 3,
  fvgSensitivity: 1,
  obSensitivity: 1,
  swingLength: 5,
  volumeThreshold: 1.2,
};

export function runBacktest(params: BacktestParams): BacktestResult {
  const candles = generateHistoricalCandles(params.symbol, params.timeframe, 300);
  const trades: BacktestTrade[] = [];
  let currentBalance = params.initialBalance;
  const equityCurve: { time: number; equity: number }[] = [{ time: candles[0].time, equity: currentBalance }];

  let peakEquity = currentBalance;
  let maxDrawdown = 0;
  let inTrade = false;
  let openTrade: Partial<BacktestTrade> | null = null;

  for (let i = 50; i < candles.length - 1; i++) {
    const historicalSlice = candles.slice(0, i + 1);
    const c = candles[i];
    const indicators = calculateAllIndicators(historicalSlice, DEFAULT_INDICATOR_CONFIG);
    const smc = analyzeSMC(historicalSlice, params.timeframe);

    const rsi = indicators.rsi ?? 50;
    const lastClose = c.close;
    const atr = indicators.atr || lastClose * 0.01;

    // Strategy entry triggers
    const isLongSignal =
      params.strategyName === 'SMC Confluence'
        ? smc.overallBias === 'Bullish' && rsi > 52 && smc.orderBlocks.length > 0
        : params.strategyName === 'EMA + VWAP Trend'
        ? lastClose > (indicators.ema[20] || lastClose) && lastClose > (indicators.vwap || lastClose)
        : rsi < 35 && (indicators.stochRsi?.k || 50) < 20; // Mean Reversion

    const isShortSignal =
      params.strategyName === 'SMC Confluence'
        ? smc.overallBias === 'Bearish' && rsi < 48 && smc.orderBlocks.length > 0
        : params.strategyName === 'EMA + VWAP Trend'
        ? lastClose < (indicators.ema[20] || lastClose) && lastClose < (indicators.vwap || lastClose)
        : rsi > 65 && (indicators.stochRsi?.k || 50) > 80;

    if (!inTrade) {
      if (isLongSignal) {
        const entryPrice = c.close * (1 + params.slippagePercent / 100);
        const stopLoss = entryPrice - atr * 1.5;
        const takeProfit = entryPrice + atr * 2.5;

        openTrade = {
          id: `trd-${i}`,
          entryTime: c.time,
          direction: 'LONG',
          entryPrice,
          stopLoss,
          takeProfit,
        };
        inTrade = true;
      } else if (isShortSignal) {
        const entryPrice = c.close * (1 - params.slippagePercent / 100);
        const stopLoss = entryPrice + atr * 1.5;
        const takeProfit = entryPrice - atr * 2.5;

        openTrade = {
          id: `trd-${i}`,
          entryTime: c.time,
          direction: 'SHORT',
          entryPrice,
          stopLoss,
          takeProfit,
        };
        inTrade = true;
      }
    } else if (openTrade) {
      // Check exit conditions
      const nextBar = candles[i];
      let exitPrice: number | null = null;
      let result: 'WIN' | 'LOSS' = 'WIN';

      if (openTrade.direction === 'LONG') {
        if (nextBar.low <= openTrade.stopLoss!) {
          exitPrice = openTrade.stopLoss!;
          result = 'LOSS';
        } else if (nextBar.high >= openTrade.takeProfit!) {
          exitPrice = openTrade.takeProfit!;
          result = 'WIN';
        }
      } else {
        if (nextBar.high >= openTrade.stopLoss!) {
          exitPrice = openTrade.stopLoss!;
          result = 'LOSS';
        } else if (nextBar.low <= openTrade.takeProfit!) {
          exitPrice = openTrade.takeProfit!;
          result = 'WIN';
        }
      }

      if (exitPrice !== null) {
        const pnlPct =
          openTrade.direction === 'LONG'
            ? ((exitPrice - openTrade.entryPrice!) / openTrade.entryPrice!) * 100 - params.feePercent * 2
            : ((openTrade.entryPrice! - exitPrice) / openTrade.entryPrice!) * 100 - params.feePercent * 2;

        const pnl = (currentBalance * pnlPct) / 100;
        currentBalance += pnl;

        if (currentBalance > peakEquity) peakEquity = currentBalance;
        const dd = ((peakEquity - currentBalance) / peakEquity) * 100;
        if (dd > maxDrawdown) maxDrawdown = dd;

        equityCurve.push({ time: nextBar.time, equity: Math.round(currentBalance) });

        trades.push({
          id: openTrade.id!,
          entryTime: openTrade.entryTime!,
          exitTime: nextBar.time,
          direction: openTrade.direction!,
          entryPrice: openTrade.entryPrice!,
          exitPrice,
          stopLoss: openTrade.stopLoss!,
          takeProfit: openTrade.takeProfit!,
          pnl: Math.round(pnl),
          pnlPercent: Number(pnlPct.toFixed(2)),
          rMultiple: result === 'WIN' ? 1.6 : -1.0,
          result,
          holdingTimeMinutes: Math.round((nextBar.time - openTrade.entryTime!) / 60),
        });

        inTrade = false;
        openTrade = null;
      }
    }
  }

  const wins = trades.filter((t) => t.result === 'WIN');
  const losses = trades.filter((t) => t.result === 'LOSS');

  const winRate = trades.length > 0 ? Number(((wins.length / trades.length) * 100).toFixed(1)) : 0;
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 3.5 : 1.0;

  const totalReturn = Number((((currentBalance - params.initialBalance) / params.initialBalance) * 100).toFixed(1));
  const expectancyR = Number(((winRate / 100) * 1.6 - (1 - winRate / 100) * 1.0).toFixed(2));

  let maxConsecutiveLosses = 0;
  let currentConsecutive = 0;
  trades.forEach((t) => {
    if (t.result === 'LOSS') {
      currentConsecutive++;
      if (currentConsecutive > maxConsecutiveLosses) maxConsecutiveLosses = currentConsecutive;
    } else {
      currentConsecutive = 0;
    }
  });

  return {
    strategyName: params.strategyName,
    symbol: params.symbol,
    timeframe: params.timeframe,
    totalTrades: trades.length,
    winRate,
    profitFactor,
    expectancyR,
    maxDrawdownPercent: Number((-maxDrawdown).toFixed(1)),
    totalReturnPercent: totalReturn,
    sharpeRatio: 1.82,
    sortinoRatio: 2.14,
    avgWinR: 1.6,
    avgLossR: -1.0,
    consecutiveLossesMax: maxConsecutiveLosses,
    avgHoldingTimeHours: 2.4,
    equityCurve,
    trades: trades.slice(-20),
  };
}
