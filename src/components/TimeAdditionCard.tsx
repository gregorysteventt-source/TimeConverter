import React from 'react';
import {
  calculateTimeAddition,
  parseTimeAndSeconds,
  parseTimeString,
  copyToClipboardFallback,
  formatPad,
} from '../utils/timeUtils';
import { PlusCircle, Copy, ClipboardPaste } from 'lucide-react';
import { CardHeader } from './CardHeader';

interface TimeAdditionCardProps {
  addHA: string;
  addMA: string;
  addSA: string;
  addSecsInput: string;
  onChangeBase: (h: string, m: string, s: string) => void;
  onChangeDelta: (secs: string) => void;
  onReset: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onAddHistory: (title: string, input: string, result: string, category: 'add') => void;
}

const smallFieldClass =
  'w-full text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg py-2 text-sm text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

/** Selects the current value so a fresh paste replaces it instead of appending. */
const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select();

export const TimeAdditionCard: React.FC<TimeAdditionCardProps> = ({
  addHA,
  addMA,
  addSA,
  addSecsInput,
  onChangeBase,
  onChangeDelta,
  onReset,
  onShowToast,
  onAddHistory,
}) => {
  const h = parseInt(addHA, 10) || 0;
  const m = parseInt(addMA, 10) || 0;
  const s = parseInt(addSA, 10) || 0;
  const deltaSecs = parseInt(addSecsInput, 10) || 0;

  const additionResult = calculateTimeAddition(h, m, s, deltaSecs);
  const hasInput = Boolean(addHA || addMA || addSA || addSecsInput);

  const readClipboard = async (promptMessage: string): Promise<string> => {
    let text = '';
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch {
      text = '';
    }
    return text || window.prompt(promptMessage) || '';
  };

  /**
   * Applies a two-value paste such as "07:51:06<TAB>547" to both fields at once,
   * so the base time and the seconds no longer have to be copied separately.
   *
   * Returns false when the payload is not a pair of values, leaving the caller
   * to fall back to its normal single-value paste.
   */
  const applyCombinedPaste = (text: string): boolean => {
    const combined = parseTimeAndSeconds(text);
    if (combined.kind !== 'base+delta') return false;

    const { hours, minutes, seconds } = combined.base;
    onChangeBase(String(hours), String(minutes), String(seconds));
    onChangeDelta(String(combined.deltaSeconds));

    onShowToast(
      `Repartido automáticamente:  ${formatPad(hours)}:${formatPad(minutes)}:${formatPad(seconds)}  +  ${combined.deltaSeconds.toLocaleString()}s`
    );

    const inputStr = `${formatPad(hours)}:${formatPad(minutes)}:${formatPad(seconds)} + ${combined.deltaSeconds}s`;
    const res = calculateTimeAddition(hours, minutes, seconds, combined.deltaSeconds);
    onAddHistory('Suma de Tiempo', inputStr, `${res.formatted} (${res.finalSecs}s)`, 'add');
    return true;
  };

  const handlePasteBase = async () => {
    const text = await readClipboard('Pega aquí la hora base (HH:MM:SS)');

    // A two-value paste fills base and seconds together.
    if (applyCombinedPaste(text)) return;

    const parsed = parseTimeString(text);
    if (!parsed) {
      onShowToast('Pega una hora base válida (ej. 01:30:00)', true);
      return;
    }

    onChangeBase(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
    const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
    onShowToast(`¡Hora base pegada! 📋 ${formatted}`);
  };

  const handlePasteDelta = async () => {
    const text = await readClipboard('Pega los segundos a sumar');

    // The same two-value payload also works from the seconds side.
    if (applyCombinedPaste(text)) return;

    const cleaned = text.trim().replace(/,/g, '');
    if (!/^\d+$/.test(cleaned)) {
      onShowToast('Pega una cantidad válida de segundos enteros', true);
      return;
    }

    onChangeDelta(cleaned);
    onShowToast(`¡Segundos pegados: ${Number(cleaned).toLocaleString()}s! 📋`);
  };

  const handleNativePasteBase = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const combined = parseTimeAndSeconds(text);

    if (combined.kind === 'base+delta') {
      e.preventDefault();
      applyCombinedPaste(text);
      return;
    }

    // Never let a multi-value payload be parsed as a single time: "07:51:06 547"
    // would silently become one malformed value. Two clean values are handled
    // above; anything with inner whitespace is a multi-value paste we did not
    // understand, so ask instead of guessing.
    if (/\s/.test(text.trim())) {
      e.preventDefault();
      onShowToast(
        'Para pegar los dos valores a la vez usa la hora y los segundos separados por un tabulador (ej. 07:51:06⇥547)',
        true
      );
      return;
    }

    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      onChangeBase(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
      const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
      onShowToast(`¡Hora base pegada! 📋 ${formatted}`);
    }
  };

  const handleNativePasteDelta = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const combined = parseTimeAndSeconds(text);

    // Pasting the pair from the seconds side fills both fields too.
    if (combined.kind === 'base+delta') {
      e.preventDefault();
      applyCombinedPaste(text);
      return;
    }

    if (/\s/.test(text.trim())) {
      e.preventDefault();
      onShowToast(
        'Para pegar los dos valores a la vez usa la hora y los segundos separados por un tabulador (ej. 07:51:06⇥547)',
        true
      );
      return;
    }

    // A delta typed as a time ("90s", "1.5m") is converted to seconds.
    const parsed = parseTimeString(text);
    if (parsed && !/^\d+$/.test(text.trim())) {
      e.preventDefault();
      const totalSecs = parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds;
      onChangeDelta(String(totalSecs));
      onShowToast(`¡Tiempo pegado como ${totalSecs.toLocaleString()} segundos! 📋`);
      return;
    }

    const cleaned = text.trim().replace(/,/g, '');
    if (/^\d+$/.test(cleaned)) {
      e.preventDefault();
      onChangeDelta(cleaned);
      onShowToast(`¡Segundos pegados: ${Number(cleaned).toLocaleString()}s! 📋`);
    }
  };

  const handleCopyResult = async () => {
    const success = await copyToClipboardFallback(additionResult.formatted);
    if (success) {
      onShowToast(`¡Copiado al portapapeles: ${additionResult.formatted}!`);
    } else {
      onShowToast('Error al intentar copiar', true);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm hover:border-amber-500/30 transition-colors duration-300">
      <CardHeader
        icon={PlusCircle}
        accent="amber"
        title="Sumar al tiempo"
        description="Suma una cantidad de segundos a una hora base."
        hint="Pega los dos valores a la vez, separados por un tabulador: 07:51:06⇥547"
        onReset={onReset}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-5 md:gap-6">
        {/* Base time + delta */}
        <div className="min-w-0 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Base time */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Tiempo base
                </span>
                <button
                  type="button"
                  onClick={handlePasteBase}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  title="Pegar hora base, o los dos valores separados por un tabulador (07:51:06⇥547)"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  Pegar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="HH"
                  aria-label="Horas tiempo base"
                  value={addHA}
                  onFocus={selectOnFocus}
                  onPaste={handleNativePasteBase}
                  onChange={(e) => onChangeBase(e.target.value.replace(/[^\d]/g, ''), addMA, addSA)}
                  className={smallFieldClass}
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="MM"
                  aria-label="Minutos tiempo base"
                  value={addMA}
                  onFocus={selectOnFocus}
                  onPaste={handleNativePasteBase}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeBase(addHA, v, addSA);
                  }}
                  className={smallFieldClass}
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="SS"
                  aria-label="Segundos tiempo base"
                  value={addSA}
                  onFocus={selectOnFocus}
                  onPaste={handleNativePasteBase}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeBase(addHA, addMA, v);
                  }}
                  className={smallFieldClass}
                />
              </div>
            </div>

            {/* Seconds to add */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Segundos a sumar
                </span>
                <button
                  type="button"
                  onClick={handlePasteDelta}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  title="Pegar segundos, o los dos valores separados por un tabulador (07:51:06⇥547)"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  Pegar
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="addSecsInput"
                  min="0"
                  inputMode="numeric"
                  placeholder="Ej. 547"
                  value={addSecsInput}
                  onFocus={selectOnFocus}
                  onPaste={handleNativePasteDelta}
                  onChange={(e) => onChangeDelta(e.target.value.replace(/[^\d]/g, ''))}
                  className={`${smallFieldClass} pl-4 pr-14 text-left`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500 pointer-events-none">
                  seg
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="md:col-span-1">
          <div className="h-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Resultado
              </span>
              <button
                type="button"
                onClick={handleCopyResult}
                className="text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Copiar resultado"
                aria-label="Copiar resultado"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`text-center font-mono tabular-nums text-4xl font-semibold tracking-tight py-2 transition-colors ${
                hasInput ? 'text-amber-600 dark:text-amber-400' : 'text-slate-300 dark:text-slate-700'
              }`}
            >
              {additionResult.formatted}
            </div>

            <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1 tabular-nums">
              {additionResult.finalSecs.toLocaleString()} segundos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
