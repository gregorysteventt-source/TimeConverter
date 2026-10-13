import React, { useState } from 'react';
import { calculateTimeAddition, parseTimeString, copyToClipboardFallback, formatPad } from '../utils/timeUtils';
import { PlusCircle, MinusCircle, Copy, ClipboardPaste, Plus, Minus } from 'lucide-react';
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
  const [isAddition, setIsAddition] = useState<boolean>(true);

  const h = parseInt(addHA, 10) || 0;
  const m = parseInt(addMA, 10) || 0;
  const s = parseInt(addSA, 10) || 0;
  const deltaSecs = parseInt(addSecsInput, 10) || 0;

  const additionResult = calculateTimeAddition(h, m, s, deltaSecs, isAddition);
  const hasInput = Boolean(addHA || addMA || addSA || addSecsInput);

  const handleSetAddPreset = (hVal: number, mVal: number, sVal: number, addSecsVal: number, additionMode = true) => {
    setIsAddition(additionMode);
    onChangeBase(String(hVal), String(mVal), String(sVal));
    onChangeDelta(String(addSecsVal));
    const res = calculateTimeAddition(hVal, mVal, sVal, addSecsVal, additionMode);
    onShowToast('Valores de suma configurados');
    const symbol = additionMode ? '+' : '-';
    const inputStr = `${formatPad(hVal)}:${formatPad(mVal)}:${formatPad(sVal)} ${symbol} ${addSecsVal}s`;
    onAddHistory('Suma/Resta de Tiempo', inputStr, `${res.formatted} (${res.finalSecs}s)`, 'add');
  };

  const handlePasteBase = async () => {
    let text = '';
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch {
      text = '';
    }

    if (!text) {
      text = window.prompt('Pega aquí la hora base (HH:MM:SS)') || '';
    }

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
    let text = '';
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        text = await navigator.clipboard.readText();
      }
    } catch {
      text = '';
    }

    if (!text) {
      text = window.prompt('Pega los segundos a sumar/restar') || '';
    }

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
    const parsed = parseTimeString(text);
    if (parsed) {
      e.preventDefault();
      const totalSecs = parsed.hours * 3600 + parsed.minutes * 60 + parsed.seconds;
      onChangeDelta(String(totalSecs));
      onShowToast(`¡Tiempo pegado como ${totalSecs.toLocaleString()} segundos! 📋`);
    } else {
      const cleaned = text.trim().replace(/,/g, '');
      if (/^\d+$/.test(cleaned)) {
        e.preventDefault();
        onChangeDelta(cleaned);
        onShowToast(`¡Segundos pegados: ${Number(cleaned).toLocaleString()}s! 📋`);
      }
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

  const modeButton = (active: boolean, kind: 'add' | 'sub') => {
    const activeClass =
      kind === 'add' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white';
    return `px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 ${
      active ? activeClass : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
    }`;
  };

  return (
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col shadow-sm hover:border-amber-500/30 transition-colors duration-300">
      <CardHeader
        icon={isAddition ? PlusCircle : MinusCircle}
        accent="amber"
        title={isAddition ? 'Sumar al tiempo' : 'Restar al tiempo'}
        description="Ingresa una hora base y agrégale o réstale cualquier cantidad de segundos enteros."
        onReset={onReset}
        actions={
          <div className="bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center">
            <button
              type="button"
              onClick={() => setIsAddition(true)}
              className={modeButton(isAddition, 'add')}
              title="Sumar segundos"
            >
              <Plus className="w-3 h-3" />
              Suma
            </button>
            <button
              type="button"
              onClick={() => setIsAddition(false)}
              className={modeButton(!isAddition, 'sub')}
              title="Restar segundos"
            >
              <Minus className="w-3 h-3" />
              Resta
            </button>
          </div>
        }
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
                  title="Pegar tiempo base"
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

            {/* Delta seconds */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Segundos a {isAddition ? 'sumar' : 'restar'}
                </span>
                <button
                  type="button"
                  onClick={handlePasteDelta}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  title="Pegar segundos"
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
                  placeholder="Ej. 3600"
                  value={addSecsInput}
                  onPaste={handleNativePasteDelta}
                  onChange={(e) => onChangeDelta(e.target.value.replace(/[^\d]/g, ''))}
                  className={`${smallFieldClass} pl-4 pr-16 text-left`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 dark:text-slate-500 pointer-events-none">
                  {isAddition ? '+ seg' : '− seg'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-4">
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-2">
              Valores rápidos
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSetAddPreset(1, 30, 0, 1800, true)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/50 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 transition-colors font-medium tabular-nums"
              >
                01:30:00 + 30m
              </button>
              <button
                type="button"
                onClick={() => handleSetAddPreset(23, 45, 0, 7200, true)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/50 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700/50 hover:border-amber-500/30 transition-colors font-medium tabular-nums"
              >
                23:45:00 + 2h
              </button>
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
