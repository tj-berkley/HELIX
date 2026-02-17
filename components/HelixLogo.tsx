import React from 'react';

interface HelixLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'light';
}

const HelixLogo: React.FC<HelixLogoProps> = ({ size = 40, className = '', animated = false, variant = 'default' }) => {
  const twistAnimation = animated ? 'animate-spin-slow' : '';
  const isLight = variant === 'light';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${twistAnimation}`}
      style={{ animationDuration: animated ? '8s' : undefined }}
    >
      <defs>
        <linearGradient id={`helixGradient1-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: isLight ? '#ffffff' : '#4F46E5', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: isLight ? '#e0e7ff' : '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id={`helixGradient2-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: isLight ? '#ffffff' : '#06B6D4', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: isLight ? '#dbeafe' : '#3B82F6', stopOpacity: 1 }} />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill={`url(#helixGradient1-${variant})`} opacity={isLight ? "0.2" : "0.1"} />

      {/* DNA Helix Structure */}
      <g filter="url(#glow)">
        {/* Left Strand */}
        <path
          d="M 30 10 Q 20 25 30 40 Q 40 55 30 70 Q 20 85 30 100"
          stroke={`url(#helixGradient1-${variant})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Strand */}
        <path
          d="M 70 10 Q 80 25 70 40 Q 60 55 70 70 Q 80 85 70 100"
          stroke={`url(#helixGradient2-${variant})`}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Connecting Base Pairs */}
        {/* Top */}
        <line x1="30" y1="10" x2="70" y2="10" stroke={isLight ? "#ffffff" : "#4F46E5"} strokeWidth="2" opacity="0.6" />
        <circle cx="30" cy="10" r="3" fill={isLight ? "#ffffff" : "#4F46E5"} />
        <circle cx="70" cy="10" r="3" fill={isLight ? "#dbeafe" : "#06B6D4"} />

        {/* Upper-Mid */}
        <line x1="32" y1="25" x2="68" y2="25" stroke={isLight ? "#f3f4f6" : "#5B21B6"} strokeWidth="2" opacity="0.5" />
        <circle cx="32" cy="25" r="2.5" fill={isLight ? "#f3f4f6" : "#5B21B6"} />
        <circle cx="68" cy="25" r="2.5" fill={isLight ? "#dbeafe" : "#3B82F6"} />

        {/* Middle-Upper */}
        <line x1="30" y1="40" x2="70" y2="40" stroke={isLight ? "#ffffff" : "#7C3AED"} strokeWidth="2" opacity="0.6" />
        <circle cx="30" cy="40" r="3" fill={isLight ? "#ffffff" : "#7C3AED"} />
        <circle cx="70" cy="40" r="3" fill={isLight ? "#dbeafe" : "#3B82F6"} />

        {/* Center */}
        <line x1="35" y1="55" x2="65" y2="55" stroke={isLight ? "#f3f4f6" : "#4F46E5"} strokeWidth="2" opacity="0.5" />
        <circle cx="35" cy="55" r="2.5" fill={isLight ? "#f3f4f6" : "#4F46E5"} />
        <circle cx="65" cy="55" r="2.5" fill={isLight ? "#dbeafe" : "#06B6D4"} />

        {/* Middle-Lower */}
        <line x1="30" y1="70" x2="70" y2="70" stroke={isLight ? "#ffffff" : "#5B21B6"} strokeWidth="2" opacity="0.6" />
        <circle cx="30" cy="70" r="3" fill={isLight ? "#ffffff" : "#5B21B6"} />
        <circle cx="70" cy="70" r="3" fill={isLight ? "#dbeafe" : "#3B82F6"} />

        {/* Lower-Mid */}
        <line x1="32" y1="85" x2="68" y2="85" stroke={isLight ? "#f3f4f6" : "#7C3AED"} strokeWidth="2" opacity="0.5" />
        <circle cx="32" cy="85" r="2.5" fill={isLight ? "#f3f4f6" : "#7C3AED"} />
        <circle cx="68" cy="85" r="2.5" fill={isLight ? "#dbeafe" : "#06B6D4"} />

        {/* Bottom */}
        <line x1="30" y1="100" x2="70" y2="100" stroke={isLight ? "#ffffff" : "#4F46E5"} strokeWidth="2" opacity="0.6" />
        <circle cx="30" cy="100" r="3" fill={isLight ? "#ffffff" : "#4F46E5"} />
        <circle cx="70" cy="100" r="3" fill={isLight ? "#dbeafe" : "#3B82F6"} />
      </g>

      {/* Center Glow Effect */}
      <circle cx="50" cy="50" r="20" fill={`url(#helixGradient1-${variant})`} opacity={isLight ? "0.25" : "0.15"} />
    </svg>
  );
};

export default HelixLogo;
