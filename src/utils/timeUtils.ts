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

/**
 * A single token from a multi-value paste, classified by shape.
 *
 * The distinction that makes the auto-split safe is `time` versus `plain`:
 * a value written with a time marker (colons, or h/m/s units) is a time, while a
 * bare number is unambiguously an amount of seconds. `seconds` is kept for the
 * colon form with no hours ("45:10") so it can still pair with a time value.
 */
export type PasteTokenKind = 'time' | 'seconds' | 'plain';

export interface ClassifiedToken {
  raw: string;
  kind: PasteTokenKind;
  parts?: TimeParts;
  value?: number;
}

export type CombinedPaste =
  | { kind: 'base+delta'; base: TimeParts; deltaSeconds: number }
  | { kind: 'ambiguous' }
  | { kind: 'none' };

const PLAIN_NUMBER = /^\d+(?:[.,]\d+)?$/;
/** Colon form carrying only minutes and seconds, e.g. "45:10". */
const MINUTES_SECONDS = /^(\d{1,4}):(\d{1,2})$/;
/**
 * A span written with explicit h/m/s units, e.g. "45m", "1.5m", "2h 30m" or
 * "1h 5m 30s". At least one unit is required, so a bare number never matches.
 */
const UNIT_SPAN =
  /^(?:(\d+(?:[.,]\d+)?)\s*h)?\s*(?:(\d+(?:[.,]\d+)?)\s*m)?\s*(?:(\d+(?:[.,]\d+)?)\s*s)?$/i;

const unitSpanToSeconds = (value: string): number | null => {
  if (!/[hms]/i.test(value)) return null;
  const match = value.match(UNIT_SPAN);
  if (!match || (!match[1] && !match[2] && !match[3])) return null;

  const amount = (group: string | undefined): number =>
    group ? parseFloat(group.replace(',', '.')) : 0;

  return Math.round(amount(match[1]) * 3600 + amount(match[2]) * 60 + amount(match[3]));
};

/**
 * Normalizes a single raw token.
 *
 * Thousands separators are stripped only when they form real groups, so a
 * decimal comma ("1,5") survives intact while "1,234" becomes 1234.
 */
const normalizeNumber = (raw: string): string =>
  /^[+-]?\d{1,3}(?:[,.]\d{3})+(?:[.,]\d+)?$/.test(raw)
    ? raw.replace(/[,.]/g, '')
    : raw.replace(/,/g, '.');

/**
 * Classifies one pasted token.
 *
 * A bare number must NOT be read as HH:MM, which `parseTimeString` would
 * otherwise do for two-digit values — that is precisely how a value of "547"
 * would turn into 5h47m and corrupt the base time.
 */
export function classifyPasteToken(token: string): ClassifiedToken | null {
  const raw = token.trim();
  if (!raw) return null;

  const normalized = normalizeNumber(raw);

  const span = unitSpanToSeconds(normalized);
  if (span !== null) {
    return { raw, kind: 'time', value: span };
  }

  if (PLAIN_NUMBER.test(normalized)) {
    return { raw, kind: 'plain', value: parseFloat(normalized) };
  }

  const minutesSeconds = normalized.match(MINUTES_SECONDS);
  if (minutesSeconds) {
    const firstValue = parseInt(minutesSeconds[1], 10);
    const secondValue = parseInt(minutesSeconds[2], 10);
    // "45:10" is a span of 45 minutes 10 seconds. But "07:51" cannot be 7
    // minutes 51 seconds read as minutes — that is a clock-style HH:MM value.
    return firstValue <= 59
      ? { raw, kind: 'seconds', value: firstValue * 60 + secondValue }
      : { raw, kind: 'time', parts: { hours: firstValue, minutes: secondValue, seconds: 0 } };
  }

  const parts = parseTimeString(normalized);
  if (parts) {
    return { raw, kind: 'time', parts };
  }

  return null;
}

const toSeconds = (token: ClassifiedToken): number => {
  if (token.kind === 'plain') return token.value as number;
  if (token.kind === 'seconds') return token.value as number;
  if (token.parts) {
    const { hours, minutes, seconds } = token.parts;
    return timeToTotalSeconds(hours, minutes, seconds);
  }
  return token.value as number;
};

/** Splits a whole number of seconds into the hours/minutes/seconds input trio. */
const secondsToParts = (totalSeconds: number): TimeParts => ({
  hours: Math.floor(totalSeconds / 3600),
  minutes: Math.floor((totalSeconds % 3600) / 60),
  seconds: totalSeconds % 60,
});

/**
 * How many whitespace-separated tokens starting at `index` still form a single
 * time value. Returns the longest run that parses, so "2h 30m" is kept whole
 * while a following bare number ("547") is not swallowed.
 *
 * The compact "HH:MM" form is deliberately excluded here: a bare two-part colon
 * value is more likely a short span on its own, and guessing wrong would corrupt
 * the base time. Full "HH:MM:SS" is unambiguous, so it is accepted.
 */
const timeRunLength = (tokens: string[], index: number): number => {
  const candidates: string[] = [];
  for (let take = 1; take <= 3 && index + take <= tokens.length; take++) {
    candidates.push(tokens.slice(index, index + take).join(' '));
  }

  for (let take = candidates.length; take >= 1; take--) {
    const candidate = candidates[take - 1];
    if (unitSpanToSeconds(candidate) !== null) return take;
    if (/^\d{1,5}:\d{1,2}:\d{1,2}$/.test(candidate)) return take;
  }

  return 0;
};

/**
 * Splits a pasted clipboard payload into individual values.
 *
 * Tabs and newlines are always separators, because that is how a spreadsheet row
 * or a column copy arrives; commas and semicolons are too, unless the whole
 * payload is a single decimal number. Only when none of those appear does it
 * fall back to splitting on spaces — and even then, adjacent tokens that
 * together form a time value ("2h 30m") are kept together.
 */
export function splitPastedValues(text: string): string[] {
  if (!text) return [];

  const explicit = text
    .split(/[\t\r\n]+|[,;]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (explicit.length > 1) return explicit;

  // A lone decimal number ("1,5") must not be torn in two.
  if (explicit.length === 1 && PLAIN_NUMBER.test(normalizeNumber(explicit[0]))) {
    return explicit;
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const values: string[] = [];
  let index = 0;

  while (index < words.length) {
    const run = timeRunLength(words, index);
    if (run > 1) {
      values.push(words.slice(index, index + run).join(' '));
      index += run;
    } else {
      values.push(words[index]);
      index += 1;
    }
  }

  return values;
}

/**
 * Reads a two-value paste such as "07:51:06<TAB>547" and works out which value
 * is the base time and which is the number of seconds to add or subtract.
 *
 * Returns `ambiguous` rather than guessing when both tokens come from a
 * time-formatted field (e.g. two "HH:MM:SS" values — a difference, not a sum)
 * or when neither token is time-formatted. Returns `none` when the payload is
 * not a clean pair of values, so the caller can fall back to normal pasting.
 */
export function parseTimeAndSeconds(text: string): CombinedPaste {
  const rawTokens = splitPastedValues(text);
  const classified = rawTokens.map(classifyPasteToken);

  // Never act on a partially understood payload: leave it to the normal paste.
  if (classified.length !== 2 || classified.some((token) => token === null)) {
    return { kind: 'none' };
  }

  const tokens = classified as ClassifiedToken[];
  const times = tokens.filter((token) => token.kind === 'time');
  const numbers = tokens.filter((token) => token.kind !== 'time');

  if (times.length !== 1 || numbers.length !== 1) return { kind: 'ambiguous' };

  const baseToken = times[0];
  return {
    kind: 'base+delta',
    base: baseToken.parts ?? secondsToParts(toSeconds(baseToken)),
    deltaSeconds: Math.max(0, Math.round(toSeconds(numbers[0]))),
  };
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

/** Adds a number of seconds to a base time. */
export function calculateTimeAddition(h: number, m: number, s: number, deltaSecs: number) {
  const baseSecs = timeToTotalSeconds(h, m, s);
  const safeDelta = isNaN(deltaSecs) || deltaSecs < 0 ? 0 : deltaSecs;
  const finalSecs = baseSecs + safeDelta;

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
