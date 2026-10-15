import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200 bg-white text-slate-800';
        let icon = <Info className="w-5 h-5 text-indigo-600 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-950';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 bg-rose-50/95 text-rose-950';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-amber-50/95 text-amber-950';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className="font-semibold text-xs uppercase tracking-wide opacity-90 mb-0.5">
                  {toast.title}
                </div>
              )}
              <div className="text-sm font-medium leading-snug">{toast.message}</div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
