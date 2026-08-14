import React, { useState } from 'react';
import { calculateTimeAddition, parseTimeString, copyToClipboardFallback, formatPad } from '../utils/timeUtils';
import { PlusCircle, MinusCircle, RotateCcw, Copy, ClipboardPaste, Plus, Minus } from 'lucide-react';

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

  return (
    <section className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-lg dark:shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex-grow flex flex-col justify-between">
        <div>
          {/* Header Badge, Operation Toggle & Reset */}
          <div className="flex justify-between items-center mb-4 relative z-20 gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
              Suma / Resta de Tiempo
            </span>

            <div className="flex items-center gap-2">
              {/* Toggle Addition/Subtraction */}
              <div className="bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsAddition(true)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    isAddition
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Sumar segundos"
                >
                  <Plus className="w-3 h-3" />
                  Suma
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddition(false)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    !isAddition
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Restar segundos"
                >
                  <Minus className="w-3 h-3" />
                  Resta
                </button>
              </div>

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
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            {isAddition ? (
              <PlusCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <MinusCircle className="w-5 h-5 text-rose-500" />
            )}
            {isAddition ? 'Sumar al Tiempo' : 'Restar al Tiempo'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-normal leading-relaxed">
            Ingresa una hora base y agrégale o réstale cualquier cantidad de segundos enteros.
          </p>

          {/* Base Time Input */}
          <div className="space-y-4 mb-5">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Tiempo Base
                </span>
                <button
                  type="button"
                  onClick={handlePasteBase}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                  title="Pegar tiempo base"
                >
                  <ClipboardPaste className="w-3 h-3 text-amber-500" />
                  Pegar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="HH"
                  value={addHA}
                  onPaste={handleNativePasteBase}
                  onChange={(e) => onChangeBase(e.target.value.replace(/[^\d]/g, ''), addMA, addSA)}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="MM"
                  value={addMA}
                  onPaste={handleNativePasteBase}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeBase(addHA, v, addSA);
                  }}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
                />
                <input
                  type="number"
                  min="0"
                  max="59"
                  inputMode="numeric"
                  placeholder="SS"
                  value={addSA}
                  onPaste={handleNativePasteBase}
                  onChange={(e) => {
                    let v = e.target.value.replace(/[^\d]/g, '');
                    if (parseInt(v, 10) > 59) v = '59';
                    onChangeBase(addHA, addMA, v);
                  }}
                  className="text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-1.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Delta Seconds Input */}
            <div className="space-y-1.5">
              <label htmlFor="addSecsInput" className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Segundos a {isAddition ? 'sumar' : 'restar'}
              </label>
              <div className="flex gap-2 items-stretch">
                <div className="relative flex-1">
                  <input
                    type="number"
                    id="addSecsInput"
                    min="0"
                    inputMode="numeric"
                    placeholder="Ej. 3600"
                    value={addSecsInput}
                    onPaste={handleNativePasteDelta}
                    onChange={(e) => onChangeDelta(e.target.value.replace(/[^\d]/g, ''))}
                    className="w-full bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-base text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 pointer-events-none">
                    {isAddition ? '+ seg' : '- seg'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handlePasteDelta}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 text-xs font-semibold transition-all shadow-sm"
                  title="Pegar segundos"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  <span>Pegar</span>
                </button>
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
                onClick={() => handleSetAddPreset(1, 30, 0, 1800, true)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/40 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/30 hover:border-amber-500/30 transition-all font-medium"
              >
                01:30:00 + 1800s (30m)
              </button>
              <button
                type="button"
                onClick={() => handleSetAddPreset(23, 45, 0, 7200, true)}
                className="text-[11px] bg-slate-100 dark:bg-slate-800/40 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/30 hover:border-amber-500/30 transition-all font-medium"
              >
                23:45:00 + 7200s (2h)
              </button>
            </div>
          </div>
        </div>

        {/* Result Container */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 relative mt-auto">
          <span className="absolute -top-2.5 left-4 bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Resultado de {isAddition ? 'Suma' : 'Resta'}
          </span>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="text-4xl font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 mb-4 transition-all">
              {additionResult.formatted}
            </div>

            <div className="w-full text-center border-t border-slate-200 dark:border-slate-800/60 pt-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Acumulado: {additionResult.finalSecs.toLocaleString()} segundos
              </span>
            </div>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyResult}
            className="absolute top-3 right-3 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/30 transition-all z-20 shadow-sm"
            title="Copiar resultado"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
