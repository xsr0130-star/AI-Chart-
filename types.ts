
export enum Sentiment {
  BULLISH = '強気',
  BEARISH = '弱気',
  NEUTRAL = '中立'
}

export interface TradeSetup {
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  timeframe: string;
}

export interface ChartAnalysis {
  sentiment: string; // Changed from Sentiment enum to string for descriptive flexibility
  confidence: number;
  keySupportLevels: string[];
  keyResistanceLevels: string[];
  indicatorsObserved: string[];
  technicalReasoning: string;
  liquidityReasoning: string;
  overallSummary: string;
  reasoning?: string; // Legacy support
  tradeSetup?: TradeSetup;
  analyzedAt?: string;
}

export interface AnalysisState {
  isLoading: boolean;
  result: ChartAnalysis | null;
  error: string | null;
  previewUrls: string[];
}
