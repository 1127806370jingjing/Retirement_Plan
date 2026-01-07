export interface WorkTimeConfig {
  startTime: string; // Format "HH:mm"
  lunchDurationMinutes: number; // Default 90 (1.5h)
  workDurationHours: number; // Default 8
  bufferMinutes: number; // Default 30
}

export interface CalculationResult {
  scheduledEndTime: Date;
  otStartTime: Date;
  currentOtDurationMinutes: number; // Raw minutes
  validOtUnits: number; // Number of 30min units
  validOtHours: number; // e.g., 0.5, 1.0, 1.5
}

export type SuggestionType = 'waiting' | 'urgent' | 'optimal' | 'neutral';

export interface OtSuggestion {
  type: SuggestionType;
  title: string;
  description: string;
  actionText?: string;
}

export interface TargetTime {
  hours: number;
  targetDate: Date;
}

export interface AppTheme {
  id: string;
  name: string;
  colors: {
    primary: string;      // Solid text/icon color
    gradientFrom: string; // Gradient start
    gradientTo: string;   // Gradient end
    surfaceLight: string; // Very light tint for backgrounds
    shadow: string;       // Color for shadows
  };
}