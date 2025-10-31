import React from 'react';

interface SparklineProps {
  data: number[];
  trend: 'up' | 'down' | 'stable';
}

export const Sparkline: React.FC<SparklineProps> = ({ data, trend }) => {
  const width = 100;
  const height = 40;
  const strokeWidth = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * (height - strokeWidth * 2) + strokeWidth;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  const strokeColor = trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : '#9ca3af';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};