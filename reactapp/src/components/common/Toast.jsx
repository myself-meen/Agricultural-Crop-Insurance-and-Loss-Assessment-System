import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/90 border-blue-500/50 text-slate-200',
      icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    },
  }[type] || {
    bg: 'bg-slate-900 border-slate-700 text-slate-200',
    icon: <Info className="w-5 h-5 text-slate-400 shrink-0" />,
  };

  return (
    <div
      className={`fixed bottom-6 right-6 max-w-md p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 ${typeConfig.bg}`}
      role="alert"
    >
      {typeConfig.icon}
      <div className="text-sm font-medium pr-2 leading-snug">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-auto text-slate-400 hover:text-white p-1 rounded-md"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Toast;
