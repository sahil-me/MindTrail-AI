import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
  retryLabel?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  retryLabel = 'Retry Save',
}) => {
  if (!message) return null;

  return (
    <div
      id="error-banner-container"
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-rose-900 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <p id="error-banner-title" className="text-sm font-semibold text-rose-950">
            Operation Error
          </p>
          <p id="error-banner-desc" className="text-xs text-rose-800 mt-0.5 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {onRetry && (
          <button
            id="btn-error-retry"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{retryLabel}</span>
          </button>
        )}
        <button
          id="btn-error-dismiss"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
          title="Dismiss error notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
