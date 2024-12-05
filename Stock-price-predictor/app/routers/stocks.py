from fastapi import APIRouter, HTTPException
import yfinance as yf
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()

def get_logo_url(symbol: str) -> str:
    """Get company logo URL"""
    try:
        # Using clearbit API for logos (free tier available)
        domain = yf.Ticker(symbol).info.get('website', '').replace('http://', '').replace('https://', '').split('/')[0]
        if domain:
            return f"https://logo.clearbit.com/{domain}"
        return None
    except:
        return None

@router.get("/historical/{symbol}")
async def get_historical_data(
    symbol: str,
    period: Optional[str] = "5y",
    interval: Optional[str] = "1d"
):
    """
    Get historical stock data for a given symbol
    """
    try:
        print(f"Fetching historical data for {symbol}")
        stock = yf.Ticker(symbol)
        hist = stock.history(period=period, interval=interval)
        
        if hist.empty:
            print(f"No historical data found for {symbol}")
            raise HTTPException(status_code=404, detail=f"No historical data found for {symbol}")
        
        print(f"Got {len(hist)} records for {symbol}")
        
        # Format all records
        formatted_data = []
        for date, row in hist.iterrows():
            try:
                record = {
                    'date': date.isoformat() if isinstance(date, datetime) else str(date),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'close': float(row['Close']),
                    'volume': int(row['Volume']),
                    'dividends': float(row['Dividends']) if 'Dividends' in row else 0,
                    'stockSplits': float(row['Stock Splits']) if 'Stock Splits' in row else 0
                }
                formatted_data.append(record)
            except Exception as e:
                print(f"Error formatting record: {row}, Error: {str(e)}")
                continue
        
        if not formatted_data:
            raise HTTPException(status_code=500, detail="Failed to format any records")
            
        return {
            "symbol": symbol,
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

