import React from 'react';
import { ThemeMode } from '../types';
import { Clock, Sun, Moon, Trash2, History } from 'lucide-react';

interface HeaderProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onResetAll: () => void;
  historyCount: number;
  onToggleHistory: () => void;
}

const iconButton =
  'p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 transition-colors';

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onResetAll,
  historyCount,
  onToggleHistory,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-sm shadow-indigo-500/20 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white truncate">
              TempusConv
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Conversor y calculadora de tiempo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={iconButton}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
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
            className={`${iconButton} relative sm:px-3 flex items-center gap-2 text-xs font-medium`}
            title="Ver historial de conversiones"
          >
            <History className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            <span className="hidden sm:inline">Historial</span>
            {historyCount > 0 && (
              <span className="bg-violet-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 inline-flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset All Button */}
          <button
            onClick={onResetAll}
            className={`${iconButton} sm:px-3 flex items-center gap-1.5 text-xs font-medium hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20`}
            title="Limpiar todos los conversores"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpiar todo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
