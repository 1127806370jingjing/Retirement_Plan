import { WorkTimeConfig, CalculationResult, TargetTime, OtSuggestion } from '../types';

/**
 * Creates a Date object for today with the specific time string "HH:mm"
 */
export const getTodayDateWithTime = (timeStr: string): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * Formats a Date object to "HH:mm"
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatTimeWithDay = (date: Date, referenceDate: Date): string => {
  const timeStr = formatTime(date);
  if (date.getDate() !== referenceDate.getDate()) {
    return `次日 ${timeStr}`;
  }
  return timeStr;
};

/**
 * Get difference in minutes between two dates
 */
export const getTimeDifferenceInMinutes = (d1: Date, d2: Date): number => {
  return Math.floor((d1.getTime() - d2.getTime()) / 60000);
};

/**
 * Main calculation logic with 1h initial threshold
 */
export const calculateOvertime = (
  config: WorkTimeConfig,
  currentTime: Date
): CalculationResult => {
  const [startHour, startMin] = config.startTime.split(':').map(Number);
  
  let startDate = new Date(currentTime);
  startDate.setHours(startHour, startMin, 0, 0);

  if (currentTime.getTime() < startDate.getTime()) {
    startDate.setDate(startDate.getDate() - 1);
  }
  
  const totalShiftMinutes = (config.workDurationHours * 60) + config.lunchDurationMinutes;
  const scheduledEndTime = new Date(startDate.getTime() + totalShiftMinutes * 60000);
  const otStartTime = new Date(scheduledEndTime.getTime() + config.bufferMinutes * 60000);

  let currentOtDurationMinutes = 0;
  let validOtUnits = 0;
  let validOtHours = 0;

  if (currentTime > otStartTime) {
    const diffMs = currentTime.getTime() - otStartTime.getTime();
    currentOtDurationMinutes = Math.floor(diffMs / 60000);
    
    // NEW RULE: First valid OT must be at least 1.0 hour (60 mins)
    if (currentOtDurationMinutes >= 60) {
      // Base is 1.0h (2 units of 30min), then add subsequent 30min units
      validOtUnits = 2 + Math.floor((currentOtDurationMinutes - 60) / 30);
      validOtHours = validOtUnits * 0.5;
    }
  }

  return {
    scheduledEndTime,
    otStartTime,
    currentOtDurationMinutes,
    validOtUnits,
    validOtHours,
  };
};

/**
 * Smart Suggestion Logic updated for 1h threshold
 */
export const getOtSuggestion = (result: CalculationResult, currentTime: Date): OtSuggestion => {
  const { scheduledEndTime, otStartTime, currentOtDurationMinutes } = result;

  if (currentTime < scheduledEndTime) {
    const minLeft = Math.ceil((scheduledEndTime.getTime() - currentTime.getTime()) / 60000);
    if (minLeft <= 30) {
      return {
        type: 'neutral',
        title: '即将下班',
        description: `还有 ${minLeft} 分钟到达应下班时间，建议收拾东西准备撤离。`,
      };
    }
    return {
      type: 'waiting',
      title: '工作中',
      description: '尚未到达下班时间，此时离开不计加班。',
    };
  }

  if (currentTime >= scheduledEndTime && currentTime < otStartTime) {
    const minToStart = Math.ceil((otStartTime.getTime() - currentTime.getTime()) / 60000);
    return {
      type: 'waiting',
      title: '缓冲期',
      description: '当前处于30分钟无薪缓冲期，加班流程尚未启动。',
      actionText: `再等 ${minToStart} 分钟开始计时`
    };
  }

  // OT is calculating, but checking 1h threshold
  if (currentOtDurationMinutes < 60) {
    const minToThreshold = 60 - currentOtDurationMinutes;
    return {
      type: 'urgent',
      title: '起报门槛中',
      description: `虽然已开始计薪，但未满1小时申报门槛，建议再坚持 ${minToThreshold} 分钟。`,
      actionText: '未达申报要求'
    };
  }

  const minutesIntoCurrentUnit = (currentOtDurationMinutes - 60) % 30;
  const minutesUntilNextUnit = 30 - minutesIntoCurrentUnit;

  if (minutesIntoCurrentUnit < 5) {
    return {
      type: 'optimal',
      title: '建议下班',
      description: `已达成 ${result.validOtHours}h 加班时长，当前打卡收益最高。`,
      actionText: '理想打卡点'
    };
  }

  if (minutesUntilNextUnit <= 8) {
    return {
      type: 'urgent',
      title: '临近节点',
      description: `再坚持 ${minutesUntilNextUnit} 分钟即可增加 0.5h 加班时长。`,
      actionText: `切勿此时离开`
    };
  }

  return {
    type: 'neutral',
    title: '正常加班中',
    description: `距离下一个 0.5h 节点还有 ${minutesUntilNextUnit} 分钟。`,
    actionText: '稳定积累中'
  };
};

/**
 * Generate target list
 * Now includes 0.0h (Buffer End) as the very first milestone
 */
export const generateTargets = (otStartTime: Date): TargetTime[] => {
  const targets: TargetTime[] = [];
  
  // 1. Add the "0h" node - The start of calculation
  targets.push({ hours: 0, targetDate: otStartTime });

  // 2. Add the "Claimable" nodes (starting from 1.0h per rule)
  for (let i = 2; i <= 16; i++) {
    const hours = i * 0.5;
    const targetDate = new Date(otStartTime.getTime() + (hours * 60 * 60000));
    targets.push({ hours, targetDate });
  }
  return targets;
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 5) return '披星戴月';
  if (hour < 11) return '上午好';
  if (hour < 13) return '午间小憩';
  if (hour < 18) return '下午好';
  return '晚安打工人';
};