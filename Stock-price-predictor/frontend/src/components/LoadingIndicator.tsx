import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium',
  message = 'Analyzing market data'
}) => {
  const sizes = {
    small: 'w-24',
    medium: 'w-32',
    large: 'w-40'
  };

  // Generate random initial heights for candlesticks
  const initialHeights = Array(8).fill(0).map(() => Math.random() * 50 + 30);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 shadow-xl">
        <div className={`${sizes[size]} flex flex-col items-center gap-4`}>
          {/* Candlestick Chart Animation */}
          <div className="w-full h-16 flex items-end justify-between">
            {initialHeights.map((height, i) => (
              <div 
                key={i}
                className="w-3 bg-purple-600 animate-bounce relative group"
                style={{ 
                  height: `${height}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              >
                {/* Candlestick wicks */}
                <div 
                  className="absolute w-0.5 bg-purple-600 left-1/2 transform -translate-x-1/2"
                  style={{
                    height: '140%',
                    bottom: '100%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Loading Message */}
          <div className="text-purple-400 font-mono text-sm flex flex-col items-center gap-2">
            <div className="flex items-center">
              {message}
              <span className="animate-pulse ml-1">.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
            </div>
            <div className="text-xs text-purple-300 opacity-75">
              This may take a few moments
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;