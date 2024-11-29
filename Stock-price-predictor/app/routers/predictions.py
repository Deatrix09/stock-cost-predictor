from fastapi import APIRouter, HTTPException
from typing import Optional
import yfinance as yf
from datetime import datetime

router = APIRouter()

@router.get("/stock/{symbol}")
async def get_stock_data(symbol: str, period: Optional[str] = "1y"):
    """
    Get basic stock data including historical prices and company info
    """
    try:
        # Fetch data
        stock = yf.Ticker(symbol)
        hist_data = stock.history(period=period)
        
        if hist_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol {symbol}")
        
        # Get basic info
        info = stock.info
        
        # Format historical data
        historical = []
        for index, row in hist_data.iterrows():
            historical.append({
                "date": index.strftime("%Y-%m-%d"),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": float(row["Volume"])
            })
        
        # Format response
        return {
            "symbol": symbol,
            "company_name": info.get("longName", symbol),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A"),
            "market_cap": info.get("marketCap", 0),
            "current_price": info.get("currentPrice", hist_data["Close"].iloc[-1]),
            "currency": info.get("currency", "USD"),
            "historical_data": historical
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
