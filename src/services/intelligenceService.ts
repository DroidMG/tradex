import {
  OnChainMetrics,
  WhaleTransaction,
  SmartMoneyWallet,
  TokenHolderCategory,
  TokenUnlockEvent,
  DerivativesData,
  ExchangeLiquidityComparison,
  LiquidationCluster,
  MarketOpportunity,
  CryptoNarrative,
  CryptoCalendarEvent,
  SecurityIntelligence,
  PortfolioRiskMetrics,
  AIResearchReport
} from '../types/trading';

export class IntelligenceService {
  public static getOnChainMetrics(symbol: string): OnChainMetrics {
    const isBtc = symbol.includes('BTC');
    const isEth = symbol.includes('ETH');
    const isSol = symbol.includes('SOL');

    const baseVal = isBtc ? 98000 : isEth ? 3200 : isSol ? 190 : 25;

    return {
      symbol,
      activeAddresses24h: isBtc ? 984500 : isEth ? 542100 : isSol ? 1420000 : 185000,
      newAddresses24h: isBtc ? 385000 : isEth ? 142000 : isSol ? 490000 : 42000,
      txCount24h: isBtc ? 540000 : isEth ? 1180000 : isSol ? 38500000 : 240000,
      txVolumeUSD24h: isBtc ? 38500000000 : isEth ? 19800000000 : isSol ? 7400000000 : 850000000,
      avgGasFeeUSD: isBtc ? 2.45 : isEth ? 1.85 : isSol ? 0.0025 : 0.04,
      whaleTxCount24h: isBtc ? 1480 : isEth ? 920 : isSol ? 640 : 120,
      exchangeInflow24hUSD: isBtc ? 1420000000 : isEth ? 840000000 : isSol ? 310000000 : 45000000,
      exchangeOutflow24hUSD: isBtc ? 1850000000 : isEth ? 990000000 : isSol ? 420000000 : 38000000,
      exchangeReserveUSD: isBtc ? 192000000000 : isEth ? 62000000000 : isSol ? 9400000000 : 1200000000,
      netExchangeFlow24hUSD: isBtc ? -430000000 : isEth ? -150000000 : isSol ? -110000000 : 7000000,
      stablecoinNetflow24hUSD: 680000000,
      mvrvZScore: isBtc ? 2.18 : isEth ? 1.64 : isSol ? 2.85 : 1.45,
      soprRatio: isBtc ? 1.024 : isEth ? 1.012 : isSol ? 1.045 : 0.998,
      nvtRatio: isBtc ? 48.2 : isEth ? 32.5 : isSol ? 24.1 : 58.4,
      realizedCapUSD: isBtc ? 640000000000 : isEth ? 210000000000 : isSol ? 38000000000 : 4500000000,
      top10ConcentrationPercent: isBtc ? 11.2 : isEth ? 32.4 : isSol ? 28.5 : 44.8,
      top50ConcentrationPercent: isBtc ? 24.8 : isEth ? 51.2 : isSol ? 48.1 : 68.2,
    };
  }

  public static getWhaleTransactions(): WhaleTransaction[] {
    const now = Date.now();
    return [
      {
        id: 'wtx-1',
        hash: '0x8f1e...4a2b',
        timestamp: now - 180000,
        symbol: 'BTC/USD',
        amountToken: 1250,
        amountUSD: 119375000,
        fromAddress: '1P5ZED...9xLq',
        fromLabel: 'Binance Cold Storage',
        toAddress: '34xp4v...a1k9',
        toLabel: 'Anonymous Whale (0x34x)',
        txType: 'Exchange Withdrawal',
        impact: 'High',
      },
      {
        id: 'wtx-2',
        hash: '0x3c2a...9f1e',
        timestamp: now - 450000,
        symbol: 'ETH/USD',
        amountToken: 18400,
        amountUSD: 59800000,
        fromAddress: '0x7099...8902',
        fromLabel: 'Jump Trading Custody',
        toAddress: '0x3c44...1e01',
        toLabel: 'Bybit Hot Wallet',
        txType: 'Exchange Deposit',
        impact: 'High',
      },
      {
        id: 'wtx-3',
        hash: '0x71ab...2d8c',
        timestamp: now - 900000,
        symbol: 'SOL/USD',
        amountToken: 240000,
        amountUSD: 45600000,
        fromAddress: '5p2K...j9Lq',
        fromLabel: 'Coinbase Prime Vault',
        toAddress: '9xK4...2mP9',
        toLabel: 'Smart Money (0x9xK)',
        txType: 'Wallet Transfer',
        impact: 'Medium',
      },
      {
        id: 'wtx-4',
        hash: '0x12ed...8b4a',
        timestamp: now - 1400000,
        symbol: 'FET/USD',
        amountToken: 12500000,
        amountUSD: 23750000,
        fromAddress: '0x4f81...7c2d',
        fromLabel: 'Wintermute OTC',
        toAddress: '0x8891...3a02',
        toLabel: 'Accumulation Wallet',
        txType: 'DeFi Swap',
        impact: 'High',
      },
    ];
  }

  public static getSmartMoneyWallets(): SmartMoneyWallet[] {
    return [
      {
        id: 'sm-1',
        address: '0x34xp4v...a1k9',
        label: 'Jump Trading Macro Fund',
        category: 'Market Maker',
        portfolioValueUSD: 485000000,
        winRate30d: 78.4,
        pnl30dPercent: 24.8,
        topHoldings: [
          { symbol: 'BTC', percent: 45 },
          { symbol: 'ETH', percent: 30 },
          { symbol: 'SOL', percent: 15 },
        ],
        recentAction: 'Accumulated 1,250 BTC ($119M) from Binance',
        isFollowing: true,
      },
      {
        id: 'sm-2',
        address: '0x7099...8902',
        label: 'Wintermute Strategic Alpha',
        category: 'Trading Firm',
        portfolioValueUSD: 310000000,
        winRate30d: 81.2,
        pnl30dPercent: 32.1,
        topHoldings: [
          { symbol: 'SOL', percent: 35 },
          { symbol: 'FET', percent: 25 },
          { symbol: 'ONDO', percent: 20 },
        ],
        recentAction: 'Swapped $23.7M USDT for FET on Uniswap V3',
        isFollowing: true,
      },
      {
        id: 'sm-3',
        address: '0x1e88...3c99',
        label: 'Paradigm Crypto Opportunities',
        category: 'VC Fund',
        portfolioValueUSD: 890000000,
        winRate30d: 72.0,
        pnl30dPercent: 18.5,
        topHoldings: [
          { symbol: 'ETH', percent: 50 },
          { symbol: 'UNI', percent: 20 },
          { symbol: 'AAVE', percent: 15 },
        ],
        recentAction: 'Staked 14,000 ETH into Lido protocol',
        isFollowing: false,
      },
    ];
  }

  public static getTokenHolders(symbol: string): TokenHolderCategory[] {
    return [
      { category: 'Top 10 Whales', percentage: 24.5, amountUSD: 45000000000 },
      { category: 'Exchanges', percentage: 18.2, amountUSD: 33500000000 },
      { category: 'Team & Insiders', percentage: 12.0, amountUSD: 22000000000 },
      { category: 'Treasury & Reserve', percentage: 15.3, amountUSD: 28000000000 },
      { category: 'Vesting Escrow', percentage: 8.0, amountUSD: 14700000000 },
      { category: 'Retail & Community', percentage: 22.0, amountUSD: 40400000000 },
    ];
  }

  public static getTokenUnlocks(): TokenUnlockEvent[] {
    const now = Date.now();
    const day = 86400000;
    return [
      {
        id: 'unl-1',
        symbol: 'SUI/USD',
        name: 'Sui Network',
        unlockDate: '2026-08-15',
        unlockTimestamp: now + day * 3,
        unlockAmountTokens: 64000000,
        unlockAmountUSD: 208000000,
        percentOfCirculating: 2.25,
        recipientCategory: 'Team',
        pressureImpact: 'High',
      },
      {
        id: 'unl-2',
        symbol: 'ARB/USD',
        name: 'Arbitrum',
        unlockDate: '2026-08-18',
        unlockTimestamp: now + day * 6,
        unlockAmountTokens: 92600000,
        unlockAmountUSD: 92600000,
        percentOfCirculating: 2.43,
        recipientCategory: 'Seed Investors',
        pressureImpact: 'High',
      },
      {
        id: 'unl-3',
        symbol: 'OP/USD',
        name: 'Optimism',
        unlockDate: '2026-08-22',
        unlockTimestamp: now + day * 10,
        unlockAmountTokens: 31400000,
        unlockAmountUSD: 72200000,
        percentOfCirculating: 2.51,
        recipientCategory: 'Ecosystem',
        pressureImpact: 'Medium',
      },
      {
        id: 'unl-4',
        symbol: 'ONDO/USD',
        name: 'Ondo Finance',
        unlockDate: '2026-08-28',
        unlockTimestamp: now + day * 16,
        unlockAmountTokens: 142000000,
        unlockAmountUSD: 213000000,
        percentOfCirculating: 10.1,
        recipientCategory: 'Treasury',
        pressureImpact: 'High',
      },
    ];
  }

  public static getDerivativesData(symbol: string): DerivativesData {
    const isBtc = symbol.includes('BTC');
    const isEth = symbol.includes('ETH');

    return {
      symbol,
      openInterestUSD: isBtc ? 38500000000 : isEth ? 14200000000 : 1850000000,
      openInterestChange24h: 4.8,
      fundingRateCurrentPercent: 0.0125, // 0.0125% per 8h
      fundingRate8hPredicted: 0.0142,
      liquidations24hLongUSD: isBtc ? 42000000 : 18500000,
      liquidations24hShortUSD: isBtc ? 88000000 : 34000000,
      longShortRatio: 1.32, // 56.9% long vs 43.1% short
      futuresVolume24hUSD: isBtc ? 68000000000 : 32000000000,
      impliedVolatility30d: 54.2,
      optionsPutCallRatio: 0.68,
      basisPercent: 0.85,
    };
  }

  public static getExchangeComparisons(symbol: string, currentPrice: number): ExchangeLiquidityComparison[] {
    return [
      {
        exchange: 'Binance',
        spotPrice: currentPrice,
        futuresPrice: currentPrice * 1.0008,
        bid: currentPrice - 0.1,
        ask: currentPrice + 0.1,
        spreadBps: 0.02,
        depth2PercentUSD: 48500000,
        fundingRate: 0.012,
        openInterestUSD: 14200000000,
        volume24hUSD: 28500000000,
      },
      {
        exchange: 'Bybit',
        spotPrice: currentPrice * 0.9999,
        futuresPrice: currentPrice * 1.0009,
        bid: currentPrice - 0.15,
        ask: currentPrice + 0.12,
        spreadBps: 0.03,
        depth2PercentUSD: 32000000,
        fundingRate: 0.013,
        openInterestUSD: 9800000000,
        volume24hUSD: 18200000000,
      },
      {
        exchange: 'OKX',
        spotPrice: currentPrice * 1.0001,
        futuresPrice: currentPrice * 1.0007,
        bid: currentPrice - 0.12,
        ask: currentPrice + 0.14,
        spreadBps: 0.03,
        depth2PercentUSD: 28000000,
        fundingRate: 0.011,
        openInterestUSD: 7400000000,
        volume24hUSD: 12400000000,
      },
      {
        exchange: 'Coinbase',
        spotPrice: currentPrice * 1.0004,
        futuresPrice: currentPrice * 1.0010,
        bid: currentPrice - 0.08,
        ask: currentPrice + 0.08,
        spreadBps: 0.02,
        depth2PercentUSD: 38000000,
        fundingRate: 0.010,
        openInterestUSD: 3100000000,
        volume24hUSD: 8500000000,
      },
    ];
  }

  public static getLiquidationClusters(currentPrice: number): LiquidationCluster[] {
    return [
      { priceLevel: currentPrice * 1.02, longVolumeUSD: 0, shortVolumeUSD: 145000000, leverageTier: '100x', distancePercent: 2.0 },
      { priceLevel: currentPrice * 1.05, longVolumeUSD: 0, shortVolumeUSD: 380000000, leverageTier: '50x', distancePercent: 5.0 },
      { priceLevel: currentPrice * 1.10, longVolumeUSD: 0, shortVolumeUSD: 820000000, leverageTier: '25x', distancePercent: 10.0 },
      { priceLevel: currentPrice * 0.98, longVolumeUSD: 185000000, shortVolumeUSD: 0, leverageTier: '100x', distancePercent: -2.0 },
      { priceLevel: currentPrice * 0.95, longVolumeUSD: 490000000, shortVolumeUSD: 0, leverageTier: '50x', distancePercent: -5.0 },
      { priceLevel: currentPrice * 0.90, longVolumeUSD: 940000000, shortVolumeUSD: 0, leverageTier: '25x', distancePercent: -10.0 },
    ];
  }

  public static getOpportunities(): MarketOpportunity[] {
    return [
      {
        id: 'opp-1',
        symbol: 'SUI/USD',
        title: 'Massive Volume Spike & Breakout (+19.5% 7d)',
        type: 'Volume Spike',
        score: 94,
        reasoning: '24h volume up 210% to $1.85B with institutional Move-L1 inflows and RSI breaking 65.',
        timestamp: Date.now() - 300000,
      },
      {
        id: 'opp-2',
        symbol: 'FET/USD',
        title: 'AI Narrative Whale Accumulation',
        type: 'Whale Accumulation',
        score: 91,
        reasoning: 'Smart money wallets accumulated $23.7M FET on OTC desks while exchange reserves dropped 4.2%.',
        timestamp: Date.now() - 900000,
      },
      {
        id: 'opp-3',
        symbol: 'SOL/USD',
        title: 'Short Squeeze Cluster at $205',
        type: 'Short Squeeze Risk',
        score: 88,
        reasoning: '$380M short liquidations stacked between $202-$206 with funding rate resetting to baseline.',
        timestamp: Date.now() - 1200000,
      },
      {
        id: 'opp-4',
        symbol: 'BTC/USD',
        title: 'Daily Bullish Order Block Retest ($94.2k)',
        type: 'SMC Structure Break',
        score: 96,
        reasoning: 'Liquidity sweep below $93.8k filled fresh 4H Order Block with immediate 1,250 BTC whale bid.',
        timestamp: Date.now() - 1800000,
      },
    ];
  }

  public static getNarratives(): CryptoNarrative[] {
    return [
      {
        id: 'nar-1',
        name: 'AI & Autonomous Agents',
        mentionVolume24h: 184500,
        mentionVolumeChangePercent: 42.8,
        marketCapPerformance7dPercent: 24.5,
        topTokens: ['FET', 'RENDER', 'NEAR', 'TAO'],
        momentumScore: 95,
      },
      {
        id: 'nar-2',
        name: 'Real World Assets (RWA)',
        mentionVolume24h: 92100,
        mentionVolumeChangePercent: 28.4,
        marketCapPerformance7dPercent: 18.2,
        topTokens: ['ONDO', 'MKR', 'PENDLE'],
        momentumScore: 89,
      },
      {
        id: 'nar-3',
        name: 'High Performance L1s',
        mentionVolume24h: 210000,
        mentionVolumeChangePercent: 15.2,
        marketCapPerformance7dPercent: 16.8,
        topTokens: ['SOL', 'SUI', 'AVAX', 'NEAR'],
        momentumScore: 92,
      },
      {
        id: 'nar-4',
        name: 'Meme Supercycle',
        mentionVolume24h: 310000,
        mentionVolumeChangePercent: -8.4,
        marketCapPerformance7dPercent: 8.4,
        topTokens: ['PEPE', 'DOGE', 'SHIB', 'WIF'],
        momentumScore: 78,
      },
    ];
  }

  public static getCalendarEvents(): CryptoCalendarEvent[] {
    const now = Date.now();
    const day = 86400000;
    return [
      {
        id: 'evt-1',
        title: 'Fed FOMC Rate Decision & Press Conference',
        date: '2026-08-14',
        category: 'Fed Rate',
        impact: 'High',
        description: 'US Federal Reserve interest rate guidance and macroeconomic policy outlook.',
      },
      {
        id: 'evt-2',
        title: 'Sui Network $208M Cliff Token Unlock',
        date: '2026-08-15',
        category: 'Unlock',
        symbol: 'SUI/USD',
        impact: 'High',
        description: '64M SUI allocated to core contributors and seed investors unlocks.',
      },
      {
        id: 'evt-3',
        title: 'Ethereum Pectra Hardfork Testnet Launch',
        date: '2026-08-20',
        category: 'Mainnet',
        symbol: 'ETH/USD',
        impact: 'High',
        description: 'EIP-7702 account abstraction and validator staking flexibility improvements.',
      },
    ];
  }

  public static getSecurityIntelligence(symbol: string): SecurityIntelligence {
    return {
      symbol,
      auditScore: 96,
      auditors: ['CertiK', 'OpenZeppelin', 'Trail of Bits', 'ConsenSys Diligence'],
      adminKeyMultisig: '5-of-9 Hardware Multisig (Institutional Custody)',
      upgradeabilityRisk: 'Low',
      oracleDependency: 'Chainlink Decentralized Oracles + Pyth Network',
      tvlUSD: 62000000000,
      exploitHistory: 'Zero critical smart contract exploits recorded.',
    };
  }

  public static getPortfolioRisk(balanceUSD: number): PortfolioRiskMetrics {
    return {
      totalBalanceUSD: balanceUSD,
      dailyReturnPercent: 2.14,
      sharpeRatio: 2.28,
      sortinoRatio: 3.12,
      maxDrawdownPercent: -8.4,
      volatility30dPercent: 12.8,
      valueAtRisk95Percent: -3.8,
      betaToBtc: 1.05,
      stablecoinRatioPercent: 18.5,
      topAssetConcentrationPercent: 42.0,
      warnings: [
        'Top asset (BTC) concentration is 42% — well balanced.',
        '18.5% stablecoin cash reserve provides optimal dip-buying liquidity.',
      ],
    };
  }

  public static generateAIResearchReport(symbol: string, name: string): AIResearchReport {
    return {
      symbol,
      name,
      generatedAt: new Date().toISOString().split('T')[0],
      marketOverview: `${name} (${symbol}) demonstrates strong institutional demand with expanding trading volume across major spot & derivatives terminals.`,
      pricePerformance: `Outperforming sector benchmark over 30d with +28.4% upside expansion and sustained positive funding.`,
      technicalSummary: `Trading above 20d EMA & 50d EMA with bullish SMC Order Block confirmation around structural demand zone. RSI sits in optimal momentum zone (62).`,
      onChainAnalysis: `Exchange net outflows remain positive ($430M net withdrawal), indicating strong whale custody accumulation. Active address growth +14% YoY.`,
      derivativesOutlook: `Open Interest increased 4.8% alongside stable funding rate (0.0125%), signalling healthy organic spot-driven leverage.`,
      whaleSentiment: `High Smart Money accumulation score (88/100). Top Jump Trading & Wintermute wallets held positions with 0 recent distribution.`,
      tokenomicsRating: 'Grade A (Strong Deflationary / Staking Utility)',
      keySupportLevels: [94200, 92000, 89500],
      keyResistanceLevels: [98500, 102000, 108900],
      bullishFactors: [
        'Sustained net exchange outflows (Whale accumulation)',
        'Positive multi-timeframe SMC market structure (BOS on 4H & 1D)',
        'Low short squeeze liquidity risk near current price',
      ],
      bearishFactors: [
        'Macro FOMC interest rate volatility catalyst ahead',
        'Slight derivatives open interest concentration near ATH',
      ],
      riskScore: 3, // Low risk
    };
  }
}
