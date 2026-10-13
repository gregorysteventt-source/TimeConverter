import React from 'react';
import { timeToTotalSeconds, parseTimeString, copyToClipboardFallback, formatPad } from '../utils/timeUtils';
import { Timer, Copy, ClipboardPaste } from 'lucide-react';
import { CardHeader } from './CardHeader';

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

const TIME_PRESETS = [
  { label: '0:15:30', h: 0, m: 15, s: 30 },
  { label: '2:30:00', h: 2, m: 30, s: 0 },
  { label: '12:00:00', h: 12, m: 0, s: 0 },
  { label: '24:00:00', h: 24, m: 0, s: 0 },
];

const timeFieldClass =
  'w-full text-center bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl py-3 text-base text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600';

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
  const hasInput = hours !== '' || minutes !== '' || seconds !== '';

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
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm hover:border-violet-500/30 transition-colors duration-300">
      <CardHeader
        icon={Timer}
        accent="violet"
        title="Convertir tiempo"
        description="Ingresa horas, minutos y segundos por separado para obtener el total acumulado."
        onReset={onReset}
      />

      <div className="flex-grow flex flex-col">
        {/* Time inputs + Paste button */}
        <div className="flex gap-2 items-end mb-4">
          <div className="grid grid-cols-3 gap-2.5 flex-1">
            <div className="space-y-1.5">
              <label
                htmlFor="inputHours"
                className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center"
              >
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
                className={timeFieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="inputMinutes"
                className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center"
              >
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
                className={timeFieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="inputSecs"
                className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center"
              >
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
                className={timeFieldClass}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handlePaste}
            className="inline-flex items-center justify-center gap-1.5 px-3 h-[46px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 text-xs font-medium transition-colors"
            title="Pegar tiempo HH:MM:SS"
          >
            <ClipboardPaste className="w-4 h-4" />
            <span>Pegar</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          También puedes pegar un tiempo completo (ej. <span className="font-mono">14:35:25</span> o{' '}
          <span className="font-mono">2h 30m</span>).
        </p>

        {/* Quick presets */}
        <div className="mb-5">
          <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
            Valores rápidos
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TIME_PRESETS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleSetTime(chip.h, chip.m, chip.s)}
                className="text-xs bg-slate-100 dark:bg-slate-800/50 hover:bg-violet-500/10 dark:hover:bg-violet-500/20 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-violet-500/30 transition-colors font-medium tabular-nums"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        <div className="mt-auto bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Segundos totales
            </span>
            <button
              type="button"
              onClick={handleCopyResult}
              className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Copiar segundos totales"
              aria-label="Copiar resultado"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div
            className={`text-center font-mono tabular-nums text-4xl font-semibold tracking-tight py-1 transition-colors ${
              hasInput ? 'text-violet-600 dark:text-violet-400' : 'text-slate-300 dark:text-slate-700'
            }`}
          >
            {totalSecs.toLocaleString()}
          </div>

          <div className="w-full text-center border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {totalSecs === 1
                ? 'Exactamente 1 segundo'
                : `Equivale a ${(totalSecs / 3600).toFixed(2)} horas`}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
