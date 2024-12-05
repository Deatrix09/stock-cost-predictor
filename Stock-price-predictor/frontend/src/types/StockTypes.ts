export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  dividends: number;
  stockSplits: number;
}

export interface HistoricalDataResponse {
  symbol: string;
  data: HistoricalDataPoint[];
}

export interface StockChartProps {
  symbol: string;
  data: HistoricalDataPoint[];
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export interface CompanyOfficer {
  name: string;
  title: string;
  age?: number;
  totalPay?: number;
}

export interface StockInfo {
  symbol: string;
  info: {
    shortName: string;
    longName: string;
    industry: string;
    sector: string;
    longBusinessSummary: string;
    website: string;
    marketCap: number;
    currentPrice: number;
    currency: string;
    address1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    phone: string;
    fullTimeEmployees: number;
    companyOfficers: CompanyOfficer[];
    logoUrl?: string;
  };
}

export interface CompanyInfoProps {
  data: StockInfo;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface PredictionDataPoint {
  day: number;
  date: string;
  predicted_price: number;
  lower_bound: number;
  upper_bound: number;
  confidence: number;
  volatility: number;
  prediction_interval: number;
}

export interface ModelMetrics {
  aic: number;
  bic: number;
  rmse: number;
  mae: number;
  accuracy: number;
  volatility: number;
  last_known_price: number;
  last_date: string;
}

export interface PredictionResponse {
  predictions: {
    date: string;
    predicted_price: number;
    lower_bound: number;
    upper_bound: number;
    confidence: number;
    volatility: number;
    prediction_interval: string;
  }[];
  model_metrics: {
    accuracy: number;
    rmse: number;
    volatility: number;
    last_known_price: number;
    confidence: number;
  };
}
