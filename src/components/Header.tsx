import React from 'react';
import { ThemeMode } from '../types';
import { Clock, Sun, Moon, Trash2, History, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onResetAll: () => void;
  historyCount: number;
  onToggleHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onResetAll,
  historyCount,
  onToggleHistory,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 dark:from-indigo-400 dark:via-purple-400 dark:to-emerald-400 bg-clip-text text-transparent">
                TempusConv
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <Sparkles className="w-3 h-3" /> Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Conversor y calculadora de tiempo integral
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* History Button */}
          <button
            onClick={onToggleHistory}
            className="relative p-2.5 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2 shadow-sm text-xs font-medium"
            title="Ver historial de conversiones"
          >
            <History className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            <span className="hidden sm:inline">Historial</span>
            {historyCount > 0 && (
              <span className="bg-purple-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 inline-flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset All Button */}
          <button
            onClick={onResetAll}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-slate-100 dark:bg-slate-800/40 hover:bg-rose-500/10 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/50 hover:border-rose-500/20 transition-all flex items-center gap-1.5 shadow-sm font-medium"
            title="Limpiar todos los conversores"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpiar Todo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
