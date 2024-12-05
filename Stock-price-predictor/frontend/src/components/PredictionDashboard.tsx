import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { theme } from '../styles/theme';
import { PredictionResponse } from '../types/StockTypes';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { InfoOutlined } from '@mui/icons-material';
import LoadingIndicator from './LoadingIndicator';

interface MetricTooltip {
    id: string;
    isVisible: boolean;
}

interface PredictionDashboardProps {
    predictions: PredictionResponse;
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ predictions }) => {
    const [activeTooltip, setActiveTooltip] = useState<MetricTooltip | null>(null);
    const [loading, setLoading] = useState(false);

    const tooltipDescriptions = {
        accuracy: "Model accuracy represents how well the predictions match actual historical data. Higher percentages indicate better performance.",
        volatility: "A measure of price fluctuation. Higher volatility indicates larger price swings and potentially higher risk.",
        rmse: "Root Mean Square Error - Measures the average prediction error. Lower values indicate more accurate predictions.",
        lastPrice: "The most recent known stock price used as a baseline for predictions.",
        confidence: "Confidence level indicates how certain the model is about its predictions. Higher values suggest more reliable predictions.",
        predictionInterval: "The range between upper and lower bounds where the actual price is expected to fall.",
    };

    const formatMetric = (value: number, tooltipKey: string): string => {
        switch (tooltipKey) {
            case 'volatility':
            case 'confidence':
                return formatPercentage(value);
            case 'lastPrice':
            case 'rmse':
            case 'predictionInterval':
                return formatCurrency(value);
            default:
                return value.toString();
        }
    };

    const renderMetricWithTooltip = (
        label: string,
        value: string | number,
        tooltipKey: keyof typeof tooltipDescriptions
    ) => (
        <div className="flex items-center justify-between px-2 py-2">
            <span className={theme.statLabel}>{label}</span>
            <div className={`${theme.statValue} mr-4 mb-1.5`}>
                {typeof value === 'number' ? formatMetric(value, tooltipKey) : value}
            </div>
            <div className="relative">
                <InfoOutlined
                    className={theme.infoIcon}
                    onMouseEnter={() => setActiveTooltip({ id: tooltipKey, isVisible: true })}
                    onMouseLeave={() => setActiveTooltip(null)}
                />
                {activeTooltip?.id === tooltipKey && (
                    <div className={`${theme.tooltip} absolute -top-24 -left-32`}>
                        {tooltipDescriptions[tooltipKey]}
                    </div>
                )}
            </div>
        </div>
    );

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

    // Calculate average confidence from all predictions
    const averageConfidence = predictions.predictions.reduce(
        (sum, pred) => sum + pred.confidence,
        0
    ) / predictions.predictions.length;

    if (loading) {
        return (
            <div className={`${theme.card} min-h-[400px] flex items-center justify-center`}>
                <LoadingIndicator size="medium" />
            </div>
        );
    }

    return (
        <div className={theme.card}>
            <div className={theme.cardHeader}>
                <h2 className={theme.title}>Price Predictions</h2>

            </div>

            <div className={theme.cardContent}>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={theme.statCard}>
                        {renderMetricWithTooltip(
                            'Last Known Price',
                            predictions.model_metrics.last_known_price,
                            'lastPrice'
                        )}
                    </div>

                    <div className={theme.statCard}>
                        {renderMetricWithTooltip(
                            'Volatility',
                            predictions.model_metrics.volatility,
                            'volatility'
                        )}
                    </div>

                    <div className={theme.statCard}>
                        {renderMetricWithTooltip(
                            'RMSE',
                            predictions.model_metrics.rmse,
                            'rmse'
                        )}
                    </div>

                    <div className={theme.statCard}>
                        {renderMetricWithTooltip(
                            'Confidence Level',
                            averageConfidence,  // Use first prediction's confidence
                            'confidence'
                        )}
                    </div>
                </div>

                {/* Chart */}
                <div className="mt-8">
                    <div className={theme.chartContainer}>
                        <Line data={{
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
                            ]
                        }} options={chartOptions} />
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
                                <tr key={pred.date}>
                                    <td className={`${theme.tableCell} p-4`}>{pred.date}</td>
                                    <td className={`${theme.tableCell} p-4`}>
                                        {formatCurrency(pred.predicted_price)}
                                    </td>
                                    <td className={`${theme.tableCell} p-4`}>
                                        {pred.prediction_interval}
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