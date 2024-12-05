import React, { useState } from 'react';
import { theme } from '../styles/theme';
import { Line } from 'react-chartjs-2';
import { HistoricalDataResponse } from '../types/StockTypes';
import { formatCurrency, formatNumber } from '../utils/formatters';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import LoadingIndicator from './LoadingIndicator';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockChartProps {
  data: HistoricalDataResponse;
}

const StockChart: React.FC<StockChartProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <div className={`${theme.card} min-h-[400px] flex items-center justify-center`}>
        <LoadingIndicator size="medium" />
      </div>
    );
  }

  if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <div className={theme.card}>
        <div className={theme.cardContent}>
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-400">No historical data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort data by date in descending order (newest first)
  const sortedData = [...data.data].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const chartData = {
    // For chart, we still want ascending order
    labels: [...sortedData].reverse().map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Close Price',
        data: [...sortedData].reverse().map(item => item.close),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 1.5,
        pointRadius: 0,
      },
      {
        label: 'Open Price',
        data: [...sortedData].reverse().map(item => item.open),
        borderColor: 'rgba(124, 58, 237, 0.2)',
        backgroundColor: 'rgba(124, 58, 237, 0.05)',
        tension: 0.4,
        fill: false,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: `${data.symbol} Historical Data`,
        color: '#fff',
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#fff',
          padding: 10,
          font: {
            size: 11
          }
        },
        beginAtZero: false,
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#fff',
          maxRotation: 45,
          minRotation: 45,
          padding: 10,
          font: {
            size: 11
          }
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    layout: {
      padding: {
        left: 10,
        right: 20,
        top: 0,
        bottom: 10
      }
    },
  };

  return (
    <div className={theme.card}>
      <div className={theme.cardHeader}>
        <h2 className={theme.title}>Historical Price Data</h2>
        <p className={theme.subtitle}>
          {sortedData.length} historical records • {
            new Date(sortedData[0].date).toLocaleDateString()
          } - {
            new Date(sortedData[sortedData.length - 1].date).toLocaleDateString()
          }
        </p>
      </div>

      <div className={theme.cardContent}>
        {/* Chart */}
        <div className="mt-4 w-full">
          <div className="h-[600px] w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Historical Data Table */}
        <div className="mt-8">
          <div className="relative overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                <table className={`${theme.table} relative`}>
                  <thead className="sticky top-0 z-10 bg-gray-900">
                    <tr>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap text-left`}>Date</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap text-right`}>Open</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap text-right`}>High</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap text-right`}>Low</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap text-right`}>Close</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap text-right`}>Volume</th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    {sortedData.map((row, index) => (
                      <tr 
                        key={`${row.date}-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap text-left`}>
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap text-right`}>
                          {formatCurrency(row.open)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap text-right`}>
                          {formatCurrency(row.high)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap text-right`}>
                          {formatCurrency(row.low)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap text-right`}>
                          {formatCurrency(row.close)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap text-right`}>
                          {formatNumber(row.volume)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
