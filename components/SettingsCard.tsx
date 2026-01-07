import React from 'react';
import { Clock, ChevronRight, Palette } from 'lucide-react';
import { AppTheme } from '../types';

interface Props {
  startTime: string;
  onTimeChange: (time: string) => void;
  themes: AppTheme[];
  currentTheme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

export const SettingsCard: React.FC<Props> = ({ 
  startTime, 
  onTimeChange,
  themes,
  currentTheme,
  onThemeChange: setAppTheme
}) => {
  return (
    <div className="px-4 pt-6 md:px-0 md:pt-0 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2 md:px-0">设置</h2>
      
      {/* Time Settings */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        <div className="p-4 flex items-center justify-between border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center bg-[var(--primary)] transition-colors duration-300">
              <Clock size={18} />
            </div>
            <span className="text-base font-medium text-gray-900">签到时间</span>
          </div>
          
          <div className="relative">
            <input 
                type="time" 
                value={startTime}
                onChange={(e) => onTimeChange(e.target.value)}
                className="text-lg text-gray-500 bg-transparent text-right focus:outline-none focus:text-[var(--primary)] transition-colors font-medium"
            />
          </div>
        </div>

        <div className="p-4 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-400 text-white flex items-center justify-center">
              <span className="text-xs font-bold">1.5</span>
            </div>
            <span className="text-base font-medium text-gray-900">午休时长 (小时)</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <span>固定</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 md:px-0">快速预设</h3>
        <div className="grid grid-cols-3 gap-3">
            {['09:00', '09:30', '10:00'].map(t => (
                <button 
                key={t}
                onClick={() => onTimeChange(t)}
                className={`py-3 rounded-xl text-sm font-bold transition-all border ${
                    startTime === t 
                    ? 'text-white border-[var(--primary)] bg-[var(--primary)] shadow-md shadow-[var(--shadow-color)]' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
                >
                    {t}
                </button>
            ))}
        </div>
      </div>

      {/* Theme Settings */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2 md:px-0">主题外观</h3>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg text-white flex items-center justify-center bg-[var(--primary)] transition-colors duration-300">
                        <Palette size={18} />
                    </div>
                    <span className="text-base font-medium text-gray-900">个性化配色</span>
                </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
                {themes.map((t) => {
                    const isActive = currentTheme.id === t.id;
                    return (
                        <button 
                            key={t.id}
                            onClick={() => setAppTheme(t)}
                            className={`relative group flex flex-col items-center gap-2 transition-all duration-300 ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100 hover:scale-105'}`}
                        >
                            <div 
                                className={`w-10 h-10 rounded-full shadow-sm transition-all duration-300 ${isActive ? 'ring-2 ring-offset-2 ring-[var(--primary)]' : ''}`}
                                style={{ background: `linear-gradient(135deg, ${t.colors.gradientFrom}, ${t.colors.gradientTo})` }}
                            ></div>
                            <span className={`text-[10px] font-medium ${isActive ? 'text-[var(--primary)]' : 'text-gray-400'}`}>
                                {t.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-400 leading-relaxed">
        根据当前规则：<br/>
        早班 09:00 - 18:30 (含1.5h午休)<br/>
        晚班 10:00 - 19:30 (含1.5h午休)<br/>
        下班后 +30min 缓冲期不计薪
      </p>
    </div>
  );
};