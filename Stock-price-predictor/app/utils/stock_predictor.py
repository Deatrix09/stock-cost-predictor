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
        """
        Calculate historical volatility using multiple methods and combine them
        Based on research from: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1502915
        """
        try:
            # Calculate returns
            returns = np.diff(prices) / prices[:-1]
            
            # 1. Historical rolling volatility
            rolling_std = pd.Series(returns).rolling(window=min(window, len(returns))).std()
            hist_vol = float(rolling_std.iloc[-1] * np.sqrt(252))
            
            # 2. EWMA volatility (RiskMetrics approach)
            lambda_param = 0.94  # RiskMetrics standard
            weights = np.array([(1 - lambda_param) * lambda_param**i for i in range(len(returns))])
            weights = weights[::-1]  # Reverse to give more weight to recent observations
            weights = weights / weights.sum()
            ewma_vol = np.sqrt(np.sum(weights * returns**2) * 252)
            
            # 3. Parkinson volatility (using high-low range)
            if hasattr(self, 'high_low_data'):
                high_prices = self.high_low_data['high'][-window:]
                low_prices = self.high_low_data['low'][-window:]
                log_hl = np.log(high_prices / low_prices)
                park_vol = np.sqrt(1 / (4 * np.log(2)) * np.mean(log_hl**2) * 252)
            else:
                park_vol = hist_vol
            
            # Combine volatilities with weights
            combined_vol = (0.4 * hist_vol + 0.4 * ewma_vol + 0.2 * park_vol)
            
            return combined_vol
            
        except Exception as e:
            logger.error(f"Error calculating volatility: {str(e)}")
            return None

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
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        try:
            # Get forecast and confidence intervals
            forecast_result = self.model.get_forecast(steps=days)
            forecast_mean = forecast_result.predicted_mean
            conf_int = forecast_result.conf_int(alpha=0.05)  # 95% confidence interval
            
            # Calculate prediction intervals using sophisticated method
            residuals = self.model.resid
            rmse = np.sqrt(np.mean(residuals**2))
            
            # Calculate degrees of freedom
            n = len(self.training_data)
            k = sum(self.model.specification.ar_lags) + sum(self.model.specification.ma_lags) + 1
            dof = n - k
            
            predictions = []
            for i in range(days):
                pred = max(0.01, float(forecast_mean[i]))
                
                # Time-varying forecast standard error
                # Based on: https://stats.stackexchange.com/questions/431467/arima-forecast-confidence-intervals
                h = i + 1  # forecast horizon
                forecast_std = rmse * np.sqrt(1 + h/n + (h * (h-1))/(2 * n))
                
                # Calculate t-statistic for confidence interval
                from scipy import stats
                t_value = stats.t.ppf(0.975, dof)
                
                # Calculate uncertainty components
                model_uncertainty = t_value * forecast_std
                market_uncertainty = pred * self.volatility * np.sqrt(h/252)
                
                # Combine uncertainties
                total_uncertainty = np.sqrt(model_uncertainty**2 + market_uncertainty**2)
                
                # Calculate bounds
                lower = max(0.01, pred - total_uncertainty)
                upper = pred + total_uncertainty
                
                # Calculate dynamic confidence score
                confidence_factors = [
                    0.95 * np.exp(-h/252),  # Time decay (annualized)
                    1 - (forecast_std/pred),  # Model accuracy
                    stats.norm.cdf(-abs(residuals.mean())/residuals.std()),  # Residual normality
                    1 - min(1, self.volatility/0.5),  # Volatility penalty
                    1 - (total_uncertainty/pred)  # Relative uncertainty
                ]
                
                # Weight factors based on importance
                weights = [0.3, 0.25, 0.15, 0.15, 0.15]
                confidence_level = max(0.70, min(0.95,
                    sum(f * w for f, w in zip(confidence_factors, weights))
                ))
                
                predictions.append({
                    'date': forecast_result.row_labels[i].strftime('%Y-%m-%d'),
                    'predicted_price': float(pred),
                    'lower_bound': float(lower),
                    'upper_bound': float(upper),
                    'confidence': float(confidence_level),
                    'volatility': float(self.volatility),
                    'prediction_interval': f"{float(lower):.2f} - {float(upper):.2f}"
                })
            
            # Calculate model accuracy instead of confidence
            accuracy = float(1 - rmse/np.mean(self.training_data))
            
            return {
                'predictions': predictions,
                'model_metrics': {
                    'accuracy': accuracy,  # Use this as the main metric in header
                    'rmse': float(rmse),
                    'volatility': float(self.volatility),
                    'last_known_price': float(self.last_known_price)
                }
            }
            
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