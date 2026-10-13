import React from 'react';
import { secondsToBreakdown, copyToClipboardFallback, parseTimeString } from '../utils/timeUtils';
import { Clock, Copy, ClipboardPaste } from 'lucide-react';
import { CardHeader } from './CardHeader';

interface SecondsToTimeCardProps {
  secondsInput: string;
  onChangeSeconds: (val: string) => void;
  onReset: () => void;
  onShowToast: (msg: string, isError?: boolean) => void;
  onAddHistory: (title: string, input: string, result: string, category: 'sec-to-time') => void;
}

const SECONDS_PRESETS = [
  { label: '45s', sec: 45 },
  { label: '1h', sec: 3600 },
  { label: '1d', sec: 86400 },
  { label: '1 sem', sec: 604800 },
];

export const SecondsToTimeCard: React.FC<SecondsToTimeCardProps> = ({
  secondsInput,
  onChangeSeconds,
  onReset,
  onShowToast,
  onAddHistory,
}) => {
  const numSecs = parseInt(secondsInput, 10) || 0;
  const breakdown = secondsToBreakdown(numSecs);
  const hasInput = secondsInput !== '';

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
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm hover:border-indigo-500/30 transition-colors duration-300">
      <CardHeader
        icon={Clock}
        accent="indigo"
        title="Convertir segundos"
        description="Ingresa una cantidad entera de segundos para obtener el formato estructurado en horas, minutos y segundos."
        onReset={onReset}
      />

      <div className="flex-grow flex flex-col">
        {/* Input field */}
        <div className="space-y-2 mb-4">
          <label
            htmlFor="inputSeconds"
            className="block text-[11px] font-medium text-slate-500 dark:text-slate-400"
          >
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
                className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-14 py-3 text-lg text-slate-900 dark:text-white font-mono tabular-nums focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500 pointer-events-none">
                seg
              </span>
            </div>
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center justify-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-medium transition-colors"
              title="Pegar segundos totales"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Pegar</span>
            </button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="mb-5">
          <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
            Valores rápidos
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SECONDS_PRESETS.map((chip) => (
              <button
                key={chip.sec}
                type="button"
                onClick={() => handleSetQuick(chip.sec)}
                className="text-xs bg-slate-100 dark:bg-slate-800/50 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500/30 transition-colors font-medium tabular-nums"
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
              Resultado
            </span>
            <button
              type="button"
              onClick={handleCopyResult}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Copiar formato HH:MM:SS"
              aria-label="Copiar resultado"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div
            className={`text-center font-mono tabular-nums text-4xl font-semibold tracking-tight py-1 transition-colors ${
              hasInput
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-300 dark:text-slate-700'
            }`}
          >
            {breakdown.formattedHHMMSS}
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-1 w-full text-center border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
            <div>
              <span className="block text-base font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {breakdown.hours.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Horas</span>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-800">
              <span className="block text-base font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {breakdown.minutes}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Minutos</span>
            </div>
            <div>
              <span className="block text-base font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
                {breakdown.seconds}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Segundos</span>
            </div>
          </div>

          {/* Extended metrics for spans over 24h */}
          {breakdown.days > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 w-full text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-3 tabular-nums">
              <span>
                Días:{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">{breakdown.totalDays}d</strong>
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>
                Horas decimales:{' '}
                <strong className="text-indigo-600 dark:text-indigo-400">{breakdown.decimalHours}h</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
