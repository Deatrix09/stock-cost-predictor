import React, { useState } from 'react';
import api from './services/api';
import CompanyInfo from './components/CompanyInfo';
import StockChart from './components/StockChart';
import PredictionDashboard from './components/PredictionDashboard';
import { StockInfo, HistoricalDataPoint, ApiError, HistoricalDataResponse, PredictionResponse } from './types/StockTypes';
import LoadingIndicator from './components/LoadingIndicator';

function App() {
  const [symbol, setSymbol] = useState('');
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResponse | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const [info, data, pred] = await Promise.all([
        api.getStockInfo(symbol),
        api.getHistoricalData(symbol),
        api.getPredictions(symbol)
      ]);
      
      setStockInfo(info);
      setHistoricalData(data);
      setPredictions(pred);
    } catch (err) {
      console.log('Error fetching data:', err);
      setError(err as ApiError);
      setStockInfo(null);
      setHistoricalData(null);
      setPredictions(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Stock Price Predictor
          </h1>
          <p className="text-gray-400">
            Enter a stock symbol to view its price history and company information
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              placeholder="Enter stock symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !symbol.trim()}
              className="absolute right-2 top-2 px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error.message}</p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <LoadingIndicator size="large" />
          </div>
        ) : (
          stockInfo && historicalData && predictions && (
            <div className="space-y-8">
              <CompanyInfo data={stockInfo} />
              <PredictionDashboard predictions={predictions} />
              <StockChart data={historicalData} />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
