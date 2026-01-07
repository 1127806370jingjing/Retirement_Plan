import React from 'react';
import { CalculationResult, OtSuggestion } from '../types';
import { Clock, CheckCircle2, AlertTriangle, BatteryCharging, ArrowRight } from 'lucide-react';
import { formatTimeWithDay } from '../utils/timeUtils';

interface Props {
  result: CalculationResult;
  currentTime: Date;
  suggestion: OtSuggestion;
}

export const StatusDashboard: React.FC<Props> = ({ result, currentTime, suggestion }) => {
  const getSuggestionStyle = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-orange-500 text-white shadow-orange-200';
      case 'optimal': return 'bg-green-500 text-white shadow-green-200';
      case 'waiting': return 'bg-white text-gray-600 border border-gray-100';
      default: return 'text-white shadow-lg shadow-[var(--shadow-color)] bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)]';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
        case 'urgent': return <AlertTriangle className="animate-pulse" />;
        case 'optimal': return <CheckCircle2 />;
        default: return <Clock />;
    }
  };

  return (
    <div className="px-4 grid grid-cols-2 gap-4 pb-4">
      <div className={`col-span-2 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between min-h-[140px] transition-all duration-500 ${getSuggestionStyle(suggestion.type)}`}>
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-full ${suggestion.type === 'waiting' ? 'bg-gray-100' : 'bg-white/20'}`}>
                {getIcon(suggestion.type)}
            </div>
            {suggestion.actionText && (
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide ${suggestion.type === 'waiting' ? 'bg-gray-100 text-gray-500' : 'bg-white text-black'}`}>
                    {suggestion.actionText}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-xl font-bold mb-1 leading-tight">{suggestion.title}</h3>
            <p className={`text-sm leading-relaxed ${suggestion.type === 'waiting' ? 'text-gray-500' : 'text-white/90'}`}>
                {suggestion.description}
            </p>
        </div>
      </div>

      <div className="col-span-1 bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">有效时长</p>
        <div className="flex items-baseline gap-0.5">
            <span className="text-5xl font-bold text-gray-900 tracking-tighter">
                {result.validOtHours}
            </span>
            <span className="text-sm text-gray-400 font-medium">h</span>
        </div>
      </div>

      <div className="col-span-1 bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-center text-gray-400 mb-2">
             <span className="text-[10px] font-bold uppercase tracking-wider">下一节点</span>
             <BatteryCharging size={16} />
        </div>
        
        <div>
             {result.validOtHours < 8 ? (
                 <>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-800">
                            {result.validOtHours < 1.0 ? '1.0' : `+0.5`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold mt-1 w-fit px-2 py-0.5 rounded-md text-[var(--primary)] bg-[var(--surface-light)] transition-colors duration-300">
                        {(() => {
                           let target;
                           // If not yet 1h, next is 1h milestone
                           if (result.validOtHours < 1.0) {
                             target = new Date(result.otStartTime.getTime() + 60 * 60000);
                           } else {
                             // Already past 1h, next is next 30m block
                             const nextMinutes = (result.validOtUnits + 1) * 30;
                             target = new Date(result.otStartTime.getTime() + nextMinutes * 60000);
                           }
                           
                           const timeString = formatTimeWithDay(target, result.scheduledEndTime);
                           
                           return (
                               <>
                                 <span className="whitespace-nowrap">{timeString}</span>
                                 <ArrowRight size={8} />
                                 <span className="whitespace-nowrap">解锁</span>
                               </>
                           )
                        })()}
                    </div>
                 </>
             ) : (
                 <div className="text-gray-400 text-xs">已达最大统计值</div>
             )}
        </div>
      </div>
    </div>
  );
};