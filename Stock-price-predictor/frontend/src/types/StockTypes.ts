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
  };
}

export interface CompanyInfoProps {
  data: StockInfo;
}

export interface ApiError {
  message: string;
  code?: string;
}
