"use client";

import { useToastStore } from "@/stores/toast-store";

export function ToastRegion() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-3xl border px-4 py-3 shadow-soft ${
            toast.type === "error"
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm leading-6">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-xs font-medium uppercase tracking-[0.16em]"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
