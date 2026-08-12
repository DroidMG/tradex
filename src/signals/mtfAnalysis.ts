import { Candle, MTFAnalysisResult, MultiTimeframeRow, Timeframe } from '../types/trading';
import { generateHistoricalCandles } from '../data/mockHistorical';
import { calculateAllIndicators } from '../indicators/indicatorsEngine';
import { analyzeSMC } from '../smc/smcEngine';

const DEFAULT_CONFIG = {
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

export function analyzeMultiTimeframe(symbol: string): MTFAnalysisResult {
  const timeframes: Timeframe[] = ['5m', '15m', '1H', '4H', '1D'];
  const rows: MultiTimeframeRow[] = [];

  let bullCount = 0;
  let totalScore = 0;

  timeframes.forEach((tf) => {
    const candles = generateHistoricalCandles(symbol, tf, 100);
    const indicators = calculateAllIndicators(candles, DEFAULT_CONFIG);
    const smc = analyzeSMC(candles, tf);

    const last = candles[candles.length - 1];
    const ema20 = indicators.ema[20] || last.close;
    const ema50 = indicators.ema[50] || last.close;

    const trend: 'Up' | 'Down' | 'Sideways' =
      last.close > ema20 && ema20 > ema50 ? 'Up' : last.close < ema20 && ema20 < ema50 ? 'Down' : 'Sideways';

    const rsi = indicators.rsi ?? 50;
    const momentum =
      rsi > 60 ? 'Strong Bull' : rsi > 52 ? 'Weak Bull' : rsi < 40 ? 'Strong Bear' : rsi < 48 ? 'Weak Bear' : 'Neutral';

    let alignment = 50;
    if (trend === 'Up' && smc.overallBias === 'Bullish') {
      alignment = 85;
      bullCount++;
    } else if (trend === 'Down' && smc.overallBias === 'Bearish') {
      alignment = 80;
    } else {
      alignment = 55;
    }

    totalScore += alignment;

    rows.push({
      timeframe: tf,
      trend,
      structure: smc.overallBias === 'Bullish' ? 'Bullish' : smc.overallBias === 'Bearish' ? 'Bearish' : 'Neutral',
      momentum,
      smcBias: smc.overallBias,
      alignment,
    });
  });

  const overallScore = Math.round(totalScore / timeframes.length);
  const overallBias = bullCount >= 3 ? 'Bullish' : bullCount <= 1 ? 'Bearish' : 'Neutral';

  return {
    rows,
    overallScore,
    overallBias,
  };
}
