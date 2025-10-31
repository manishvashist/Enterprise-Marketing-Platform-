import React from 'react';
import { Sparkline } from './Sparkline';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';

interface AnalyticsCardProps {
    kpiName: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
    history: number[];
}

const formatValue = (kpi: string, value: number): string => {
    if (kpi.toLowerCase().includes('rate')) {
        return `${value.toFixed(2)}%`;
    }
    if (kpi.toLowerCase().includes('value')) {
        return `$${value.toFixed(2)}`;
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ kpiName, value, trend, history }) => {
    const TrendIcon = () => {
        if (trend === 'up') return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
        if (trend === 'down') return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
        return null;
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-gray-300">{kpiName}</p>
                <div className="w-24 h-10 -mt-2 -mr-2">
                    <Sparkline data={history} trend={trend} />
                </div>
            </div>
            <div className="flex items-baseline mt-2">
                <p className="text-2xl font-bold text-white">{formatValue(kpiName, value)}</p>
                <div className="ml-2 flex items-center">
                    <TrendIcon />
                </div>
            </div>
        </div>
    );
};