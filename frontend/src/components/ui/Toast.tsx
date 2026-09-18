import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import type { Toast as ToastType } from '@/types/research';

interface ToastContextValue {
  toast: (type: ToastType['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const styles = {
  success: 'border-success-200 bg-white',
  error: 'border-error-200 bg-white',
  info: 'border-primary-200 bg-white',
  warning: 'border-warning-200 bg-white',
};

const iconColors = {
  success: 'text-success-600',
  error: 'text-error-600',
  info: 'text-primary-600',
  warning: 'text-warning-600',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType['type'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 rounded-xl border ${styles[t.type]} px-4 py-3 shadow-elevated animate-slide-in-right min-w-[280px] max-w-md`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColors[t.type]}`} />
              <p className="flex-1 text-sm text-neutral-700">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="rounded p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
