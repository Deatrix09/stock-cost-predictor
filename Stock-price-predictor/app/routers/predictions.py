from fastapi import APIRouter, HTTPException
from typing import Optional, List
from ..utils.stock_predictor import StockPredictor
from ..routers.stocks import get_historical_data
from pydantic import BaseModel

router = APIRouter()
predictor = StockPredictor()

class PredictionResponse(BaseModel):
    symbol: str
    predictions: List[dict]
    model_type: str = "ARIMA"
    forecast_days: int
    training_period: str
    data_points_used: int

@router.get("/forecast/{symbol}")
async def get_stock_forecast(
    symbol: str, 
    days: Optional[int] = 7,
    history_period: Optional[str] = "5y",
    interval: Optional[str] = "1d"
):
    """Get stock price predictions for the next n days"""
    try:
        # Get historical data using the existing endpoint function
        stock_data = await get_historical_data(
            symbol,
            period=history_period,
            interval=interval
        )
        historical_data = stock_data.get('data', [])
        
        # Ensure minimum data requirements (252 trading days ≈ 1 year)
        if len(historical_data) < 252:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient historical data. Got {len(historical_data)} days, need at least 252 days."
            )

        # Train model and make predictions
        predictor.train(historical_data)
        predictions = predictor.predict_next_days(days=days)
        
        return PredictionResponse(
            symbol=symbol,
            predictions=predictions,
            forecast_days=days,
            training_period=history_period,
            data_points_used=len(historical_data)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
