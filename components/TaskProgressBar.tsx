
import React, { useState, useEffect } from 'react';

interface TaskProgressBarProps {
  estimatedDuration: number; // in seconds
  label: string;
  subLabel?: string;
  progressColor?: string;
}

export const TaskProgressBar: React.FC<TaskProgressBarProps> = ({ 
  estimatedDuration, 
  label, 
  subLabel, 
  progressColor = 'bg-orange-600' 
}) => {
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(estimatedDuration);

  useEffect(() => {
    setProgress(0);
    setSecondsLeft(estimatedDuration);

    const intervalMs = 100;
    const totalSteps = (estimatedDuration * 1000) / intervalMs;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      // Cap at 99% so we don't show completion before the actual data arrives
      const nextProgress = Math.min((currentStep / totalSteps) * 100, 99);
      const nextSeconds = Math.max(0, estimatedDuration - (currentStep * intervalMs / 1000));
      
      setProgress(nextProgress);
      setSecondsLeft(Math.ceil(nextSeconds));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [estimatedDuration]);

  return (
    <div className="w-full max-w-md mx-auto py-4 animate-fade-in">
      <div className="flex justify-between items-end mb-2">
        <div>
            <h4 className="text-sm font-bold text-slate-800">{label}</h4>
            {subLabel && <p className="text-xs text-slate-500 mt-0.5">{subLabel}</p>}
        </div>
        <div className="text-right">
            <span className="block text-lg font-bold text-slate-700 leading-none">{secondsLeft}s</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Remaining</span>
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
        <div 
          className={`h-full rounded-full transition-all duration-100 ease-linear ${progressColor}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
