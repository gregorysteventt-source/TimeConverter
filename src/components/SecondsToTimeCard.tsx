import React from 'react';
import { secondsToBreakdown, copyToClipboardFallback, parseTimeString } from '../utils/timeUtils';
import { Clock, RotateCcw, Copy, ClipboardPaste } from 'lucide-react';

interface SecondsToTimeCardProps {
  secondsInput: string;
  onChangeSeconds: (val: string) => void;
  onReset: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onAddHistory: (title: string, input: string, result: string, category: 'sec-to-time') => void;
}

export const SecondsToTimeCard: React.FC<SecondsToTimeCardProps> = ({
  secondsInput,
  onChangeSeconds,
  onReset,
  onShowToast,
  onAddHistory,
}) => {
  const numSecs = parseInt(secondsInput, 10) || 0;
  const breakdown = secondsToBreakdown(numSecs);

  const handleSetQuick = (sec: number) => {
    const val = String(sec);
    onChangeSeconds(val);
    const bd = secondsToBreakdown(sec);
    onShowToast(`Segundos actualizados a ${sec.toLocaleString()}`);
    onAddHistory('Segundos a Tiempo', `${sec} seg`, bd.formattedHHMMSS, 'sec-to-time');
  };

  const handlePaste = async () => {
    let text = '';
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch {
      text = '';
    }

    if (!text) {
      text = window.prompt('Pega aquí los segundos totales') || '';
    }

    const cleaned = text.trim().replace(/,/g, '');
    if (!/^\d+$/.test(cleaned)) {
      onShowToast('Pega una cantidad válida de segundos enteros', true);
      return;
    }

    onChangeSeconds(cleaned);
    const bd = secondsToBreakdown(parseInt(cleaned, 10));
    onShowToast(`¡Segundos pegados: ${Number(cleaned).toLocaleString()}! 📋`);
    onAddHistory('Segundos a Tiempo', `${cleaned} seg`, bd.formattedHHMMSS, 'sec-to-time');
  };

  const handleNativePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      const totalSecs = parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds;
      onChangeSeconds(String(totalSecs));
      const bd = secondsToBreakdown(totalSecs);
      onShowToast(`¡Hora pegada y convertida a ${totalSecs.toLocaleString()} seg! 📋`);
      onAddHistory('Segundos a Tiempo', `${totalSecs} seg`, bd.formattedHHMMSS, 'sec-to-time');
    } else {
      const cleaned = text.trim().replace(/,/g, '');
      if (/^\d+$/.test(cleaned)) {
        e.preventDefault();
        onChangeSeconds(cleaned);
        const bd = secondsToBreakdown(parseInt(cleaned, 10));
        onShowToast(`¡Segundos pegados: ${Number(cleaned).toLocaleString()}! 📋`);
        onAddHistory('Segundos a Tiempo', `${cleaned} seg`, bd.formattedHHMMSS, 'sec-to-time');
      }
    }
  };

  const handleCopyResult = async () => {
    const success = await copyToClipboardFallback(breakdown.formattedHHMMSS);
    if (success) {
      onShowToast(`¡Copiado al portapapeles: ${breakdown.formattedHHMMSS}!`);
    } else {
      onShowToast('Error al intentar copiar', true);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex-grow flex flex-col justify-between">
        <div>
          {/* Header Badge & Reset */}
          <div className="flex justify-between items-center mb-4 relative z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
              Segundos a Tiempo
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
            <Clock className="w-5 h-5 text-indigo-500" />
            Convertir Segundos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-normal leading-relaxed">
            Ingresa una cantidad entera de segundos para obtener el formato estructurado en horas, minutos y segundos.
          </p>

          {/* Input field */}
          <div className="space-y-2 mb-5">
            <label htmlFor="inputSeconds" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Segundos totales
            </label>
            <div className="flex gap-2 items-stretch">
              <div className="relative flex-1">
                <input
                  type="number"
                  id="inputSeconds"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  placeholder="Ej. 86400"
                  value={secondsInput}
                  onPaste={handleNativePaste}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '');
                    onChangeSeconds(val);
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-lg text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 pointer-events-none">
                  seg
                </span>
              </div>
              <button
                type="button"
                onClick={handlePaste}
                className="inline-flex items-center justify-center gap-1.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold transition-all shadow-sm"
                title="Pegar segundos totales"
              >
                <ClipboardPaste className="w-4 h-4" />
                <span>Pegar</span>
              </button>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="mb-6">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Prueba rápida:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '45s', sec: 45 },
                { label: '1h (3600s)', sec: 3600 },
                { label: '1d (86400s)', sec: 86400 },
                { label: '1 sem (604.8k)', sec: 604800 },
              ].map((chip) => (
                <button
                  key={chip.sec}
                  type="button"
                  onClick={() => handleSetQuick(chip.sec)}
                  className="text-xs bg-slate-100 dark:bg-slate-800/40 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/30 hover:border-indigo-500/30 transition-all font-medium"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Container */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 relative mt-auto">
          <span className="absolute -top-2.5 left-4 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Resultado
          </span>

          <div className="flex flex-col items-center justify-center py-2">
            {/* Formatted Digital HH:MM:SS */}
            <div className="text-4xl font-mono font-bold tracking-wider text-indigo-600 dark:text-indigo-400 mb-4 transition-all">
              {breakdown.formattedHHMMSS}
            </div>

            {/* Breakdown grid */}
            <div className="grid grid-cols-3 gap-1 w-full text-center border-t border-slate-200 dark:border-slate-800/60 pt-4">
              <div>
                <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {breakdown.hours.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Horas
                </span>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800/60">
                <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {breakdown.minutes}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Minutos
                </span>
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {breakdown.seconds}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Segundos
                </span>
              </div>
            </div>

            {/* Extended Days / Decimal Hours if > 24h */}
            {breakdown.days > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/40 w-full text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-3">
                <span>Días: <strong className="text-indigo-600 dark:text-indigo-400">{breakdown.days}d</strong> ({breakdown.totalDays}d)</span>
                <span>•</span>
                <span>Horas Decimales: <strong className="text-indigo-600 dark:text-indigo-400">{breakdown.decimalHours}h</strong></span>
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyResult}
            className="absolute top-3 right-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all z-20 shadow-sm"
            title="Copiar formato HH:MM:SS"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
