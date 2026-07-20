"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ToastVariant = "error" | "success" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  durationMs: number;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
});

export const useToast = () => useContext(ToastContext);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "error", durationMs = 6000) => {
      const id = `toast-${++toastCounter}-${Date.now()}`;
      setToasts((prev) => [...prev, { id, message, variant, durationMs }]);

      // auto-dismiss
      setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast container — bottom-right, stacked */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-4 left-4 sm:left-auto z-[9999] flex flex-col-reverse gap-3 pointer-events-none sm:max-w-[420px] sm:w-full"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Individual toast card                                              */
/* ------------------------------------------------------------------ */

const variantConfig: Record<
  ToastVariant,
  {
    icon: typeof AlertCircle;
    bgLight: string;
    bgDark: string;
    borderLight: string;
    borderDark: string;
    textLight: string;
    textDark: string;
    barLight: string;
    barDark: string;
  }
> = {
  error: {
    icon: AlertCircle,
    bgLight: "bg-white",
    bgDark: "dark:bg-dark-surface",
    borderLight: "border-red-200",
    borderDark: "dark:border-red-800/50",
    textLight: "text-red-600",
    textDark: "dark:text-red-400",
    barLight: "bg-red-500",
    barDark: "dark:bg-red-400",
  },
  success: {
    icon: CheckCircle2,
    bgLight: "bg-white",
    bgDark: "dark:bg-dark-surface",
    borderLight: "border-green-200",
    borderDark: "dark:border-green-800/50",
    textLight: "text-green-600",
    textDark: "dark:text-green-400",
    barLight: "bg-green-500",
    barDark: "dark:bg-green-400",
  },
  warning: {
    icon: AlertTriangle,
    bgLight: "bg-white",
    bgDark: "dark:bg-dark-surface",
    borderLight: "border-amber-200",
    borderDark: "dark:border-amber-800/50",
    textLight: "text-amber-600",
    textDark: "dark:text-amber-400",
    barLight: "bg-amber-500",
    barDark: "dark:bg-amber-400",
  },
  info: {
    icon: Info,
    bgLight: "bg-white",
    bgDark: "dark:bg-dark-surface",
    borderLight: "border-blue-200",
    borderDark: "dark:border-blue-800/50",
    textLight: "text-blue-600",
    textDark: "dark:text-blue-400",
    barLight: "bg-blue-500",
    barDark: "dark:bg-blue-400",
  },
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const cfg = variantConfig[toast.variant];
  const Icon = cfg.icon;

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto
        rounded-xl border shadow-lg
        ${cfg.bgLight} ${cfg.bgDark}
        ${cfg.borderLight} ${cfg.borderDark}
        animate-slide-in
        overflow-hidden
        transition-all duration-300
      `}
      style={{
        animation: "toast-slide-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
      }}
    >
      {/* Content */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <Icon
          className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.textLight} ${cfg.textDark}`}
        />
        <p className="text-sm font-medium text-text-main dark:text-dark-text-main flex-1 leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer p-0.5 -mt-0.5 -mr-1"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-dark-surface-raised">
        <div
          className={`h-full ${cfg.barLight} ${cfg.barDark} rounded-br-xl`}
          style={{
            animation: `toast-progress ${toast.durationMs}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}
