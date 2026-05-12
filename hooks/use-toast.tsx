"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/utils/cn";

type Toast = {
  id: string;
  type: "success" | "error";
  message: string;
};

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((nextToast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...nextToast, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-5 top-5 z-50 flex w-[320px] flex-col gap-3">
        {toasts.map((item) => {
          const Icon = item.type === "success" ? CheckCircle2 : XCircle;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-[10px] border bg-white p-4 text-[13px] font-semibold shadow-card",
                item.type === "success" ? "border-green-100 text-green-700" : "border-red-100 text-brand-red"
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span>{item.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
