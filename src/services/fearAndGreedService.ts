export interface FearAndGreedData {
  value: number;
  classification: string;
  yesterdayValue: number;
  yesterdayClassification: string;
  lastWeekValue: number;
  lastWeekClassification: string;
  timeUntilUpdate: string;
  lastFetchedAt: number;
  history: { value: number; timestamp: number; classification: string }[];
}

export function getClassificationColor(value: number): {
  text: string;
  bg: string;
  border: string;
  badgeBg: string;
  gaugeColor: string;
} {
  if (value <= 25) {
    return {
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      badgeBg: 'bg-rose-500/20',
      gaugeColor: '#f43f5e', // rose-500
    };
  }
  if (value <= 45) {
    return {
      text: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      badgeBg: 'bg-orange-500/20',
      gaugeColor: '#fb923c', // orange-400
    };
  }
  if (value <= 55) {
    return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20',
      gaugeColor: '#f59e0b', // amber-500
    };
  }
  if (value <= 75) {
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20',
      gaugeColor: '#10b981', // emerald-500
    };
  }
  return {
    text: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    badgeBg: 'bg-green-500/20',
    gaugeColor: '#22c55e', // green-500
  };
}

let cachedData: FearAndGreedData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // Refresh every 1 min

export async function fetchFearAndGreedIndex(): Promise<FearAndGreedData> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedData;
  }

  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=30');
    if (!res.ok) throw new Error('Failed to fetch Fear & Greed Index');
    const json = await res.json();

    if (json && Array.isArray(json.data) && json.data.length > 0) {
      const items = json.data;
      const current = items[0];
      const yesterday = items[1] || current;
      const lastWeek = items[6] || items[items.length - 1];

      const value = parseInt(current.value, 10);
      const yesterdayValue = parseInt(yesterday.value, 10);
      const lastWeekValue = parseInt(lastWeek.value, 10);

      const secondsRemaining = parseInt(current.time_until_update || '86400', 10);
      const hours = Math.floor(secondsRemaining / 3600);
      const mins = Math.floor((secondsRemaining % 3600) / 60);

      cachedData = {
        value,
        classification: current.value_classification,
        yesterdayValue,
        yesterdayClassification: yesterday.value_classification,
        lastWeekValue,
        lastWeekClassification: lastWeek.value_classification,
        timeUntilUpdate: `${hours}h ${mins}m`,
        lastFetchedAt: now,
        history: items.map((i: any) => ({
          value: parseInt(i.value, 10),
          timestamp: parseInt(i.timestamp, 10) * 1000,
          classification: i.value_classification,
        })),
      };

      lastFetchTime = now;
      return cachedData;
    }
  } catch (err) {
    console.warn('Fear & Greed API fetch failed, using fallback:', err);
  }

  // Fallback if network is unavailable
  if (!cachedData) {
    cachedData = {
      value: 29,
      classification: 'Fear',
      yesterdayValue: 27,
      yesterdayClassification: 'Fear',
      lastWeekValue: 30,
      lastWeekClassification: 'Fear',
      timeUntilUpdate: '18h 12m',
      lastFetchedAt: now,
      history: Array.from({ length: 14 }).map((_, idx) => ({
        value: 28 + Math.floor(Math.sin(idx) * 4),
        timestamp: now - idx * 86400000,
        classification: 'Fear',
      })),
    };
  }

  return cachedData;
}
