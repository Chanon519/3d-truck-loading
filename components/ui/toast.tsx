"use client";

import { create } from "zustand";
import { CircleAlert, CircleCheck, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  msg: string;
  tone: ToastTone;
}

interface ToastStore {
  toasts: ToastItem[];
  add: (msg: string, tone?: ToastTone) => void;
  remove: (id: number) => void;
}

let nextId = 1;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (msg, tone = "info") => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, msg, tone }] }));
    // หายเองใน 3 วินาที
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function useToast(): {
  toast: (msg: string, tone?: "success" | "error" | "info") => void;
} {
  const add = useToastStore((s) => s.add);
  return { toast: add };
}

// map class เต็มทุกโทน — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
const TONE_CLASS: Record<ToastTone, string> = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-charcoal-ink",
};

const TONE_ICON: Record<ToastTone, LucideIcon> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => {
        const Icon = TONE_ICON[t.tone];
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => remove(t.id)}
            className={`pointer-events-auto flex items-start gap-2.5 rounded-cards px-4 py-3 text-left text-sm text-white shadow-overlay ${TONE_CLASS[t.tone]}`}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1">{t.msg}</span>
          </button>
        );
      })}
    </div>
  );
}
