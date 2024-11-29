import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from "@mui/material";
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
import { Line } from 'react-chartjs-2';
import { HistoricalDataResponse } from '../types/StockTypes';

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
  console.log('Raw data sample:', data?.data?.[0]); // Debug log

  if (!data?.data || !Array.isArray(data.data) || data.data.length === 0) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
          <Typography color="text.secondary">No data available</Typography>
        </CardContent>
      </Card>
    );
  }

  // Use the correct property names as they come from the API
  const normalizedData = data.data.map(item => {
    console.log('Raw item:', item);
    return {
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
      dividends: item.dividends,
      stockSplits: item.stockSplits
    };
  });

  // Add debug log
  console.log('First normalized item:', normalizedData[0]);

  const sortedData = [...normalizedData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    console.log('Comparing dates:', { a: a.date, b: b.date, dateA, dateB });
    return dateB.getTime() - dateA.getTime();
  });

  console.log('First sorted item:', sortedData[0]);

  const formatDate = (dateStr: string) => {
    try {
      console.log('Formatting date string:', dateStr);
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.log('Invalid date string:', dateStr);
        return 'Invalid Date';
      }
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined || price === null) return 'N/A';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? 'N/A' : `$${numPrice.toFixed(2)}`;
  };

  const formatVolume = (volume: number | string | undefined) => {
    if (volume === undefined || volume === null) return 'N/A';
    const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;
    return isNaN(numVolume) ? 'N/A' : numVolume.toLocaleString();
  };

  const formatDividend = (dividend: number | string | undefined) => {
    if (dividend === undefined || dividend === null) return '$0.0000';
    const numDividend = typeof dividend === 'string' ? parseFloat(dividend) : dividend;
    return isNaN(numDividend) ? '$0.0000' : `$${numDividend.toFixed(4)}`;
  };

  const formatSplit = (split: number | string | undefined) => {
    if (split === undefined || split === null) return '0';
    const numSplit = typeof split === 'string' ? parseFloat(split) : split;
    return isNaN(numSplit) ? '0' : numSplit.toString();
  };

  return (
    <Card>
      <CardHeader
        title={`${data.symbol} Historical Data`}
        subheader={`${sortedData.length} records`}
      />
      <CardContent>
        <div style={{ marginBottom: '2rem', height: '400px' }}>
          <Line
            data={{
              labels: sortedData.map(item => formatDate(item.date)),
              datasets: [
                {
                  label: 'Close Price',
                  data: sortedData.map(item => item.close),
                  borderColor: 'rgb(75, 192, 192)',
                  backgroundColor: 'rgba(75, 192, 192, 0.5)',
                  tension: 0.1
                },
                {
                  label: 'Open Price',
                  data: sortedData.map(item => item.open),
                  borderColor: 'rgb(255, 99, 132)',
                  backgroundColor: 'rgba(255, 99, 132, 0.5)',
                  tension: 0.1
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false,
              },
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: `${data.symbol.toUpperCase()} Stock Price History`,
                },
              },
              scales: {
                y: {
                  type: 'linear' as const,
                  display: true,
                  position: 'left' as const,
                  title: {
                    display: true,
                    text: 'Price ($)'
                  }
                },
                x: {
                  reverse: true,  // Display newest dates on the right
                  title: {
                    display: true,
                    text: 'Date'
                  }
                }
              },
            }}
          />
        </div>

        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Open</TableCell>
                <TableCell align="right">High</TableCell>
                <TableCell align="right">Low</TableCell>
                <TableCell align="right">Close</TableCell>
                <TableCell align="right">Volume</TableCell>
                <TableCell align="right">Dividends</TableCell>
                <TableCell align="right">Stock Splits</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((row, index) => (
                <TableRow key={`${row.date}-${index}`}>
                  <TableCell component="th" scope="row">
                    {formatDate(row.date)}
                  </TableCell>
                  <TableCell align="right">{formatPrice(row.open)}</TableCell>
                  <TableCell align="right">{formatPrice(row.high)}</TableCell>
                  <TableCell align="right">{formatPrice(row.low)}</TableCell>
                  <TableCell align="right">{formatPrice(row.close)}</TableCell>
                  <TableCell align="right">{formatVolume(row.volume)}</TableCell>
                  <TableCell align="right">{formatDividend(row.dividends)}</TableCell>
                  <TableCell align="right">{formatSplit(row.stockSplits)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default StockChart;
