# Stock Price Predictor

A modern web application for predicting stock prices using machine learning and deep learning models. Built with FastAPI backend and React frontend.

## Features

- Real-time stock price predictions
- Interactive web interface built with React
- RESTful API powered by FastAPI
- Advanced ML/DL models for price prediction
- Data visualization using Plotly
- Historical stock data analysis using yfinance

## Tech Stack

### Backend
- FastAPI
- Python 3.x
- scikit-learn
- PyTorch
- pandas
- numpy
- yfinance

### Frontend
- React
- Node.js
- Modern JavaScript/TypeScript

## Prerequisites

- Python 3.8 or higher
- Node.js and npm
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Stock-price-predictor.git
   cd Stock-price-predictor
   ```

2. Set up Python virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```bash
   # From the root directory
   uvicorn main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   # From the frontend directory
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Project Structure

```
Stock-price-predictor/
├── app/                    # Backend application code
├── data/                   # Data storage
├── frontend/              # React frontend application
├── tests/                 # Test files
├── main.py               # FastAPI application entry point
├── requirements.txt      # Python dependencies
└── package.json          # Node.js dependencies
```

## API Endpoints

- `GET /api/predictions` - Get stock predictions
- Additional endpoints documented in the FastAPI Swagger UI at `http://localhost:8000/docs`

## Testing

Run the tests using:
```bash
pytest
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.