import requests
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def test_stock_data():
    """Test fetching historical stock data"""
    symbol = "AAPL"  # Apple Inc. as an example
    response = requests.get(f"{BASE_URL}/api/stocks/historical/{symbol}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSuccessfully fetched {symbol} historical data:")
        print(pd.DataFrame(data['data']).head())
    else:
        print(f"Error fetching {symbol} data:", response.text)

def test_stock_info():
    """Test fetching stock information"""
    symbol = "MSFT"  # Microsoft as an example
    response = requests.get(f"{BASE_URL}/api/stocks/info/{symbol}")
    
    if response.status_code == 200:
        info = response.json()
        print(f"\n{symbol} Stock Information:")
        print(f"Company Name: {info['info'].get('longName', 'N/A')}")
        print(f"Sector: {info['info'].get('sector', 'N/A')}")
        print(f"Market Cap: {info['info'].get('marketCap', 'N/A')}")
    else:
        print(f"Error fetching {symbol} info:", response.text)

def test_predictions():
    """Test stock price predictions"""
    symbol = "GOOGL"  # Google as an example
    response = requests.get(f"{BASE_URL}/api/predictions/forecast/{symbol}")
    
    if response.status_code == 200:
        predictions = response.json()
        print(f"\n{symbol} Price Predictions:")
        print(f"Forecast Days: {predictions.get('forecast_days', 'N/A')}")
        print(f"Model Type: {predictions.get('model_type', 'N/A')}")
        
        if predictions.get('predictions'):
            print("First 5 predictions:")
            for pred in predictions['predictions'][:5]:
                try:
                    print(
                        f"Date: {pred.get('date', 'N/A')}, "
                        f"Price: {pred.get('predicted_price', 0.0):.2f}, "
                        f"Confidence Interval: "
                        f"[{pred.get('confidence_lower', 0.0):.2f}, "
                        f"{pred.get('confidence_upper', 0.0):.2f}]"
                    )
                except (KeyError, TypeError) as e:
                    print(f"Error formatting prediction: {e}")
        else:
            print("No predictions available")
    else:
        print(f"Error fetching {symbol} predictions:", response.text)

def test_technical_analysis():
    """Test technical analysis"""
    symbol = "NVDA"  # NVIDIA as an example
    response = requests.get(f"{BASE_URL}/api/predictions/technical-analysis/{symbol}")
    
    if response.status_code == 200:
        analysis = response.json()
        print(f"\n{symbol} Technical Analysis:")
        print("\nMoving Averages:")
        for ma_type, value in analysis.get('moving_averages', {}).items():
            print(f"{ma_type}: {value}")
        
        print("\nRSI:")
        rsi_data = analysis.get('rsi', {})
        print(f"Value: {rsi_data.get('value', 'N/A')}")
        print(f"Signal: {rsi_data.get('signal', 'N/A')}")
        
        print("\nMACD:")
        macd_data = analysis.get('macd', {})
        print(f"MACD: {macd_data.get('macd', 'N/A')}")
        print(f"Signal: {macd_data.get('signal', 'N/A')}")
        print(f"Trend: {macd_data.get('trend', 'N/A')}")
        
        print("\nBollinger Bands:")
        bb_data = analysis.get('bollinger_bands', {})
        print(f"Upper: {bb_data.get('upper', 'N/A')}")
        print(f"Middle: {bb_data.get('middle', 'N/A')}")
        print(f"Lower: {bb_data.get('lower', 'N/A')}")
        print(f"Signal: {bb_data.get('signal', 'N/A')}")
    else:
        print(f"Error fetching {symbol} technical analysis:", response.text)

def test_market_analysis():
    """Test comprehensive market analysis"""
    symbol = "AAPL"  # Apple as an example
    response = requests.get(f"{BASE_URL}/api/predictions/market-analysis/{symbol}")
    
    if response.status_code == 200:
        analysis = response.json()
        print(f"\n{symbol} Comprehensive Market Analysis:")
        
        print("\nSummary:")
        summary = analysis.get('summary', {})
        print(f"Technical Outlook: {summary.get('technical_outlook', 'N/A')}")
        print(f"Sentiment Outlook: {summary.get('sentiment_outlook', 'N/A')}")
        print(f"Overall Recommendation: {summary.get('overall_recommendation', 'N/A')}")
        
        print("\nPrice Forecast:")
        forecast = analysis.get('price_forecast', {})
        if forecast and 'predictions' in forecast:
            next_pred = forecast['predictions'][0]
            print(f"Next Day: {next_pred['date']}")
            print(f"Predicted Price: {next_pred['predicted_price']:.2f}")
            print(f"Confidence Interval: [{next_pred['confidence_lower']:.2f}, {next_pred['confidence_upper']:.2f}]")
    else:
        print(f"Error fetching {symbol} market analysis:", response.text)

if __name__ == "__main__":
    print("Testing Stock Price Predictor Backend...")
    
    try:
        test_stock_data()
        test_stock_info()
        test_predictions()
        test_technical_analysis()
        test_market_analysis()
        
        print("\nAll tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to the server. Make sure the FastAPI server is running.")
        print("Run the server with: python -m uvicorn app.main:app --reload")
