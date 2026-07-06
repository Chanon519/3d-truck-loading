"use client";

// การ์ดคำเตือนจากการวางแผน 1 รายการ — โทน amber + ข้อเสนอแนะจากระบบ
import { ArrowRight, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PLAN_STATUS_LABEL, PLAN_STATUS_TONE } from "@/lib/labels";

export interface PlanWarning {
  id: string;
  title: string;
  detail: string;
  action: string; // ข้อเสนอแนะเพื่อแก้ความเสี่ยง
}

export function PlanWarningCard({ warning }: { warning: PlanWarning }) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <TriangleAlert className="h-5 w-5" />
        </div>
        <Badge tone={PLAN_STATUS_TONE.has_warning}>
          {PLAN_STATUS_LABEL.has_warning}
        </Badge>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-900">{warning.title}</p>
      <p className="mt-1 flex-1 text-sm text-slate-600">{warning.detail}</p>
      <div className="mt-3 flex items-start gap-1.5 border-t border-amber-200/70 pt-3 text-sm font-medium text-amber-800">
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{warning.action}</span>
      </div>
    </div>
  );
}
