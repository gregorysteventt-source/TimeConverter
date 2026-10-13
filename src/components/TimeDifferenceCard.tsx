import React from 'react';
import { calculateTimeDifference, parseTimeString, copyToClipboardFallback, formatPad } from '../utils/timeUtils';
import { ArrowLeftRight, Copy, ClipboardPaste } from 'lucide-react';
import { CardHeader } from './CardHeader';

interface TimeDifferenceCardProps {
  diffHA: string;
  diffMA: string;
  diffSA: string;
  diffHB: string;
  diffMB: string;
  diffSB: string;
  onChangeA: (h: string, m: string, s: string) => void;
  onChangeB: (h: string, m: string, s: string) => void;
  onReset: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onAddHistory: (title: string, input: string, result: string, category: 'diff') => void;
}

const compactFieldClass =
  'w-full text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-lg py-2 text-sm text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

const markStyles = {
  A: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  B: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
} as const;

export const TimeDifferenceCard: React.FC<TimeDifferenceCardProps> = ({
  diffHA,
  diffMA,
  diffSA,
  diffHB,
  diffMB,
  diffSB,
  onChangeA,
  onChangeB,
  onReset,
  onShowToast,
  onAddHistory,
}) => {
  const hA = parseInt(diffHA, 10) || 0;
  const mA = parseInt(diffMA, 10) || 0;
  const sA = parseInt(diffSA, 10) || 0;

  const hB = parseInt(diffHB, 10) || 0;
  const mB = parseInt(diffMB, 10) || 0;
  const sB = parseInt(diffSB, 10) || 0;

  const diffResult = calculateTimeDifference(hA, mA, sA, hB, mB, sB);
  const hasInput = Boolean(
    diffHA || diffMA || diffSA || diffHB || diffMB || diffSB
  );

  const handleSetDiffPresets = (
    hAVal: number,
    mAVal: number,
    sAVal: number,
    hBVal: number,
    mBVal: number,
    sBVal: number
  ) => {
    onChangeA(String(hAVal), String(mAVal), String(sAVal));
    onChangeB(String(hBVal), String(mBVal), String(sBVal));
    const res = calculateTimeDifference(hAVal, mAVal, sAVal, hBVal, mBVal, sBVal);
    onShowToast('Tiempos de comparación configurados');
    const inputStr = `${formatPad(hAVal)}:${formatPad(mAVal)}:${formatPad(sAVal)} vs ${formatPad(hBVal)}:${formatPad(mBVal)}:${formatPad(sBVal)}`;
    onAddHistory('Diferencia de Tiempo', inputStr, `${res.formatted} (${res.diffSecs}s)`, 'diff');
  };

  const handlePastePanel = async (panel: 'A' | 'B') => {
    let text = '';
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch {
      text = '';
    }

    if (!text) {
      text = window.prompt(`Pega la hora para Tiempo ${panel} (HH:MM:SS)`) || '';
    }

    const parsed = parseTimeString(text);
    if (!parsed) {
      onShowToast(`Pega una hora válida para Tiempo ${panel} (ej. 10:30:00)`, true);
      return;
    }

    if (panel === 'A') {
      onChangeA(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
    } else {
      onChangeB(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
    }

    const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
    onShowToast(`¡Hora pegada en Tiempo ${panel}! 📋 ${formatted}`);
  };

  const makeNativePaste = (panel: 'A' | 'B') => (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      if (panel === 'A') {
        onChangeA(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
      } else {
        onChangeB(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
      }
      const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
      onShowToast(`¡Hora pegada en Tiempo ${panel}! 📋 ${formatted}`);
    }
  };

  const handleCopyResult = async () => {
    const success = await copyToClipboardFallback(diffResult.formatted);
    if (success) {
      onShowToast(`¡Copiado al portapapeles: ${diffResult.formatted}!`);
    } else {
      onShowToast('Error al intentar copiar', true);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm hover:border-emerald-500/30 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-5 md:gap-6">
        {/* Left: inputs */}
        <div className="min-w-0 md:col-span-2">
          <CardHeader
            icon={ArrowLeftRight}
            accent="emerald"
            title="Diferencia entre tiempos"
            description="Ingresa dos marcas de tiempo para calcular el intervalo transcurrido."
            onReset={onReset}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['A', 'B'] as const).map((panel) => {
              const values =
                panel === 'A' ? [diffHA, diffMA, diffSA] : [diffHB, diffMB, diffSB];
              const setter = (idx: number, val: string) => {
                const next = [...values];
                next[idx] = val;
                if (panel === 'A') onChangeA(next[0], next[1], next[2]);
                else onChangeB(next[0], next[1], next[2]);
              };
              const clamp = (val: string) => {
                const digits = val.replace(/[^\d]/g, '');
                return parseInt(digits, 10) > 59 ? '59' : digits;
              };

              return (
                <div
                  key={panel}
                  className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-bold ${markStyles[panel]}`}
                    >
                      {panel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handlePastePanel(panel)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                      title={`Pegar tiempo en ${panel}`}
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
                      aria-label={`Horas tiempo ${panel}`}
                      value={values[0]}
                      onPaste={makeNativePaste(panel)}
                      onChange={(e) => setter(0, e.target.value.replace(/[^\d]/g, ''))}
                      className={compactFieldClass}
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      inputMode="numeric"
                      placeholder="MM"
                      aria-label={`Minutos tiempo ${panel}`}
                      value={values[1]}
                      onPaste={makeNativePaste(panel)}
                      onChange={(e) => setter(1, clamp(e.target.value))}
                      className={compactFieldClass}
                    />
                    <input
                      type="number"
                      min="0"
                      max="59"
                      inputMode="numeric"
                      placeholder="SS"
                      aria-label={`Segundos tiempo ${panel}`}
                      value={values[2]}
                      onPaste={makeNativePaste(panel)}
                      onChange={(e) => setter(2, clamp(e.target.value))}
                      className={compactFieldClass}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick presets */}
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
              Valores rápidos
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSetDiffPresets(10, 30, 0, 12, 45, 15)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/50 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 transition-colors font-medium tabular-nums"
              >
                10:30:00 → 12:45:15
              </button>
              <button
                type="button"
                onClick={() => handleSetDiffPresets(0, 5, 0, 0, 55, 30)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/50 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/30 transition-colors font-medium tabular-nums"
              >
                05:00 → 55:30
              </button>
            </div>
          </div>
        </div>

        {/* Right: result */}
        <div className="md:col-span-1">
          <div className="h-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Intervalo
              </span>
              <button
                type="button"
                onClick={handleCopyResult}
                className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Copiar diferencia de tiempo"
                aria-label="Copiar resultado"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div
              className={`text-center font-mono tabular-nums text-4xl font-semibold tracking-tight py-2 transition-colors ${
                hasInput
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-300 dark:text-slate-700'
              }`}
            >
              {diffResult.formatted}
            </div>

            <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3 mt-1 tabular-nums">
              {diffResult.diffSecs.toLocaleString()} segundos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
