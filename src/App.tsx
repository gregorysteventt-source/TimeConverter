import { useState, useEffect } from 'react';
import { ThemeMode, ToastMessage, HistoryItem } from './types';
import { Header } from './components/Header';
import { SecondsToTimeCard } from './components/SecondsToTimeCard';
import { TimeToSecondsCard } from './components/TimeToSecondsCard';
import { TimeDifferenceCard } from './components/TimeDifferenceCard';
import { TimeAdditionCard } from './components/TimeAdditionCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Toast } from './components/Toast';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('tempus_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('tempus_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, isError = false) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = {
      id,
      message,
      type: isError ? 'error' : 'success',
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // History System
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tempus_history');
      if (saved) {
        return JSON.parse(saved).map((item: HistoryItem) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('tempus_history', JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  const addHistory = (
    title: string,
    input: string,
    result: string,
    category: HistoryItem['category']
  ) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      title,
      input,
      result,
      category,
      isFavorite: false,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('Historial vaciado');
  };

  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // State Section 1: Segundos a Tiempo
  const [sec1Input, setSec1Input] = useState<string>('');

  // State Section 2: Tiempo a Segundos
  const [sec2Hours, setSec2Hours] = useState<string>('');
  const [sec2Minutes, setSec2Minutes] = useState<string>('');
  const [sec2Seconds, setSec2Seconds] = useState<string>('');

  // State Section 3: Resta / Diferencia de Tiempo
  const [diffHA, setDiffHA] = useState<string>('');
  const [diffMA, setDiffMA] = useState<string>('');
  const [diffSA, setDiffSA] = useState<string>('');
  const [diffHB, setDiffHB] = useState<string>('');
  const [diffMB, setDiffMB] = useState<string>('');
  const [diffSB, setDiffSB] = useState<string>('');

  // State Section 4: Suma / Resta a Tiempo Base
  const [addHA, setAddHA] = useState<string>('');
  const [addMA, setAddMA] = useState<string>('');
  const [addSA, setAddSA] = useState<string>('');
  const [addSecsInput, setAddSecsInput] = useState<string>('');

  // Reset Functions
  const resetSection1 = () => {
    setSec1Input('');
    showToast("Campos de 'Segundos a Tiempo' limpiados");
  };

  const resetSection2 = () => {
    setSec2Hours('');
    setSec2Minutes('');
    setSec2Seconds('');
    showToast("Campos de 'Tiempo a Segundos' limpiados");
  };

  const resetSection3 = () => {
    setDiffHA('');
    setDiffMA('');
    setDiffSA('');
    setDiffHB('');
    setDiffMB('');
    setDiffSB('');
    showToast("Campos de 'Diferencia de Tiempo' limpiados");
  };

  const resetSection4 = () => {
    setAddHA('');
    setAddMA('');
    setAddSA('');
    setAddSecsInput('');
    showToast("Campos de 'Suma/Resta de Tiempo' limpiados");
  };

  const resetAll = () => {
    setSec1Input('');
    setSec2Hours('');
    setSec2Minutes('');
    setSec2Seconds('');
    setDiffHA('');
    setDiffMA('');
    setDiffSA('');
    setDiffHB('');
    setDiffMB('');
    setDiffSB('');
    setAddHA('');
    setAddMA('');
    setAddSA('');
    setAddSecsInput('');
    showToast('Todos los conversores han sido limpiados');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-300 font-sans">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetAll={resetAll}
        historyCount={history.length}
        onToggleHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Grid Content */}
      <main className="max-w-7xl w-full mx-auto px-4 py-8 flex-grow flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* SECTION 1: Segundos a HH:MM:SS */}
          <SecondsToTimeCard
            secondsInput={sec1Input}
            onChangeSeconds={setSec1Input}
            onReset={resetSection1}
            onShowToast={showToast}
            onAddHistory={addHistory}
          />

          {/* SECTION 2: HH:MM:SS a Segundos */}
          <TimeToSecondsCard
            hours={sec2Hours}
            minutes={sec2Minutes}
            seconds={sec2Seconds}
            onChangeHours={setSec2Hours}
            onChangeMinutes={setSec2Minutes}
            onChangeSeconds={setSec2Seconds}
            onReset={resetSection2}
            onShowToast={showToast}
            onAddHistory={addHistory}
          />

          {/* SECTION 3: Diferencia de Tiempos */}
          <TimeDifferenceCard
            diffHA={diffHA}
            diffMA={diffMA}
            diffSA={diffSA}
            diffHB={diffHB}
            diffMB={diffMB}
            diffSB={diffSB}
            onChangeA={(h, m, s) => {
              setDiffHA(h);
              setDiffMA(m);
              setDiffSA(s);
            }}
            onChangeB={(h, m, s) => {
              setDiffHB(h);
              setDiffMB(m);
              setDiffSB(s);
            }}
            onReset={resetSection3}
            onShowToast={showToast}
            onAddHistory={addHistory}
          />

          {/* SECTION 4: Suma / Resta a Tiempo Base */}
          <TimeAdditionCard
            addHA={addHA}
            addMA={addMA}
            addSA={addSA}
            addSecsInput={addSecsInput}
            onChangeBase={(h, m, s) => {
              setAddHA(h);
              setAddMA(m);
              setAddSA(s);
            }}
            onChangeDelta={setAddSecsInput}
            onReset={resetSection4}
            onShowToast={showToast}
            onAddHistory={addHistory}
          />
        </div>
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={clearHistory}
        onToggleFavorite={toggleFavorite}
        onShowToast={showToast}
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-6 text-center text-xs text-slate-500 transition-colors duration-300">
        <p>© 2026 TempusConv. Diseñado con precisión para conversiones de tiempo en cualquier entorno.</p>
      </footer>
    </div>
  );
}
