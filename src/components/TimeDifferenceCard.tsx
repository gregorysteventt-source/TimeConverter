import React from 'react';
import { calculateTimeDifference, parseTimeString, copyToClipboardFallback, formatPad } from '../utils/timeUtils';
import { ArrowLeftRight, RotateCcw, Copy, ClipboardPaste } from 'lucide-react';

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

  const handleNativePasteA = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      onChangeA(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
      const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
      onShowToast(`¡Hora pegada en Tiempo A! 📋 ${formatted}`);
    }
  };

  const handleNativePasteB = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      onChangeB(String(parsed.hours), String(parsed.minutes), String(parsed.seconds));
      const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
      onShowToast(`¡Hora pegada en Tiempo B! 📋 ${formatted}`);
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
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex-grow flex flex-col justify-between">
        <div>
          {/* Header Badge & Reset */}
          <div className="flex justify-between items-center mb-4 relative z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Resta / Intervalo de Tiempos
            </span>
            <button
              type="button"
              onClick={onReset}
              className="text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/40 hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700/30 hover:border-rose-500/20 transition-all flex items-center gap-1.5 text-[11px] relative z-30 cursor-pointer"
              title="Limpiar esta sección"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-500" />
            Diferencia de Tiempo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-normal leading-relaxed">
            Ingresa dos marcas de tiempo para calcular instantáneamente el intervalo transcurrido.
          </p>

          {/* Time A and Time B Inputs */}
          <div className="space-y-3.5 mb-5">
            {/* Time A */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="block text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Tiempo A
                </span>
                <button
                  type="button"
                  onClick={() => handlePastePanel('A')}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  title="Pegar tiempo en A"
                >
                  <ClipboardPaste className="w-3 h-3 text-indigo-500" />
                  Pegar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="HH"
                  value={diffHA}
                  onPaste={handleNativePasteA}
                  onChange={(e) => onChangeA(e.target.value.replace(/[^\d]/g, ''), diffMA, diffSA)}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="MM"
                  value={diffMA}
                  onPaste={handleNativePasteA}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeA(diffHA, v, diffSA);
                  }}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="SS"
                  value={diffSA}
                  onPaste={handleNativePasteA}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeA(diffHA, diffMA, v);
                  }}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Time B */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="block text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Tiempo B
                </span>
                <button
                  type="button"
                  onClick={() => handlePastePanel('B')}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  title="Pegar tiempo en B"
                >
                  <ClipboardPaste className="w-3 h-3 text-purple-500" />
                  Pegar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="HH"
                  value={diffHB}
                  onPaste={handleNativePasteB}
                  onChange={(e) => onChangeB(e.target.value.replace(/[^\d]/g, ''), diffMB, diffSB)}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="MM"
                  value={diffMB}
                  onPaste={handleNativePasteB}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeB(diffHB, v, diffSB);
                  }}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="SS"
                  value={diffSB}
                  onPaste={handleNativePasteB}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeB(diffHB, diffMB, v);
                  }}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mb-6">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Prueba rápida:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSetDiffPresets(10, 30, 0, 12, 45, 15)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/30 hover:border-emerald-500/30 transition-all font-medium"
              >
                10:30:00 vs 12:45:15
              </button>
              <button
                type="button"
                onClick={() => handleSetDiffPresets(0, 5, 0, 0, 55, 30)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/40 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/30 hover:border-emerald-500/30 transition-all font-medium"
              >
                05m 00s vs 55m 30s
              </button>
            </div>
          </div>
        </div>

        {/* Result Container */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 relative mt-auto">
          <span className="absolute -top-2.5 left-4 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Resultado de Resta
          </span>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-4xl font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 mb-4 transition-all">
              {diffResult.formatted}
            </div>

            <div className="w-full text-center border-t border-slate-200 dark:border-slate-800/60 pt-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Diferencia: {diffResult.diffSecs.toLocaleString()} segundos
              </span>
            </div>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyResult}
            className="absolute top-3 right-3 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 transition-all z-20 shadow-sm"
            title="Copiar diferencia de tiempo"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
