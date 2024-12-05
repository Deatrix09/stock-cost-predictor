import React from 'react';
import { Line } from 'react-chartjs-2';
import { theme } from '../styles/theme';
import { PredictionResponse } from '../types/StockTypes';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface PredictionDashboardProps {
  predictions: PredictionResponse;
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ predictions }) => {
  const chartData = {
    labels: predictions.predictions.map(p => p.date),
    datasets: [
      {
        label: 'Predicted Price',
        data: predictions.predictions.map(p => p.predicted_price),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: false,
      },
      {
        label: 'Confidence Range',
        data: predictions.predictions.map(p => p.upper_bound),
        borderColor: 'rgba(124, 58, 237, 0.2)',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: '+1',
        tension: 0.4,
      },
      {
        label: 'Lower Bound',
        data: predictions.predictions.map(p => p.lower_bound),
        borderColor: 'rgba(124, 58, 237, 0.2)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: 'Price Predictions',
        color: '#fff',
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className={theme.card}>
      <div className={theme.cardHeader}>
        <h2 className={theme.title}>Price Predictions</h2>
        <p className={theme.subtitle}>
          Model Accuracy: {formatPercentage(predictions.model_metrics.accuracy)}
        </p>
      </div>

      <div className={theme.cardContent}>
        {/* Metrics Grid */}
        <div className={theme.grid}>
          <div className={theme.statCard}>
            <span className={theme.statLabel}>Last Known Price</span>
            <div className={theme.statValue}>
              {formatCurrency(predictions.model_metrics.last_known_price)}
            </div>
          </div>
          
          <div className={theme.statCard}>
            <span className={theme.statLabel}>Volatility</span>
            <div className={theme.statValue}>
              {formatPercentage(predictions.model_metrics.volatility)}
            </div>
          </div>
          
          <div className={theme.statCard}>
            <span className={theme.statLabel}>RMSE</span>
            <div className={theme.statValue}>
              {formatCurrency(predictions.model_metrics.rmse)}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-8">
          <div className={theme.chartContainer}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Predictions Table */}
        <div className="mt-8 overflow-x-auto">
          <table className={theme.table}>
            <thead>
              <tr>
                <th className={`${theme.tableHeader} p-4`}>Date</th>
                <th className={`${theme.tableHeader} p-4`}>Price</th>
                <th className={`${theme.tableHeader} p-4`}>Range</th>
                <th className={`${theme.tableHeader} p-4`}>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {predictions.predictions.map((pred) => (
                <tr key={pred.date} className="hover:bg-gray-800/50 transition-colors duration-200">
                  <td className={`${theme.tableCell} p-4`}>{pred.date}</td>
                  <td className={`${theme.tableCell} p-4`}>
                    {formatCurrency(pred.predicted_price)}
                  </td>
                  <td className={`${theme.tableCell} p-4`}>
                    {formatCurrency(pred.lower_bound)} - {formatCurrency(pred.upper_bound)}
                  </td>
                  <td className={`${theme.tableCell} p-4`}>
                    {formatPercentage(pred.confidence)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PredictionDashboard; 