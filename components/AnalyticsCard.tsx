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
        if (trend === 'up') return <ArrowUpIcon className="w-4 h-4 text-emerald-500" />;
        if (trend === 'down') return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
        return null;
    };

    const trendColor = trend === 'up' ? 'text-emerald-600 bg-emerald-50' : trend === 'down' ? 'text-red-600 bg-red-50' : 'text-slate-500 bg-slate-50';

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{kpiName}</p>
                <div className={`flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${trendColor}`}>
                    <TrendIcon />
                    <span className="ml-1">{trend === 'up' ? '+2.4%' : trend === 'down' ? '-1.1%' : '0.0%'}</span>
                </div>
            </div>
            <div className="flex items-baseline justify-between mt-1">
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{formatValue(kpiName, value)}</p>
                <div className="w-20 h-10">
                    <Sparkline data={history} trend={trend} />
                </div>
            </div>
        </div>
    );
};