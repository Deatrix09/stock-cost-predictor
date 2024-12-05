import React, { useState } from 'react';
import { theme } from '../styles/theme';
import { CompanyInfoProps } from '../types/StockTypes';
import { formatNumber, formatCurrency } from '../utils/formatters';
import { 
  Language, 
  LocationOn, 
  People, 
  ExpandMore,
  Business,
  Phone,
  TrendingUp,
} from '@mui/icons-material';

const CompanyInfo: React.FC<CompanyInfoProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value);
  };

  const renderLogo = () => {
    if (!data.info.logoUrl || logoError) {
      // Fallback to symbol letter if no logo or logo failed to load
      return (
        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center text-2xl font-bold">
          {data.symbol[0]}
        </div>
      );
    }

    return (
      <img
        src={data.info.logoUrl}
        alt={`${data.info.shortName} logo`}
        className="w-16 h-16 rounded-lg object-contain bg-white p-2"
        onError={() => setLogoError(true)}
      />
    );
  };

  return (
    <div className={theme.card}>
      <div className={theme.cardHeader}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {renderLogo()}
            <div>
              <h2 className={theme.title}>{data.info.longName}</h2>
              <p className={theme.subtitle}>{data.info.sector} | {data.info.industry}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(data.info.currentPrice)}
            </div>
            <div className="text-purple-400 text-sm">
              Market Cap: {formatMarketCap(data.info.marketCap)}
            </div>
          </div>
        </div>
      </div>

      <div className={theme.cardContent}>
        {/* Quick Stats */}
        <div className={theme.grid}>
          <div className={theme.statCard}>
            <div className="flex items-center space-x-2">
              <People className="text-purple-400" />
              <span className={theme.statLabel}>Employees</span>
            </div>
            <div className={theme.statValue}>
              {formatNumber(data.info.fullTimeEmployees)}
            </div>
          </div>

          <div className={theme.statCard}>
            <div className="flex items-center space-x-2">
              <LocationOn className="text-purple-400" />
              <span className={theme.statLabel}>Location</span>
            </div>
            <div className={theme.statValue}>
              {data.info.city}, {data.info.state}
            </div>
          </div>

          <div className={theme.statCard}>
            <div className="flex items-center space-x-2">
              <Phone className="text-purple-400" />
              <span className={theme.statLabel}>Contact</span>
            </div>
            <div className={theme.statValue}>
              {data.info.phone}
            </div>
          </div>
        </div>

        {/* Company Website */}
        <div className="mt-6">
          <a 
            href={data.info.website}
            target="_blank"
            rel="noopener noreferrer"
            className={`${theme.statCard} block hover:bg-purple-600/20`}
          >
            <div className="flex items-center space-x-2">
              <Language className="text-purple-400" />
              <span className="text-purple-400 hover:text-purple-300">
                {data.info.website}
              </span>
            </div>
          </a>
        </div>

        {/* Company Leadership */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Leadership Team</h3>
            <button 
              onClick={() => setExpanded(!expanded)}
              className={theme.iconButton}
            >
              <ExpandMore 
                className="transform transition-transform duration-300"
                style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}
              />
            </button>
          </div>

          <div className={`grid gap-4 ${expanded ? 'grid-cols-1 md:grid-cols-2' : 'hidden'}`}>
            {data.info.companyOfficers.map((officer, index) => (
              <div key={index} className={theme.statCard}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600/30 rounded-full flex items-center justify-center">
                    {officer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-white">{officer.name}</div>
                    <div className="text-gray-400 text-sm">{officer.title}</div>
                    {officer.totalPay && (
                      <div className="text-green-400 text-sm">
                        {formatCurrency(officer.totalPay)} / year
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Description */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-white mb-4">About {data.info.shortName}</h3>
          <div className={`${theme.statCard} !bg-gray-800/20`}>
            <p className="text-gray-300 leading-relaxed">
              {data.info.longBusinessSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
