import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusDashboard } from './components/StatusDashboard';
import { VisualExplainer } from './components/VisualExplainer';
import { TargetList } from './components/TargetList';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { SettingsCard } from './components/SettingsCard';
import { calculateOvertime, generateTargets, getOtSuggestion } from './utils/timeUtils';
import { WorkTimeConfig, AppTheme } from './types';

const DEFAULT_CONFIG: WorkTimeConfig = {
  startTime: '09:00',
  lunchDurationMinutes: 90,
  workDurationHours: 8,
  bufferMinutes: 30,
};

const THEMES: AppTheme[] = [
  { 
    id: 'indigo', 
    name: '深邃蓝', 
    colors: { primary: '#4f46e5', gradientFrom: '#6366f1', gradientTo: '#4338ca', surfaceLight: '#eef2ff', shadow: '#c7d2fe' } 
  },
  { 
    id: 'ocean', 
    name: '深海', 
    colors: { primary: '#0284c7', gradientFrom: '#0ea5e9', gradientTo: '#2563eb', surfaceLight: '#f0f9ff', shadow: '#bae6fd' } 
  },
  { 
    id: 'sunset', 
    name: '日落', 
    colors: { primary: '#ea580c', gradientFrom: '#f97316', gradientTo: '#db2777', surfaceLight: '#fff7ed', shadow: '#fed7aa' } 
  },
  { 
    id: 'forest', 
    name: '森林', 
    colors: { primary: '#059669', gradientFrom: '#10b981', gradientTo: '#047857', surfaceLight: '#ecfdf5', shadow: '#a7f3d0' } 
  },
  { 
    id: 'aurora', 
    name: '极光', 
    colors: { primary: '#7c3aed', gradientFrom: '#8b5cf6', gradientTo: '#c026d3', surfaceLight: '#f5f3ff', shadow: '#ddd6fe' } 
  },
];

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [startTime, setStartTime] = useState<string>(DEFAULT_CONFIG.startTime);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(THEMES[0]);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);

  const config = { ...DEFAULT_CONFIG, startTime };
  const result = calculateOvertime(config, currentTime);
  const suggestion = getOtSuggestion(result, currentTime);
  const targets = generateTargets(result.otStartTime);

  const themeStyles = {
    '--primary': currentTheme.colors.primary,
    '--gradient-from': currentTheme.colors.gradientFrom,
    '--gradient-to': currentTheme.colors.gradientTo,
    '--surface-light': currentTheme.colors.surfaceLight,
    '--shadow-color': currentTheme.colors.shadow,
  } as React.CSSProperties;

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 pb-20 md:pb-0">
             {/* Left Column: Dashboard & Visuals */}
             <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-2 md:gap-6">
                 <Header />
                 <StatusDashboard 
                     result={result} 
                     currentTime={currentTime} 
                     suggestion={suggestion}
                 />
                 <VisualExplainer config={config} result={result} currentTime={currentTime} />
             </div>

             {/* Right Column: Schedule (Desktop Only) */}
             <div className="hidden md:block md:col-span-5 lg:col-span-4 pt-8">
                 <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 h-[calc(100vh-6rem)] border border-white/40 shadow-sm sticky top-8 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">今日时刻表</h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <TargetList 
                            targets={targets} 
                            currentOtDurationMinutes={result.currentOtDurationMinutes} 
                            embedded={true}
                        />
                    </div>
                 </div>
             </div>
          </div>
        );
      case 'schedule':
        return (
            <div className="pb-20 md:pb-0 max-w-2xl mx-auto">
                <TargetList 
                    targets={targets} 
                    currentOtDurationMinutes={result.currentOtDurationMinutes} 
                />
            </div>
        );
      case 'settings':
        return (
            <div className="pb-20 md:pb-0 pt-8 md:pt-12">
                <SettingsCard 
                    startTime={startTime} 
                    onTimeChange={setStartTime}
                    themes={THEMES}
                    currentTheme={currentTheme}
                    onThemeChange={setCurrentTheme}
                />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
        className="flex min-h-screen bg-[#F2F2F7] text-gray-800 font-sans transition-colors duration-500"
        style={themeStyles}
    >
      {/* Desktop Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        currentTheme={currentTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth">
            <div className="max-w-7xl mx-auto w-full p-0 md:p-8 md:pr-12">
                {renderContent()}
            </div>
            {/* Mobile Bottom Nav */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </main>
      </div>
    </div>
  );
}

export default App;