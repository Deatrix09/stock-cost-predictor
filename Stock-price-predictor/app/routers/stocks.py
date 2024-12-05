from fastapi import APIRouter, HTTPException
import yfinance as yf
from typing import List, Optional
from datetime import datetime, timedelta
import requests

router = APIRouter()

def get_logo_url(symbol: str) -> str:
    """Get company logo URL using multiple sources"""
    try:
        # Try multiple sources for logos
        sources = [
            f"https://logo.clearbit.com/{yf.Ticker(symbol).info.get('website', '').replace('http://', '').replace('https://', '').split('/')[0]}",
            f"https://storage.googleapis.com/iex/api/logos/{symbol.lower()}.png",
            f"https://companieslogo.com/img/orig/{symbol}.D-93b0e5e0.png",
            f"https://companiesmarketcap.com/img/company-logos/64/{symbol}.png"
        ]
        
        # Return the first working URL
        for url in sources:
            try:
                response = requests.head(url, timeout=2)
                if response.status_code == 200:
                    return url
            except:
                continue
                
        return None
    except:
        return None

@router.get("/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    period: Optional[str] = "1y",
    interval: Optional[str] = "1d"
):
    """Get historical stock data for a given symbol"""
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period, interval=interval)
        
        # Reset index to make date a column and sort by date
        hist = hist.reset_index()
        hist = hist.sort_values('Date', ascending=True)
        
        formatted_data = []
        for _, row in hist.iterrows():
            try:
                record = {
                    'date': row['Date'].strftime('%Y-%m-%d'),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']),
                }
                formatted_data.append(record)
            except Exception as e:
                print(f"Error formatting record: {row}, Error: {str(e)}")
                continue
        
        if not formatted_data:
            raise HTTPException(status_code=500, detail="Failed to format any records")
            
        return {
            "symbol": symbol.upper(),
            "data": formatted_data
        }
            
    except Exception as e:
        print(f"Error fetching historical data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/info/{symbol}")
async def get_stock_info(symbol: str):
    """
    Get basic information about a stock
    """
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        
        # Add logo URL to the response
        info['logoUrl'] = get_logo_url(symbol)
        
        return {
            "symbol": symbol.upper(),
            "info": info
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

