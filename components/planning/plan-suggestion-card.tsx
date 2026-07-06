"use client";

// การ์ดแผนที่ระบบแนะนำ 1 รายการ — แสดง badge "แนะนำ" + ปุ่มดูผลลัพธ์/ส่งแผนไปใช้งาน
import type { LucideIcon } from "lucide-react";
import { Check, Eye, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface PlanMetric {
  label: string;
  before: string;
  after: string;
  delta?: string; // คำอธิบายส่วนต่าง เช่น "ลดลง 42 กม."
}

export interface PlanSuggestion {
  id: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  impact: string; // ผลลัพธ์เด่น เช่น "ประหยัด 42 กม."
  metrics: PlanMetric[];
}

export function PlanSuggestionCard({
  suggestion,
  applied,
  onView,
  onApply,
}: {
  suggestion: PlanSuggestion;
  applied: boolean;
  onView: () => void;
  onApply: () => void;
}) {
  const Icon = suggestion.icon;
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
        <Badge tone="emerald">แนะนำ</Badge>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">
        {suggestion.title}
      </p>
      <p className="mt-1 flex-1 text-sm text-slate-500">{suggestion.detail}</p>
      <p className="mt-2 text-sm font-semibold text-emerald-600">
        {suggestion.impact}
      </p>
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
          <Eye className="h-3.5 w-3.5" />
          ดูผลลัพธ์
        </Button>
        {applied ? (
          <Button variant="secondary" size="sm" className="flex-1" disabled>
            <Check className="h-3.5 w-3.5" />
            ส่งแผนแล้ว
          </Button>
        ) : (
          <Button size="sm" className="flex-1" onClick={onApply}>
            <Send className="h-3.5 w-3.5" />
            ส่งแผนไปใช้งาน
          </Button>
        )}
      </div>
    </div>
  );
}
