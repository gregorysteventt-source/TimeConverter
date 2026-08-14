export type ThemeMode = 'light' | 'dark';

export interface TimeBreakdown {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  formattedHHMMSS: string;
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  decimalHours: number;
}

export interface HistoryItem {
  id: string;
  timestamp: Date;
  title: string;
  input: string;
  result: string;
  category: 'sec-to-time' | 'time-to-sec' | 'diff' | 'add' | 'speed';
  isFavorite?: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
}
