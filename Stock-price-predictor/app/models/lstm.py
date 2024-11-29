import torch
import torch.nn as nn
import numpy as np
from typing import List, Tuple
import pandas as pd

class LSTMModel(nn.Module):
    def __init__(self, input_size: int = 1, hidden_size: int = 50, num_layers: int = 2):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        return out

class StockPredictor:
    def __init__(self, sequence_length: int = 10):
        self.sequence_length = sequence_length
        self.model = LSTMModel()
        self.scaler_mean = None
        self.scaler_std = None
    
    def prepare_data(self, data: np.ndarray) -> Tuple[torch.Tensor, torch.Tensor]:
        """Prepare data for LSTM model"""
        # Normalize data
        self.scaler_mean = np.mean(data)
        self.scaler_std = np.std(data)
        normalized_data = (data - self.scaler_mean) / self.scaler_std
        
        # Create sequences
        X, y = [], []
        for i in range(len(normalized_data) - self.sequence_length):
            X.append(normalized_data[i:(i + self.sequence_length)])
            y.append(normalized_data[i + self.sequence_length])
        
        # Convert to PyTorch tensors
        X = torch.FloatTensor(np.array(X)).reshape(-1, self.sequence_length, 1)
        y = torch.FloatTensor(np.array(y))
        
        return X, y
    
    def train(self, data: np.ndarray, epochs: int = 50, learning_rate: float = 0.01):
        """Train the LSTM model"""
        X, y = self.prepare_data(data)
        
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=learning_rate)
        
        self.model.train()
        for epoch in range(epochs):
            optimizer.zero_grad()
            outputs = self.model(X)
            loss = criterion(outputs.squeeze(), y)
            loss.backward()
            optimizer.step()
            
            if (epoch + 1) % 10 == 0:
                print(f'Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}')
    
    def predict_future(self, data: np.ndarray, days: int = 30) -> List[float]:
        """Predict future stock prices"""
        self.model.eval()
        
        # Use last sequence_length days for initial prediction
        last_sequence = data[-self.sequence_length:]
        normalized_sequence = (last_sequence - self.scaler_mean) / self.scaler_std
        
        predictions = []
        current_sequence = torch.FloatTensor(normalized_sequence).reshape(1, -1, 1)
        
        for _ in range(days):
            with torch.no_grad():
                pred = self.model(current_sequence)
                predictions.append(float(pred.item()))
                
                # Update sequence for next prediction
                current_sequence = torch.cat([
                    current_sequence[:, 1:, :],
                    pred.reshape(1, 1, 1)
                ], dim=1)
        
        # Denormalize predictions
        predictions = np.array(predictions) * self.scaler_std + self.scaler_mean
        return predictions.tolist()
    
    def get_confidence_intervals(self, predictions: List[float], data: np.ndarray, confidence: float = 0.95) -> Tuple[List[float], List[float]]:
        """Calculate confidence intervals for predictions"""
        z_score = 1.96  # 95% confidence interval
        
        # Calculate prediction standard error
        std_dev = np.std(data)
        prediction_std = std_dev * np.sqrt(1 + 1/len(data))
        
        lower_bounds = []
        upper_bounds = []
        
        for pred in predictions:
            lower_bounds.append(pred - z_score * prediction_std)
            upper_bounds.append(pred + z_score * prediction_std)
        
        return lower_bounds, upper_bounds
