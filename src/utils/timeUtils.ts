import { TimeBreakdown, TimeParts } from '../types';

export function formatPad(num: number, digits: number = 2): string {
  return String(Math.floor(Math.abs(num))).padStart(digits, '0');
}

export function secondsToBreakdown(totalSecsInput: number): TimeBreakdown {
  const totalSeconds = Math.max(0, Math.floor(totalSecsInput));
  
  const years = Math.floor(totalSeconds / (3600 * 24 * 365));
  const remainingAfterYears = totalSeconds % (3600 * 24 * 365);
  
  const days = Math.floor(remainingAfterYears / (3600 * 24));
  const remainingAfterDays = remainingAfterYears % (3600 * 24);
  
  const hours = Math.floor(remainingAfterDays / 3600);
  const remainingAfterHours = remainingAfterDays % 3600;
  
  const minutes = Math.floor(remainingAfterHours / 60);
  const seconds = remainingAfterHours % 60;

  // Format HH:MM:SS (includes cumulative hours if total duration exceeds 24h, or total HH)
  const totalHoursInt = Math.floor(totalSeconds / 3600);
  const formattedHHMMSS = `${formatPad(totalHoursInt)}:${formatPad(minutes)}:${formatPad(seconds)}`;

  return {
    years,
    days,
    hours,
    minutes,
    seconds,
    milliseconds: 0,
    formattedHHMMSS,
    totalSeconds,
    totalMinutes: Number((totalSeconds / 60).toFixed(2)),
    totalHours: Number((totalSeconds / 3600).toFixed(2)),
    totalDays: Number((totalSeconds / 86400).toFixed(2)),
    decimalHours: Number((totalHoursInt + minutes / 60 + seconds / 3600).toFixed(4)),
  };
}

export function timeToTotalSeconds(h: number, m: number, s: number): number {
  const safeH = Math.max(0, isNaN(h) ? 0 : h);
  const safeM = Math.max(0, isNaN(m) ? 0 : m);
  const safeS = Math.max(0, isNaN(s) ? 0 : s);
  return safeH * 3600 + safeM * 60 + safeS;
}

export function parseTimeString(text: string): TimeParts | null {
  if (!text) return null;
  const trimmed = text.trim();

  // Pattern 1: HH:MM:SS or HH:MM (allowing optional spaces around colons)
  const hmsRegex = /^(\d{1,5})\s*:\s*(\d{1,2})(?:\s*:\s*(\d{1,2}))?$/;
  const matchHms = trimmed.match(hmsRegex);
  if (matchHms) {
    return {
      hours: parseInt(matchHms[1], 10) || 0,
      minutes: parseInt(matchHms[2], 10) || 0,
      seconds: matchHms[3] !== undefined ? parseInt(matchHms[3], 10) || 0 : 0,
    };
  }

  // Pattern 2: e.g. "2h 30m 15s" or "1h 15m" or "45m"
  const hMatch = trimmed.match(/(\d+)\s*h/i);
  const mMatch = trimmed.match(/(\d+)\s*m/i);
  const sMatch = trimmed.match(/(\d+)\s*s/i);

  if (hMatch || mMatch || sMatch) {
    return {
      hours: hMatch ? parseInt(hMatch[1], 10) : 0,
      minutes: mMatch ? parseInt(mMatch[1], 10) : 0,
      seconds: sMatch ? parseInt(sMatch[1], 10) : 0,
    };
  }

  // Pattern 3: Decimal hours (e.g., 1.5h)
  const decimalHMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*h$/i);
  if (decimalHMatch) {
    const totalH = parseFloat(decimalHMatch[1]);
    const totalSecs = Math.round(totalH * 3600);
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return { hours: h, minutes: m, seconds: s };
  }

  return null;
}

export function calculateTimeDifference(
  hA: number,
  mA: number,
  sA: number,
  hB: number,
  mB: number,
  sB: number
) {
  const totalSecA = timeToTotalSeconds(hA, mA, sA);
  const totalSecB = timeToTotalSeconds(hB, mB, sB);

  const diffSecs = Math.abs(totalSecA - totalSecB);
  const breakdown = secondsToBreakdown(diffSecs);

  return {
    diffSecs,
    breakdown,
    formatted: breakdown.formattedHHMMSS,
    isABigger: totalSecA >= totalSecB,
  };
}

export function calculateTimeAddition(
  h: number,
  m: number,
  s: number,
  deltaSecs: number,
  isAddition: boolean = true
) {
  const baseSecs = timeToTotalSeconds(h, m, s);
  const finalSecs = isAddition
    ? baseSecs + (isNaN(deltaSecs) ? 0 : deltaSecs)
    : Math.max(0, baseSecs - (isNaN(deltaSecs) ? 0 : deltaSecs));

  const breakdown = secondsToBreakdown(finalSecs);
  return {
    finalSecs,
    breakdown,
    formatted: breakdown.formattedHHMMSS,
  };
}

export async function copyToClipboardFallback(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback below
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return successful;
  } catch {
    return false;
  }
}
