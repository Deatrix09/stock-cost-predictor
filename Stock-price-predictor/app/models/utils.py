import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import yfinance as yf

def calculate_technical_indicators(data: pd.DataFrame) -> Dict:
    """Calculate various technical indicators"""
    
    def calculate_rsi(data: pd.DataFrame, periods: int = 14) -> np.ndarray:
        close_delta = data['Close'].diff()
        
        # Make two series: one for lower closes and one for higher closes
        up = close_delta.clip(lower=0)
        down = -1 * close_delta.clip(upper=0)
        
        ma_up = up.ewm(com=periods - 1, adjust=True, min_periods=periods).mean()
        ma_down = down.ewm(com=periods - 1, adjust=True, min_periods=periods).mean()
        
        rsi = ma_up / ma_down
        rsi = 100 - (100/(1 + rsi))
        
        return rsi.fillna(0).values

    def calculate_macd(data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        exp1 = data['Close'].ewm(span=12, adjust=False).mean()
        exp2 = data['Close'].ewm(span=26, adjust=False).mean()
        macd = exp1 - exp2
        signal = macd.ewm(span=9, adjust=False).mean()
        return macd.values, signal.values

    def calculate_bollinger_bands(data: pd.DataFrame, window: int = 20) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        rolling_mean = data['Close'].rolling(window=window).mean()
        rolling_std = data['Close'].rolling(window=window).std()
        
        upper_band = rolling_mean + (rolling_std * 2)
        lower_band = rolling_mean - (rolling_std * 2)
        
        return upper_band.values, rolling_mean.values, lower_band.values

    # Calculate indicators
    rsi = calculate_rsi(data)
    macd, macd_signal = calculate_macd(data)
    bb_upper, bb_middle, bb_lower = calculate_bollinger_bands(data)

    return {
        "rsi": rsi[-1],
        "macd": {
            "macd": macd[-1],
            "signal": macd_signal[-1],
            "histogram": macd[-1] - macd_signal[-1]
        },
        "bollinger_bands": {
            "upper": bb_upper[-1],
            "middle": bb_middle[-1],
            "lower": bb_lower[-1]
        }
    }

def fetch_stock_data(symbol: str, period: str = "1y", interval: str = "1d") -> pd.DataFrame:
    """Fetch stock data from Yahoo Finance"""
    try:
        stock = yf.Ticker(symbol)
        data = stock.history(period=period, interval=interval)
        return data
    except Exception as e:
        raise Exception(f"Error fetching data for {symbol}: {str(e)}")

def calculate_volatility(data: pd.DataFrame, window: int = 20) -> float:
    """Calculate stock volatility"""
    returns = np.log(data['Close'] / data['Close'].shift(1))
    return returns.std() * np.sqrt(252)  # Annualized volatility

def calculate_support_resistance(data: pd.DataFrame, window: int = 20) -> Dict[str, float]:
    """Calculate support and resistance levels"""
    rolling_min = data['Low'].rolling(window=window).min()
    rolling_max = data['High'].rolling(window=window).max()
    
    return {
        "support": rolling_min.iloc[-1],
        "resistance": rolling_max.iloc[-1]
    }
