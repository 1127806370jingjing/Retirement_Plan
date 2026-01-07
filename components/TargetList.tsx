import React, { useEffect, useRef } from 'react';
import { TargetTime } from '../types';
import { formatTimeWithDay } from '../utils/timeUtils';
import { CheckCircle2, CircleDashed, Loader2, Zap, PlayCircle } from 'lucide-react';

interface Props {
  targets: TargetTime[];
  currentOtDurationMinutes: number;
  className?: string;
  embedded?: boolean;
}

export const TargetList: React.FC<Props> = ({ 
    targets, 
    currentOtDurationMinutes, 
    className = "", 
    embedded = false 
}) => {
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Determine active item (first one that hasn't been reached yet)
  const firstPendingIndex = targets.findIndex(t => t.hours * 60 > currentOtDurationMinutes);

  // Auto-scroll effect
  useEffect(() => {
    if (activeItemRef.current) {
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 400); 
      return () => clearTimeout(timer);
    }
  }, [currentOtDurationMinutes]);

  const referenceDate = targets.length > 0 ? new Date(targets[0].targetDate.getTime() - 1800000) : new Date();

  return (
    <div className={`pt-6 ${embedded ? 'pt-0' : 'px-4'} ${className}`}>
      {!embedded && <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">加班时刻表</h2>}
      
      <div className={`flex flex-col gap-3 pb-6`}>
        {targets.map((target, idx) => {
          const isZeroNode = target.hours === 0;
          const isCompleted = currentOtDurationMinutes >= target.hours * 60;
          const isActive = idx === firstPendingIndex;
          
          return (
            <div 
              key={idx} 
              ref={isActive ? activeItemRef : null}
              className={`
                  relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group
                  ${isCompleted 
                    ? 'bg-gray-50 border-transparent opacity-60' 
                    : isActive 
                        ? 'bg-white border-[var(--shadow-color)] shadow-md shadow-[var(--shadow-color)] scale-[1.02] z-10' 
                        : 'bg-white border-gray-100 hover:border-gray-200'
                   }
                   ${isZeroNode && !isCompleted ? 'border-orange-200 bg-orange-50/30' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                 <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${isZeroNode 
                        ? isCompleted ? 'bg-orange-100 text-orange-500' : 'bg-orange-500 text-white shadow-sm'
                        : isCompleted 
                            ? 'bg-green-100 text-green-600' 
                            : isActive 
                                ? 'bg-[var(--primary)] text-white' 
                                : 'bg-gray-100 text-gray-500'
                    }
                 `}>
                   {isZeroNode ? <Zap size={20} strokeWidth={3} /> : `${target.hours}h`}
                 </div>
                 <div className="flex flex-col">
                   <span className={`text-base font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                       {formatTimeWithDay(target.targetDate, referenceDate)}
                   </span>
                   <span className={`text-[10px] font-bold uppercase tracking-wide ${isZeroNode ? 'text-orange-500' : 'text-gray-400'}`}>
                       {isZeroNode ? '计薪启动点 (0.0h)' : '可申报时间点'}
                   </span>
                 </div>
              </div>
              
              <div className="flex items-center gap-2">
                  {isCompleted && (
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isZeroNode ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                          <CheckCircle2 size={12} />
                          {!embedded && <span>已激活</span>}
                      </div>
                  )}
                  {isActive && (
                      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full animate-pulse transition-colors duration-300 ${isZeroNode ? 'bg-orange-100 text-orange-600' : 'bg-[var(--surface-light)] text-[var(--primary)]'}`}>
                          {isZeroNode ? <PlayCircle size={12} /> : <Loader2 size={12} className="animate-spin" />}
                          <span>{isZeroNode ? '等待启动' : '等待达成'}</span>
                      </div>
                  )}
                  {!isCompleted && !isActive && (
                       <div className="text-gray-200">
                          <CircleDashed size={20} />
                       </div>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};