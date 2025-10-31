import React, { useState, useEffect } from 'react';
import { AnalyticsCard } from './AnalyticsCard';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface AnalyticsDashboardProps {
    kpis: string[];
}

interface KpiData {
    value: number;
    previous: number;
    history: number[];
}

const HISTORY_LENGTH = 20; // Number of data points for the sparkline

const getInitialValue = (kpi: string): number => {
    if (kpi.toLowerCase().includes('rate')) return Math.random() * 20 + 5; // e.g., Open Rate ~5-25%
    if (kpi.toLowerCase().includes('value')) return Math.random() * 50 + 20; // e.g., Avg Order Value ~$20-70
    return Math.random() * 1000 + 100; // Generic metric
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ kpis }) => {
    const [data, setData] = useState<Record<string, KpiData>>({});

    // Initialize state when KPIs change
    useEffect(() => {
        const initialState: Record<string, KpiData> = {};
        kpis.forEach(kpi => {
            const initialValue = getInitialValue(kpi);
            initialState[kpi] = {
                value: initialValue,
                previous: initialValue,
                history: Array(HISTORY_LENGTH).fill(initialValue),
            };
        });
        setData(initialState);
    }, [kpis]);

    // Simulate real-time data updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prevData => {
                const newData: Record<string, KpiData> = {};
                Object.keys(prevData).forEach(kpi => {
                    const oldData = prevData[kpi];
                    const change = (Math.random() - 0.45) * (oldData.value * 0.05); // +/- up to 5% change
                    const newValue = Math.max(0, oldData.value + change);
                    const newHistory = [...oldData.history.slice(1), newValue];

                    newData[kpi] = {
                        value: newValue,
                        previous: oldData.value,
                        history: newHistory,
                    };
                });
                return newData;
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    if (kpis.length === 0) return null;

    return (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600/50">
            <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-white">Real-Time Campaign Analytics</h3>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {kpis.map(kpi => {
                            const kpiData = data[kpi];
                            if (!kpiData) return null;

                            const trend = kpiData.value > kpiData.previous ? 'up' : kpiData.value < kpiData.previous ? 'down' : 'stable';
                            
                            return (
                                <AnalyticsCard
                                    key={kpi}
                                    kpiName={kpi}
                                    value={kpiData.value}
                                    trend={trend}
                                    history={kpiData.history}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};