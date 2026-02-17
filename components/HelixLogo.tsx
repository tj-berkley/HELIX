import React from 'react';

interface HelixLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'light';
}

const HelixLogo: React.FC<HelixLogoProps> = ({ size = 40, className = '', animated = false, variant = 'default' }) => {
  const isLight = variant === 'light';

  return (
    <svg
      width={size}
      height={size * 0.67}
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'animate-spin-slow' : ''}`}
      style={{
        animationDuration: animated ? '6s' : undefined,
        transformOrigin: 'center'
      }}
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
        <filter id={`glow-${variant}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#glow-${variant})`}>
        {/* Infinity Symbol - Main Strand 1 (Top/Outer) */}
        <path
          d="M 30 40 C 30 25, 20 20, 10 30 C 0 40, 10 50, 20 50 C 30 50, 40 40, 50 40 C 60 40, 70 50, 80 50 C 90 50, 100 40, 90 30 C 80 20, 70 25, 70 40"
          stroke={`url(#helixGradient1-${variant})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={animated ? "5, 5" : undefined}
          fill="none"
        >
          {animated && (
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="200"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* Infinity Symbol - Main Strand 2 (Bottom/Inner) */}
        <path
          d="M 30 40 C 30 55, 20 60, 10 50 C 0 40, 10 30, 20 30 C 30 30, 40 40, 50 40 C 60 40, 70 30, 80 30 C 90 30, 100 40, 90 50 C 80 60, 70 55, 70 40"
          stroke={`url(#helixGradient2-${variant})`}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={animated ? "5, 5" : undefined}
          fill="none"
        >
          {animated && (
            <animate
              attributeName="stroke-dashoffset"
              from="200"
              to="0"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </path>

        {/* DNA Base Pairs connecting the strands - Left Loop */}
        <g opacity="0.7">
          {/* Left loop connections */}
          <line x1="15" y1="30" x2="15" y2="50" stroke={isLight ? "#ffffff" : "#4F46E5"} strokeWidth="1.5" opacity="0.6">
            {animated && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />}
          </line>
          <circle cx="15" cy="30" r="2" fill={isLight ? "#ffffff" : "#4F46E5"}>
            {animated && <animate attributeName="r" values="2;2.5;2" dur="2s" repeatCount="indefinite" />}
          </circle>
          <circle cx="15" cy="50" r="2" fill={isLight ? "#dbeafe" : "#06B6D4"}>
            {animated && <animate attributeName="r" values="2;2.5;2" dur="2s" repeatCount="indefinite" begin="0.5s" />}
          </circle>

          <line x1="22" y1="28" x2="22" y2="52" stroke={isLight ? "#f3f4f6" : "#7C3AED"} strokeWidth="1.5" opacity="0.5">
            {animated && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" begin="0.3s" />}
          </line>
          <circle cx="22" cy="28" r="1.5" fill={isLight ? "#f3f4f6" : "#5B21B6"}>
            {animated && <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite" begin="0.3s" />}
          </circle>
          <circle cx="22" cy="52" r="1.5" fill={isLight ? "#dbeafe" : "#3B82F6"}>
            {animated && <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite" begin="0.8s" />}
          </circle>
        </g>

        {/* Center connection */}
        <g opacity="0.7">
          <line x1="50" y1="36" x2="50" y2="44" stroke={isLight ? "#ffffff" : "#4F46E5"} strokeWidth="2" opacity="0.7">
            {animated && <animate attributeName="opacity" values="0.5;0.9;0.5" dur="1.5s" repeatCount="indefinite" />}
          </line>
          <circle cx="50" cy="36" r="2.5" fill={isLight ? "#ffffff" : "#4F46E5"}>
            {animated && <animate attributeName="r" values="2.5;3;2.5" dur="1.5s" repeatCount="indefinite" />}
          </circle>
          <circle cx="50" cy="44" r="2.5" fill={isLight ? "#dbeafe" : "#06B6D4"}>
            {animated && <animate attributeName="r" values="2.5;3;2.5" dur="1.5s" repeatCount="indefinite" begin="0.5s" />}
          </circle>
        </g>

        {/* DNA Base Pairs - Right Loop */}
        <g opacity="0.7">
          <line x1="85" y1="30" x2="85" y2="50" stroke={isLight ? "#ffffff" : "#4F46E5"} strokeWidth="1.5" opacity="0.6">
            {animated && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" begin="0.7s" />}
          </line>
          <circle cx="85" cy="30" r="2" fill={isLight ? "#ffffff" : "#7C3AED"}>
            {animated && <animate attributeName="r" values="2;2.5;2" dur="2s" repeatCount="indefinite" begin="0.7s" />}
          </circle>
          <circle cx="85" cy="50" r="2" fill={isLight ? "#dbeafe" : "#3B82F6"}>
            {animated && <animate attributeName="r" values="2;2.5;2" dur="2s" repeatCount="indefinite" begin="1.2s" />}
          </circle>

          <line x1="78" y1="28" x2="78" y2="52" stroke={isLight ? "#f3f4f6" : "#7C3AED"} strokeWidth="1.5" opacity="0.5">
            {animated && <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" begin="1s" />}
          </line>
          <circle cx="78" cy="28" r="1.5" fill={isLight ? "#f3f4f6" : "#5B21B6"}>
            {animated && <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite" begin="1s" />}
          </circle>
          <circle cx="78" cy="52" r="1.5" fill={isLight ? "#dbeafe" : "#06B6D4"}>
            {animated && <animate attributeName="r" values="1.5;2;1.5" dur="2s" repeatCount="indefinite" begin="1.5s" />}
          </circle>
        </g>
      </g>
    </svg>
  );
};

export default HelixLogo;
