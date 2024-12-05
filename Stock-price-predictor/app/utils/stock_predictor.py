import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from sklearn.metrics import mean_squared_error
from datetime import datetime, timedelta
import logging
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class StockPredictor:
    def __init__(self):
        self.model = None
        self.training_data = None
        self.last_known_price = None
        self.volatility = None
        self.last_date = None
        
    def calculate_volatility(self, prices, window=30):
        """Calculate historical volatility with rolling window"""
        returns = np.diff(prices) / prices[:-1]
        rolling_std = pd.Series(returns).rolling(window=min(window, len(returns))).std()
        return float(rolling_std.iloc[-1] * np.sqrt(252))  # Annualized volatility

    def prepare_data(self, historical_data):
        """Prepare and transform the data for ARIMA modeling"""
        try:
            # Convert list of dictionaries to DataFrame
            df = pd.DataFrame(historical_data)
            
            # Print sample of raw data for debugging
            logger.debug(f"Sample date from data: {df['date'].iloc[0]}")
            
            # Convert date strings to datetime
            df['date'] = pd.to_datetime(df['date'].apply(lambda x: x.split('T')[0]))
            
            # Set index and sort
            df = df.set_index('date').sort_index()
            logger.debug(f"Index type after conversion: {type(df.index)}")
            
            # Create continuous date range
            full_range = pd.date_range(start=df.index.min(), end=df.index.max(), freq='B')
            df = df.reindex(full_range)
            
            # Forward fill missing values
            df = df.fillna(method='ffill')
            
            # Store the last date
            self.last_date = df.index[-1]
            
            # Get closing prices
            prices = df['close'].values
            
            # Store the last known price
            self.last_known_price = float(prices[-1])
            
            # Calculate volatility
            self.volatility = self.calculate_volatility(prices)
            
            logger.debug(f"Processed data shape: {prices.shape}")
            return prices, df.index
            
        except Exception as e:
            logger.error(f"Error in prepare_data: {str(e)}")
            raise ValueError(f"Error preparing data: {str(e)}")

    def find_best_parameters(self, data):
        """Find optimal ARIMA parameters"""
        best_aic = float('inf')
        best_params = None
        
        # Define parameter ranges
        p_values = range(0, 3)
        d_values = range(0, 2)
        q_values = range(0, 3)
        
        for p in p_values:
            for d in d_values:
                for q in q_values:
                    try:
                        model = ARIMA(data, order=(p, d, q))
                        results = model.fit()
                        
                        if results.aic < best_aic:
                            best_aic = results.aic
                            best_params = (p, d, q)
                    except:
                        continue
        
        return best_params or (1, 1, 1)

    def train(self, historical_data):
        """Train ARIMA model with historical data"""
        try:
            logger.info("Starting data preparation")
            prices, dates = self.prepare_data(historical_data)
            self.training_data = prices
            
            logger.info("Finding best parameters")
            best_params = self.find_best_parameters(prices)
            logger.info(f"Best ARIMA parameters: {best_params}")
            
            # Fit ARIMA model
            self.model = ARIMA(prices, order=best_params)
            self.model = self.model.fit()
            logger.info("Model training completed")
            
        except Exception as e:
            logger.error(f"Error in train method: {str(e)}")
            raise ValueError(f"Error training model: {str(e)}")

    def predict_next_days(self, days=7):
        """Generate predictions for the next n days"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        try:
            # Get forecast and confidence intervals
            forecast_result = self.model.get_forecast(steps=days)
            forecast_mean = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int()
            
            # Convert to numpy arrays for easier handling
            predictions_array = np.array(forecast_mean)
            confidence_bounds = np.array(conf_int)
            
            # Generate future dates (excluding weekends)
            future_dates = pd.date_range(
                start=self.last_date + timedelta(days=1),
                periods=days,
                freq='B'  # Business days
            )
            
            # Base daily volatility
            base_volatility = self.volatility / np.sqrt(252)
            
            predictions = []
            for i in range(days):
                # Increase volatility with time
                time_factor = 1 + (i * 0.1)  # 10% increase per day
                daily_volatility = base_volatility * time_factor
                
                # Adjust confidence level based on prediction distance
                confidence_level = 0.95 * (1 - (i * 0.02))  # Decreases by 2% per day
                confidence_level = max(0.70, confidence_level)  # Don't go below 70%
                
                # Get base prediction and confidence intervals
                pred = float(predictions_array[i])
                lower = float(confidence_bounds[i][0])
                upper = float(confidence_bounds[i][1])
                
                # Widen the confidence interval based on increasing uncertainty
                interval_width = upper - lower
                interval_expansion = 1 + (i * 0.05)  # 5% wider per day
                lower = pred - (interval_width / 2 * interval_expansion)
                upper = pred + (interval_width / 2 * interval_expansion)
                
                # Add volatility component
                volatility_adjustment = np.random.normal(0, daily_volatility)
                
                # Adjust prediction with volatility while keeping within bounds
                adjusted_pred = pred * (1 + volatility_adjustment)
                final_pred = max(min(adjusted_pred, upper), lower)
                
                predictions.append({
                    'day': i + 1,
                    'date': future_dates[i].strftime('%Y-%m-%d'),
                    'predicted_price': float(final_pred),
                    'lower_bound': float(lower),
                    'upper_bound': float(upper),
                    'confidence': float(confidence_level),
                    'volatility': float(daily_volatility),
                    'prediction_interval': float(upper - lower)
                })
            
            if not predictions:
                raise ValueError("Failed to generate any valid predictions")
            
            logger.info(f"Successfully generated {len(predictions)} predictions")
            return predictions
            
        except Exception as e:
            logger.error(f"Error in predict_next_days: {str(e)}")
            raise ValueError(f"Error generating predictions: {str(e)}")

    def get_model_metrics(self):
        """Return model performance metrics"""
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        try:
            # Get in-sample predictions and residuals
            fitted_values = self.model.fittedvalues
            residuals = self.model.resid
            
            # Calculate error metrics
            mse = mean_squared_error(self.training_data[1:], fitted_values[1:])
            rmse = np.sqrt(mse)
            mae = np.mean(np.abs(residuals))
            
            # Calculate prediction accuracy
            accuracy = 1 - (mae / self.last_known_price)
            
            return {
                'aic': float(self.model.aic),
                'bic': float(self.model.bic),
                'rmse': float(rmse),
                'mae': float(mae),
                'accuracy': float(accuracy),
                'volatility': float(self.volatility),
                'last_known_price': float(self.last_known_price),
                'last_date': self.last_date.strftime('%Y-%m-%d')
            }
            
        except Exception as e:
            logger.error(f"Error in get_model_metrics: {str(e)}")
            raise ValueError(f"Error calculating metrics: {str(e)}")