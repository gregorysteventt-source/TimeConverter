import React from 'react';
import { timeToTotalSeconds, parseTimeString, copyToClipboardFallback, formatPad } from '../utils/timeUtils';
import { Timer, RotateCcw, Copy, ClipboardPaste, Lightbulb } from 'lucide-react';

interface TimeToSecondsCardProps {
  hours: string;
  minutes: string;
  seconds: string;
  onChangeHours: (val: string) => void;
  onChangeMinutes: (val: string) => void;
  onChangeSeconds: (val: string) => void;
  onReset: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onAddHistory: (title: string, input: string, result: string, category: 'time-to-sec') => void;
}

export const TimeToSecondsCard: React.FC<TimeToSecondsCardProps> = ({
  hours,
  minutes,
  seconds,
  onChangeHours,
  onChangeMinutes,
  onChangeSeconds,
  onReset,
  onShowToast,
  onAddHistory,
}) => {
  const h = parseInt(hours, 10) || 0;
  const m = parseInt(minutes, 10) || 0;
  const s = parseInt(seconds, 10) || 0;

  const totalSecs = timeToTotalSeconds(h, m, s);

  const handleSetTime = (hVal: number, mVal: number, sVal: number) => {
    onChangeHours(String(hVal));
    onChangeMinutes(String(mVal));
    onChangeSeconds(String(sVal));
    const total = timeToTotalSeconds(hVal, mVal, sVal);
    const formatted = `${formatPad(hVal)}:${formatPad(mVal)}:${formatPad(sVal)}`;
    onShowToast(`Tiempo actualizado a ${formatted}`);
    onAddHistory('Tiempo a Segundos', formatted, `${total} seg`, 'time-to-sec');
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
      text = window.prompt('Pega aquí la hora en formato HH:MM:SS') || '';
    }

    const parsed = parseTimeString(text);
    if (!parsed) {
      onShowToast('Pega una hora válida (ej. HH:MM:SS, 2h 30m o 1.5h)', true);
      return;
    }

    onChangeHours(String(parsed.hours));
    onChangeMinutes(String(parsed.minutes));
    onChangeSeconds(String(parsed.seconds));

    const total = timeToTotalSeconds(parsed.hours, parsed.minutes, parsed.seconds);
    const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
    onShowToast(`¡Hora pegada! 📋 ${formatted} (${total.toLocaleString()} seg)`);
    onAddHistory('Tiempo a Segundos', formatted, `${total} seg`, 'time-to-sec');
  };

  const handleNativePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      onChangeHours(String(parsed.hours));
      onChangeMinutes(String(parsed.minutes));
      onChangeSeconds(String(parsed.seconds));

      const total = timeToTotalSeconds(parsed.hours, parsed.minutes, parsed.seconds);
      const formatted = `${formatPad(parsed.hours)}:${formatPad(parsed.minutes)}:${formatPad(parsed.seconds)}`;
      onShowToast(`¡Hora pegada automáticamente! 📋 ${formatted}`);
      onAddHistory('Tiempo a Segundos', formatted, `${total} seg`, 'time-to-sec');
    }
  };

  const handleCopyResult = async () => {
    const success = await copyToClipboardFallback(String(totalSecs));
    if (success) {
      onShowToast(`¡Copiado al portapapeles: ${totalSecs.toLocaleString()} seg!`);
    } else {
      onShowToast('Error al intentar copiar', true);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex-grow flex flex-col justify-between">
        <div>
          {/* Header Badge & Reset */}
          <div className="flex justify-between items-center mb-4 relative z-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
              Tiempo a Segundos
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
            <Timer className="w-5 h-5 text-purple-500" />
            Convertir Tiempo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-normal leading-relaxed">
            Ingresa horas, minutos y segundos por separado para calcular el total acumulado.
            <span className="text-purple-600 dark:text-purple-400 font-semibold block mt-1 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5" /> Copia y pega un tiempo completo (ej: 14:35:25 o 2h 30m).
            </span>
          </p>

          {/* Time inputs + Paste button */}
          <div className="flex gap-2 items-end mb-5">
            <div className="grid grid-cols-3 gap-2.5 flex-1">
              {/* Hours */}
              <div className="space-y-1.5">
                <label htmlFor="inputHours" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Horas
                </label>
                <input
                  type="number"
                  id="inputHours"
                  min="0"
                  inputMode="numeric"
                  placeholder="00"
                  value={hours}
                  onPaste={handleNativePaste}
                  onChange={(e) => onChangeHours(e.target.value.replace(/[^\d]/g, ''))}
                  className="w-full text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 text-base text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>

              {/* Minutes */}
              <div className="space-y-1.5">
                <label htmlFor="inputMinutes" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Minutos
                </label>
                <input
                  type="number"
                  id="inputMinutes"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="00"
                  value={minutes}
                  onPaste={handleNativePaste}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(val, 10) > 59) val = '59';
                    onChangeMinutes(val);
                  }}
                  className="w-full text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 text-base text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>

              {/* Seconds */}
              <div className="space-y-1.5">
                <label htmlFor="inputSecs" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
                  Segundos
                </label>
                <input
                  type="number"
                  id="inputSecs"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="00"
                  value={seconds}
                  onPaste={handleNativePaste}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(val, 10) > 59) val = '59';
                    onChangeSeconds(val);
                  }}
                  className="w-full text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 text-base text-slate-900 dark:text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-semibold transition-all shadow-sm h-[48px]"
              title="Pegar tiempo HH:MM:SS"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Pegar</span>
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="mb-6">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Prueba rápida:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '0:15:30', h: 0, m: 15, s: 30 },
                { label: '2:30:00', h: 2, m: 30, s: 0 },
                { label: '12:00:00', h: 12, m: 0, s: 0 },
                { label: '24:00:00', h: 24, m: 0, s: 0 },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSetTime(chip.h, chip.m, chip.s)}
                  className="text-xs bg-slate-100 dark:bg-slate-800/40 hover:bg-purple-500/10 dark:hover:bg-purple-500/20 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/30 hover:border-purple-500/30 transition-all font-medium"
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
            <div className="text-4xl font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 mb-4 transition-all">
              {totalSecs.toLocaleString()}
            </div>

            <div className="w-full text-center border-t border-slate-200 dark:border-slate-800/60 pt-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                {totalSecs === 1 ? 'Exactamente 1 segundo' : 'Segundos totales acumulados'}
              </span>
            </div>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyResult}
            className="absolute top-3 right-3 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-purple-500/30 transition-all z-20 shadow-sm"
            title="Copiar segundos totales"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
