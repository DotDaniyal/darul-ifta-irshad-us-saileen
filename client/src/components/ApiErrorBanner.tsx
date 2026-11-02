import React from "react";
import { useApiErrors } from "../contexts/ApiErrorContext";
import { AlertCircle, X, Trash2, Copy, Check } from "lucide-react";

export function ApiErrorBanner() {
  const { errors, dismissError, clearAll } = useApiErrors();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (errors.length === 0) return null;

  const handleCopy = (id: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside aria-label="API Errors" className="fixed bottom-4 right-4 z-50 max-w-lg w-full px-4 flex flex-col gap-3 font-sans">
      <div className="bg-red-950/95 dark:bg-red-950/95 backdrop-blur border-2 border-red-500 text-white rounded-xl shadow-2xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 animate-pulse" />
            <h2 className="font-bold text-sm tracking-wide text-red-200">
              API Error Encountered ({errors.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAll}
              className="text-xs text-red-300 hover:text-white flex items-center gap-1 bg-red-900/60 px-2 py-1 rounded transition"
              title="Clear all API errors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        <div className="mt-3 max-h-64 overflow-y-auto space-y-2.5 pr-1">
          {errors.map((err) => (
            <div
              key={err.id}
              className="bg-red-900/40 border border-red-700/60 rounded-lg p-3 text-xs relative group"
            >
              <div className="flex items-center justify-between text-red-300 mb-1 font-mono">
                <span className="truncate max-w-[280px]" title={err.url}>
                  [{err.status}] {err.url}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-red-400">{err.timestamp}</span>
                  <button
                    onClick={() => handleCopy(err.id, err.errorData)}
                    className="text-red-300 hover:text-white transition p-0.5"
                    title="Copy JSON response"
                  >
                    {copiedId === err.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissError(err.id)}
                    className="text-red-300 hover:text-white transition p-0.5"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <pre className="bg-black/55 text-red-100 p-2 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(err.errorData, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
