import numpy as np
import pandas as pd
from typing import Dict, List, Optional

class TechnicalAnalyzer:
    def __init__(self, data: pd.DataFrame):
        self.data = data
        self.results = {}

    def calculate_all(self) -> Dict:
        """Calculate all technical indicators"""
        self.calculate_moving_averages()
        self.calculate_rsi()
        self.calculate_macd()
        self.calculate_bollinger_bands()
        self.calculate_support_resistance()
        self.identify_patterns()
        return self.results

    def calculate_moving_averages(self, periods: List[int] = [20, 50, 200]) -> None:
        """Calculate multiple moving averages"""
        mas = {}
        for period in periods:
            mas[f'MA{period}'] = self.data['Close'].rolling(window=period).mean().iloc[-1]
        
        # Calculate MA crossovers
        if len(periods) > 1:
            periods.sort()
            for i in range(len(periods)-1):
                short_ma = self.data['Close'].rolling(window=periods[i]).mean()
                long_ma = self.data['Close'].rolling(window=periods[i+1]).mean()
                crossover = 'bullish' if short_ma.iloc[-1] > long_ma.iloc[-1] else 'bearish'
                mas[f'MA{periods[i]}/{periods[i+1]}_crossover'] = crossover

        self.results['moving_averages'] = mas

    def calculate_rsi(self, period: int = 14) -> None:
        """Calculate Relative Strength Index"""
        delta = self.data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        self.results['rsi'] = {
            'value': rsi.iloc[-1],
            'signal': 'oversold' if rsi.iloc[-1] < 30 else 'overbought' if rsi.iloc[-1] > 70 else 'neutral'
        }

    def calculate_macd(self, fast: int = 12, slow: int = 26, signal: int = 9) -> None:
        """Calculate MACD (Moving Average Convergence Divergence)"""
        exp1 = self.data['Close'].ewm(span=fast, adjust=False).mean()
        exp2 = self.data['Close'].ewm(span=slow, adjust=False).mean()
        macd = exp1 - exp2
        signal_line = macd.ewm(span=signal, adjust=False).mean()
        
        self.results['macd'] = {
            'macd': macd.iloc[-1],
            'signal': signal_line.iloc[-1],
            'histogram': macd.iloc[-1] - signal_line.iloc[-1],
            'trend': 'bullish' if macd.iloc[-1] > signal_line.iloc[-1] else 'bearish'
        }

    def calculate_bollinger_bands(self, period: int = 20, std_dev: int = 2) -> None:
        """Calculate Bollinger Bands"""
        rolling_mean = self.data['Close'].rolling(window=period).mean()
        rolling_std = self.data['Close'].rolling(window=period).std()
        
        upper_band = rolling_mean + (rolling_std * std_dev)
        lower_band = rolling_mean - (rolling_std * std_dev)
        
        current_price = self.data['Close'].iloc[-1]
        position = (current_price - lower_band.iloc[-1]) / (upper_band.iloc[-1] - lower_band.iloc[-1])
        
        self.results['bollinger_bands'] = {
            'upper': upper_band.iloc[-1],
            'middle': rolling_mean.iloc[-1],
            'lower': lower_band.iloc[-1],
            'position': position,
            'signal': 'overbought' if position > 1 else 'oversold' if position < 0 else 'neutral'
        }

    def calculate_support_resistance(self, window: int = 20) -> None:
        """Calculate Support and Resistance levels using local minima/maxima"""
        data_window = self.data.tail(window)
        
        resistance = data_window['High'].max()
        support = data_window['Low'].min()
        
        # Calculate intermediate levels
        range_size = resistance - support
        levels = [
            support,
            support + range_size * 0.382,  # Fibonacci level
            support + range_size * 0.618,  # Fibonacci level
            resistance
        ]
        
        self.results['support_resistance'] = {
            'support': support,
            'resistance': resistance,
            'levels': levels
        }

    def identify_patterns(self, window: int = 5) -> None:
        """Identify common candlestick patterns"""
        patterns = []
        data_window = self.data.tail(window)
        
        # Doji pattern
        body_sizes = abs(data_window['Close'] - data_window['Open'])
        wick_sizes = data_window['High'] - data_window['Low']
        if body_sizes.iloc[-1] < 0.1 * wick_sizes.iloc[-1]:
            patterns.append('doji')
        
        # Hammer pattern
        if (data_window['Low'].iloc[-1] < data_window['Open'].iloc[-1] and 
            data_window['Low'].iloc[-1] < data_window['Close'].iloc[-1] and
            (data_window['High'].iloc[-1] - max(data_window['Open'].iloc[-1], data_window['Close'].iloc[-1])) < 
            (min(data_window['Open'].iloc[-1], data_window['Close'].iloc[-1]) - data_window['Low'].iloc[-1]) * 0.3):
            patterns.append('hammer')
        
        # Trend analysis
        short_trend = 'uptrend' if data_window['Close'].iloc[-1] > data_window['Close'].iloc[0] else 'downtrend'
        
        self.results['patterns'] = {
            'identified_patterns': patterns,
            'short_term_trend': short_trend
        }
