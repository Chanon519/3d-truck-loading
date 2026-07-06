"use client";

// Modal เลือกทรัพยากร (รถ / คนขับ) เพื่อมอบหมายให้งานทั่วไป
import { useEffect, useState } from "react";
import { CircleCheck, SearchX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import type { BadgeTone } from "@/lib/labels";

export interface AssignOption {
  id: string;
  title: string; // ชื่อหลัก เช่น ทะเบียนรถ / ชื่อคนขับ
  subtitle: string; // รายละเอียดรอง เช่น ประเภทรถ · depot
  badgeLabel: string;
  badgeTone: BadgeTone;
}

export function AssignModal({
  open,
  title,
  description,
  options,
  emptyTitle,
  emptySubtitle,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  options: AssignOption[];
  emptyTitle: string;
  emptySubtitle?: string;
  confirmLabel: string;
  onClose: () => void;
  onConfirm: (optionId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // เคลียร์ตัวเลือกทุกครั้งที่เปิด modal ใหม่
  useEffect(() => {
    if (open) setSelectedId(null);
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) onConfirm(selectedId);
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-slate-500">{description}</p>
      {options.length === 0 ? (
        <EmptyState icon={SearchX} title={emptyTitle} subtitle={emptySubtitle} />
      ) : (
        <div className="space-y-2">
          {options.map((opt) => {
            const selected = opt.id === selectedId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedId(opt.id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selected
                    ? "border-charcoal-ink bg-bone ring-1 ring-charcoal-ink"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {opt.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {opt.subtitle}
                  </p>
                </div>
                <Badge tone={opt.badgeTone}>{opt.badgeLabel}</Badge>
                <CircleCheck
                  className={`h-5 w-5 shrink-0 ${
                    selected ? "text-charcoal-ink" : "text-slate-200"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
