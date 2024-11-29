import React from 'react';
import { CompanyInfoProps } from '../types/StockTypes';

const formatMarketCap = (marketCap: number): string => {
  if (!marketCap) return 'N/A';
  
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  }
  return `$${marketCap.toFixed(2)}`;
};

const formatPrice = (price: number, currency: string = 'USD'): string => {
  if (!price) return 'N/A';
  return `${price.toFixed(2)} ${currency}`;
};

const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return 'N/A';
  return num.toLocaleString();
};

const CompanyInfo: React.FC<CompanyInfoProps> = ({ data }) => {
  const { info } = data;
  
  return (
    <div className="relative bg-gray-900 rounded-xl shadow-xl backdrop-blur-sm backdrop-filter overflow-hidden p-6">
      <div className="absolute inset-0 bg-purple-500 opacity-5 blur-3xl"></div>
      <div className="relative z-10">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-100">{info?.longName || info?.shortName || data.symbol}</h2>
          <p className="text-lg text-gray-400">{data.symbol}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Sector</h3>
              <p className="mt-1 text-lg font-semibold text-gray-100">{info?.sector || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Industry</h3>
              <p className="mt-1 text-lg font-semibold text-gray-100">{info?.industry || 'N/A'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Employees</h3>
              <p className="mt-1 text-lg font-semibold text-gray-100">
                {formatNumber(info?.fullTimeEmployees)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Market Cap</h3>
              <p className="mt-1 text-lg font-semibold text-gray-100">
                {info?.marketCap ? formatMarketCap(info.marketCap) : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Current Price</h3>
              <p className="mt-1 text-lg font-semibold text-gray-100">
                {info?.currentPrice ? formatPrice(info.currentPrice, info?.currency) : 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Website</h3>
              {info?.website ? (
                <a
                  href={info.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-lg font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-200"
                >
                  {info.website}
                </a>
              ) : (
                <p className="mt-1 text-lg font-semibold text-gray-100">N/A</p>
              )}
            </div>
          </div>
        </div>

        {info?.longBusinessSummary && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-100 mb-2">Company Description</h3>
            <p className="text-gray-300 leading-relaxed">{info.longBusinessSummary}</p>
          </div>
        )}

        {(info?.address1 || info?.city || info?.state || info?.zip || info?.country) && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-100 mb-2">Location</h3>
            <p className="text-gray-300">
              {info.address1 && <>{info.address1}<br /></>}
              {(info.city || info.state || info.zip) && (
                <>{[info.city, info.state, info.zip].filter(Boolean).join(', ')}<br /></>
              )}
              {info.country && <>{info.country}<br /></>}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInfo;
