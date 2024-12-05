import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium' | 'large';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = 'medium' }) => {
  const sizes = {
    small: 'w-24',
    medium: 'w-32',
    large: 'w-40'
  };

  return (
    <div className={`${sizes[size]} flex flex-col items-center gap-4`}>
      {/* Candlestick Chart Animation */}
      <div className="w-full h-16 flex items-end justify-between">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="w-3 bg-purple-600 animate-bounce"
            style={{ 
              height: `${Math.random() * 50 + 30}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>

      {/* Loading Text */}
      <div className="text-purple-400 font-mono text-sm flex items-center gap-1">
        Processing
        <span className="animate-pulse">.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
      </div>
    </div>
  );
};

export default LoadingIndicator; 