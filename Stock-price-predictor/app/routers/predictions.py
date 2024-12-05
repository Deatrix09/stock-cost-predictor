from fastapi import APIRouter, HTTPException, status
from typing import Optional, List, Dict, Any
from ..utils.stock_predictor import StockPredictor
from ..routers.stocks import get_historical_data
from pydantic import BaseModel, Field
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class PredictionItem(BaseModel):
    day: int
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float
    confidence: float
    volatility: float

class ModelMetrics(BaseModel):
    aic: float
    bic: float
    rmse: float
    mae: float
    accuracy: float
    volatility: float
    last_known_price: float
    last_date: str

class PredictionResponse(BaseModel):
    symbol: str
    predictions: List[PredictionItem]
    model_type: str = "ARIMA"
    forecast_days: int
    training_period: str
    data_points_used: int
    model_metrics: ModelMetrics
    last_updated: str = Field(default_factory=lambda: datetime.now().isoformat())

@router.get("/forecast/{symbol}", response_model=PredictionResponse)
async def get_stock_forecast(
    symbol: str, 
    days: Optional[int] = 7,
    history_period: Optional[str] = "5y",
    interval: Optional[str] = "1d"
):
    """
    Get stock price predictions for the next n days using ARIMA
    
    Parameters:
    - symbol: Stock symbol (e.g., AAPL, TSLA)
    - days: Number of days to forecast (1-365)
    - history_period: Historical data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
    - interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
    """
    try:
        # Input validation
        if days <= 0 or days > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forecast days must be between 1 and 365"
            )

        logger.info(f"Fetching historical data for {symbol}")
        stock_data = await get_historical_data(
            symbol,
            period=history_period,
            interval=interval
        )
        
        if not stock_data or 'data' not in stock_data:
            logger.error(f"No historical data found for {symbol}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No historical data found for symbol {symbol}"
            )
            
        historical_data = stock_data.get('data', [])
        
        # Ensure sufficient historical data
        if len(historical_data) < 252:
            logger.warning(f"Insufficient historical data for {symbol}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient historical data. Got {len(historical_data)} days, need at least 252 days."
            )

        # Initialize and train predictor
        try:
            logger.info(f"Training model for {symbol}")
            predictor = StockPredictor()
            predictor.train(historical_data)
        except Exception as e:
            logger.error(f"Error training model for {symbol}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error training prediction model: {str(e)}"
            )
        
        # Generate predictions
        try:
            logger.info(f"Generating predictions for {symbol}")
            predictions = predictor.predict_next_days(days=days)
        except Exception as e:
            logger.error(f"Error generating predictions for {symbol}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating predictions: {str(e)}"
            )
        
        # Get model metrics
        try:
            logger.info(f"Calculating model metrics for {symbol}")
            model_metrics = predictor.get_model_metrics()
        except Exception as e:
            logger.error(f"Error getting model metrics for {symbol}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error getting model metrics: {str(e)}"
            )
        
        response = PredictionResponse(
            symbol=symbol.upper(),
            predictions=predictions,
            forecast_days=days,
            training_period=history_period,
            data_points_used=len(historical_data),
            model_metrics=model_metrics
        )
        
        logger.info(f"Successfully generated forecast for {symbol}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_stock_forecast for {symbol}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )
