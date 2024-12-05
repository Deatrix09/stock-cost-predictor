import React from 'react';
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

  const sortedData = [...data.data].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = {
    labels: sortedData.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Close Price',
        data: sortedData.map(item => item.close),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        tension: 0.4,
        fill: false,
        borderWidth: 1.5,
        pointRadius: 0,
      },
      {
        label: 'Open Price',
        data: sortedData.map(item => item.open),
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
          {data.data.length} historical records
        </p>
      </div>

      <div className={theme.cardContent}>
        {/* Chart */}
        <div className="mt-4 w-full">
          <div className="h-[600px] w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Historical Data Table with Fixed Header */}
        <div className="mt-8">
          <div className="relative overflow-hidden">
            <div className="overflow-x-auto">
              <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
                <table className={`${theme.table} relative`}>
                  <thead className="sticky top-0 z-10 bg-gray-900">
                    <tr>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap`}>Date</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap`}>Open</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap`}>High</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap`}>Low</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap`}>Close</th>
                      <th className={`${theme.tableHeader} p-4 whitespace-nowrap`}>Volume</th>
                    </tr>
                  </thead>
                  <tbody className="relative">
                    {sortedData.map((row, index) => (
                      <tr 
                        key={`${row.date}-${index}`}
                        className="hover:bg-gray-800/50 transition-colors duration-200"
                      >
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap`}>
                          {new Date(row.date).toLocaleDateString()}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap`}>
                          {formatCurrency(row.open)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap`}>
                          {formatCurrency(row.high)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap`}>
                          {formatCurrency(row.low)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap`}>
                          {formatCurrency(row.close)}
                        </td>
                        <td className={`${theme.tableCell} p-4 whitespace-nowrap`}>
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
