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

const HISTORY_LENGTH = 20; 

const getInitialValue = (kpi: string): number => {
    if (kpi.toLowerCase().includes('rate')) return Math.random() * 20 + 5;
    if (kpi.toLowerCase().includes('value')) return Math.random() * 50 + 20; 
    return Math.random() * 1000 + 100; 
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ kpis }) => {
    const [data, setData] = useState<Record<string, KpiData>>({});

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

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prevData => {
                const newData: Record<string, KpiData> = {};
                Object.keys(prevData).forEach(kpi => {
                    const oldData = prevData[kpi];
                    const change = (Math.random() - 0.45) * (oldData.value * 0.05);
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
        }, 3000); 

        return () => clearInterval(interval);
    }, []);

    if (kpis.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200 shadow-sm">
            <div className="flex items-start space-x-6">
                <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                    <ChartBarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-xl text-slate-900">Real-Time Campaign Analytics</h3>
                    <p className="text-slate-500 text-sm mt-1 mb-6">Live performance tracking based on simulated engagement data.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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