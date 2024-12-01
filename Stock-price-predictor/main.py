from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

app = FastAPI(
    title="Stock Price Predictor",
    description="An advanced stock price prediction application using machine learning",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Import routers after app creation
from app.routers import stocks, predictions

# Include routers
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Stock Price Predictor API",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
