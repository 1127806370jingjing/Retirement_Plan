import React from 'react';
import { Home, List, Settings, Coffee } from 'lucide-react';
import { AppTheme } from '../types';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentTheme: AppTheme;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange, currentTheme }) => {
  // On desktop, we might not need 'schedule' as a separate tab if it's embedded in home
  // But keeping it accessible as a full view is also fine.
  const tabs = [
    { id: 'home', label: '首页仪表盘', icon: Home },
    { id: 'schedule', label: '完整时刻表', icon: List },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-100 sticky top-0 left-0 z-50">
      {/* Logo Area */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-lg shadow-[var(--shadow-color)] transition-colors duration-500">
            <Coffee size={20} strokeWidth={3} />
        </div>
        <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">快乐助手</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overtime Calc</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-4 w-full px-4 py-4 rounded-2xl transition-all duration-300 group ${
                isActive 
                ? 'bg-[var(--surface-light)] text-[var(--primary)] font-bold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / Theme Indicator */}
      <div className="p-6">
        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-400 mb-2 font-medium">当前主题</p>
            <div className="flex items-center gap-2">
                <div 
                    className="w-4 h-4 rounded-full"
                    style={{ background: `linear-gradient(135deg, ${currentTheme.colors.gradientFrom}, ${currentTheme.colors.gradientTo})` }}
                ></div>
                <span className="text-xs font-bold text-gray-700">{currentTheme.name}</span>
            </div>
        </div>
      </div>
    </div>
  );
};