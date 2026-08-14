import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { copyToClipboardFallback } from '../utils/timeUtils';
import { X, Search, Trash2, Star, Copy, History, Sparkles } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onClearHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onToggleFavorite,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);

  if (!isOpen) return null;

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.result.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFav = filterFavorites ? item.isFavorite : true;
    return matchesSearch && matchesFav;
  });

  const handleCopy = async (result: string) => {
    const ok = await copyToClipboardFallback(result);
    if (ok) {
      onShowToast(`¡Resultado copiado: ${result}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Historial de Conversiones
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en el historial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setFilterFavorites(!filterFavorites)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-all ${
                filterFavorites
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/30'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Favoritos
            </button>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Vaciar historial
              </button>
            )}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-medium">No hay registros en el historial</p>
              <p className="text-xs text-slate-500">
                Las conversiones que realices aparecerán aquí automáticamente.
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between group hover:border-purple-500/30 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    Entrada: <strong className="text-slate-900 dark:text-slate-200">{item.input}</strong>
                  </div>
                  <div className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                    {item.result}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      item.isFavorite
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-slate-400 hover:text-amber-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                    }`}
                    title={item.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    onClick={() => handleCopy(item.result)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-colors"
                    title="Copiar resultado"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
