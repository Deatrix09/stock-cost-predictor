import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from pmdarima.arima import auto_arima
from datetime import datetime, timedelta
import pytz
from typing import List

class StockPredictor:
    def __init__(self):
        self.model = None
        self.last_prices = None
        
    def prepare_data(self, historical_data):
        """Prepare the data from API format to DataFrame"""
        # Convert list of dictionaries to DataFrame
        df = pd.DataFrame(historical_data)
        
        # Convert dates to UTC timezone for consistency
        df['date'] = pd.to_datetime(df['date'], utc=True)
        df.set_index('date', inplace=True)
        
        # Sort and resample to daily frequency
        df.sort_index(inplace=True)
        df = df.resample('D').last()  # Resample to daily frequency
        df = df.ffill()  # Forward fill missing values using new method
        
        # We'll use just the closing prices for prediction
        return df['close'].astype(float).to_frame()

    def find_best_parameters(self, data):
        """Find optimal ARIMA parameters"""
        model = auto_arima(data['close'],
                          seasonal=False,
                          trace=False,
                          error_action='ignore',
                          suppress_warnings=True,
                          stepwise=True,
                          max_p=5,
                          max_q=5)
        return model.order

    def train(self, historical_data: List[dict]):
        """Train the ARIMA model"""
        # Extract closing prices and convert to numpy array
        self.last_prices = [record['close'] for record in historical_data]
        
        # Fit ARIMA model
        self.model = ARIMA(self.last_prices, order=(5,1,0))
        self.fitted_model = self.model.fit()

    def predict_next_days(self, days: int) -> List[dict]:
        """Predict stock prices for next n days"""
        if not self.model or not self.last_prices:
            raise ValueError("Model not trained. Call train() first.")

        # Generate forecasts with confidence intervals
        forecast_result = self.fitted_model.get_forecast(steps=days)
        
        # Get mean predictions and confidence intervals
        mean_forecast = forecast_result.predicted_mean
        conf_int = forecast_result.conf_int()
        
        predictions = []
        for i in range(days):
            predictions.append({
                'day': i + 1,
                'predicted_price': round(float(mean_forecast[i]), 2),
                'lower_bound': round(float(conf_int[i][0]), 2),
                'upper_bound': round(float(conf_int[i][1]), 2)
            })
        
        return predictions