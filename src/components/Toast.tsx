import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      id="toastContainer"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              isError
                ? 'bg-rose-100/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                : isInfo
                ? 'bg-sky-100/95 dark:bg-sky-950/90 border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                : 'bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isError ? (
                <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400 shrink-0" />
              ) : isInfo ? (
                <Info className="w-5 h-5 text-sky-500 dark:text-sky-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
              )}
              <span className="font-medium text-xs sm:text-sm">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
