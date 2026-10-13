import React from 'react';
import { RotateCcw, LucideProps } from 'lucide-react';

export type Accent = 'indigo' | 'violet' | 'emerald' | 'amber';

const ACCENT_TEXT: Record<Accent, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400',
  violet: 'text-violet-600 dark:text-violet-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
};

const ACCENT_BG: Record<Accent, string> = {
  indigo: 'bg-indigo-500/10 dark:bg-indigo-500/15',
  violet: 'bg-violet-500/10 dark:bg-violet-500/15',
  emerald: 'bg-emerald-500/10 dark:bg-emerald-500/15',
  amber: 'bg-amber-500/10 dark:bg-amber-500/15',
};

interface CardHeaderProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  description: string;
  accent: Accent;
  onReset: () => void;
  /** Optional control rendered next to the reset button (e.g. the sum/subtract toggle). */
  actions?: React.ReactNode;
}

/**
 * Single source of truth for the four converter cards' headers.
 * Previously each card repeated both a coloured pill badge and an <h2> with the
 * same wording, which added visual noise without adding information.
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  icon: Icon,
  title,
  description,
  accent,
  onReset,
  actions,
}) => (
  <header className="mb-5">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-xl ${ACCENT_BG[accent]} ${ACCENT_TEXT[accent]}`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <button
          type="button"
          onClick={onReset}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Limpiar esta sección"
          aria-label="Limpiar esta sección"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>

    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      {description}
    </p>
  </header>
);
