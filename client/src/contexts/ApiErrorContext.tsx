import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface ApiErrorRecord {
  id: string;
  url: string;
  status: number;
  errorData: any;
  timestamp: string;
}

interface ApiErrorContextType {
  errors: ApiErrorRecord[];
  addError: (url: string, status: number, errorData: any) => void;
  dismissError: (id: string) => void;
  clearAll: () => void;
}

const ApiErrorContext = createContext<ApiErrorContextType | undefined>(undefined);

export function ApiErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ApiErrorRecord[]>([]);

  const addError = (url: string, status: number, errorData: any) => {
    const newRecord: ApiErrorRecord = {
      id: Math.random().toString(36).substring(2, 9),
      url,
      status,
      errorData,
      timestamp: new Date().toLocaleTimeString(),
    };
    setErrors((prev) => [newRecord, ...prev.slice(0, 9)]); // keep last 10
  };

  const dismissError = (id: string) => {
    setErrors((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAll = () => setErrors([]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      try {
        const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : String(args[0]);
        if (url.includes("/api/") && !response.ok) {
          const cloned = response.clone();
          let errorData;
          const contentType = cloned.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            errorData = await cloned.json();
          } else {
            errorData = { error: await cloned.text() };
          }
          addError(url, response.status, errorData);
        }
      } catch (err) {
        // Ignore fetch interception parsing errors
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <ApiErrorContext.Provider value={{ errors, addError, dismissError, clearAll }}>
      {children}
    </ApiErrorContext.Provider>
  );
}

export function useApiErrors() {
  const context = useContext(ApiErrorContext);
  if (!context) throw new Error("useApiErrors must be used within an ApiErrorProvider");
  return context;
}
