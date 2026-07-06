"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* overlay เข้ม — คลิกเพื่อปิด */}
      <div
        className="absolute inset-0 bg-charcoal-ink/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative flex max-h-[85vh] w-full flex-col rounded-cards bg-white shadow-overlay ${
          wide ? "max-w-3xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <h2 className="min-w-0 truncate text-base font-semibold text-charcoal-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="shrink-0 rounded-inputs p-1 text-slate-mid transition-colors hover:bg-bone hover:text-charcoal-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="thin-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-hairline px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
