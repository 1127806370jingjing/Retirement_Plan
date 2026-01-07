import React, { useEffect, useState } from 'react';
import { formatTime, formatTimeWithDay, getTimeDifferenceInMinutes } from '../utils/timeUtils';
import { CalculationResult, WorkTimeConfig } from '../types';

interface Props {
  config: WorkTimeConfig;
  result: CalculationResult;
  currentTime: Date;
}

export const VisualExplainer: React.FC<Props> = ({ config, result, currentTime }) => {
  const [mode, setMode] = useState<'day' | 'ot'>('day');

  useEffect(() => {
    if (currentTime >= result.scheduledEndTime) {
      setMode('ot');
    } else {
      setMode('day');
    }
  }, [currentTime, result.scheduledEndTime]);

  return (
    <div className="px-4 pb-6">
       <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 overflow-hidden relative min-h-[160px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2 z-10 relative">
                <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${mode === 'ot' ? 'bg-[var(--primary)] animate-pulse' : 'bg-gray-300'}`}></span>
                {mode === 'day' ? '今日全貌' : '加班聚焦 (1h 起报)'}
            </h3>
      
            <div className="relative h-28 w-full select-none">
                <div className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${mode === 'day' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                    <DayTimeline config={config} result={result} currentTime={currentTime} />
                </div>
                <div className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${mode === 'ot' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
                    <OtTimeline config={config} result={result} currentTime={currentTime} />
                </div>
            </div>

            <div className="mt-2 pt-4 border-t border-gray-50 text-xs text-gray-400 transition-opacity duration-500">
                <p className="leading-relaxed">
                   {mode === 'day' 
                    ? '应下班后有 30分钟缓冲期。缓冲期满后正式开始计薪，但首笔申报需满 1小时。'
                    : '聚焦模式：已为您锁定当前窗口。第一个高亮圆点即为 1.0h 申报门槛。'
                   }
                </p>
            </div>
        </div>
    </div>
  );
};

const DayTimeline: React.FC<Props> = ({ config, result, currentTime }) => {
    const startTimeMs = result.scheduledEndTime.getTime() - (9.5 * 60 * 60000); 
    const endTimeMs = result.otStartTime.getTime() + (2 * 60 * 60000); 
    const totalRange = endTimeMs - startTimeMs;
  
    const getPos = (date: Date) => {
      const val = ((date.getTime() - startTimeMs) / totalRange) * 100;
      return Math.max(0, Math.min(100, val));
    };
  
    const currentPos = getPos(currentTime);

    return (
        <div className="relative h-full w-full">
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-100 rounded-full -translate-y-1/2 overflow-hidden">
                <div className="h-full bg-gray-300 transition-all duration-1000 ease-linear" style={{ width: `${currentPos}%` }}/>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: '0%' }}>
                <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
                <div className="absolute top-5 left-0 text-[10px] text-gray-400 whitespace-nowrap">
                    上班 {config.startTime}
                </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${getPos(result.scheduledEndTime)}%` }}>
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 bg-[var(--primary)]"></div>
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-[10px] font-bold whitespace-nowrap text-[var(--primary)]">{formatTime(result.scheduledEndTime)}</div>
                    <div className="text-[9px] text-gray-400 whitespace-nowrap">应下班</div>
                </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${getPos(result.otStartTime)}%` }}>
                <div className="w-3 h-3 bg-orange-400 rounded-full border-2 border-white shadow-sm z-10"></div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-[9px] text-orange-500 font-bold whitespace-nowrap">开始计薪</div>
                </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${getPos(new Date(result.otStartTime.getTime() + 60*60000))}%` }}>
                <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 bg-green-500"></div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-center">
                    <div className="text-[9px] text-green-600 font-bold whitespace-nowrap">1.0h 起报</div>
                </div>
            </div>
        </div>
    );
};

const OtTimeline: React.FC<Props> = ({ result, currentTime }) => {
    const windowMinutes = 60; 
    const halfWindow = windowMinutes / 2;
    const milestones = [];
    // Only show 1.0h, 1.5h...
    for (let i = 2; i <= 16; i++) {
        const hours = i * 0.5;
        const time = new Date(result.otStartTime.getTime() + (hours * 60 * 60000));
        milestones.push({ hours, time });
    }

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gray-100 rounded-full -translate-y-1/2" 
                 style={{ maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)' }}>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                <div className="w-1 h-8 rounded-full bg-[var(--primary)] shadow-sm"></div>
                <div className="mt-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]">
                    当前
                </div>
            </div>
            {milestones.map((m, idx) => {
                const diffMin = getTimeDifferenceInMinutes(m.time, currentTime);
                if (diffMin < -halfWindow || diffMin > halfWindow) return null;
                const posPercent = 50 + (diffMin / halfWindow) * 50;
                const isPassed = diffMin < 0;
                return (
                    <div key={idx} className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear" style={{ left: `${posPercent}%` }}>
                        <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${m.hours === 1.0 ? 'bg-green-500 scale-125' : isPassed ? 'bg-green-500/50' : 'bg-gray-300'}`}></div>
                        <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                            <span className={`text-[10px] font-bold whitespace-nowrap ${isPassed ? 'text-gray-400' : 'text-gray-600'}`}>
                                {m.hours === 1.0 ? '申报起报点' : `+${m.hours}h`}
                            </span>
                            <span className="text-[9px] text-gray-400 whitespace-nowrap font-mono">
                                {formatTimeWithDay(m.time, result.scheduledEndTime)}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};