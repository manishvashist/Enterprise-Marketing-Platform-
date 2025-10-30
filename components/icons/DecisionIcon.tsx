
import React from 'react';

export const DecisionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" transform="rotate(-45 12 12) translate(-1.5, -5)" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4M18 12h2M12 18v2M6 12H4" transform="rotate(-45 12 12) translate(-1.5, -5)" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12 L20 4 M12 12 L4 20" transform="rotate(45 12 12) translate(0,-2)" />
  </svg>
);
