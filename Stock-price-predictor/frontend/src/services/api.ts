import axios from 'axios';
import { handleApiError } from '../utils/errorHandling';
import { StockInfo, HistoricalDataPoint, ApiError, HistoricalDataResponse } from '../types/StockTypes';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private validateSymbol(symbol: string): void {
    if (!symbol) {
      throw new Error('Stock symbol is required');
    }
    if (typeof symbol !== 'string') {
      throw new Error('Stock symbol must be a string');
    }
    if (symbol.length > 10) {
      throw new Error('Invalid stock symbol length');
    }
  }

  async getStockInfo(symbol: string): Promise<StockInfo> {
    try {
      this.validateSymbol(symbol);
      const response = await axios.get(`${API_BASE_URL}/stocks/info/${symbol.toUpperCase()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getHistoricalData(symbol: string, period: string = '5y', interval: string = '1wk'): Promise<HistoricalDataResponse> {
    try {
      this.validateSymbol(symbol);
      console.log('Fetching historical data:', { symbol, period, interval });
      const response = await axios.get<HistoricalDataResponse>(
        `${API_BASE_URL}/stocks/historical/${symbol.toUpperCase()}`,
        { params: { period, interval } }
      );
      
      console.log('API Response:', response.data);
      
      // Validate the response structure
      const data = response.data.data;
      if (!Array.isArray(data)) {
        throw new Error('Invalid historical data format');
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async searchStocks(query: string): Promise<string[]> {
    try {
      if (!query) {
        throw new Error('Search query is required');
      }
      const response = await axios.get(`${API_BASE_URL}/stocks/search/${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export type { ApiError };
export default new ApiService();
