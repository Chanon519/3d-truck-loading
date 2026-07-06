"use client";

// Modal สรุปผลลัพธ์ก่อน–หลังปรับแผน ของแผนที่ระบบแนะนำ
import { ArrowRight, Check, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { PlanSuggestion } from "./plan-suggestion-card";

export function PlanResultModal({
  suggestion,
  applied,
  onClose,
  onApply,
}: {
  suggestion: PlanSuggestion | null;
  applied: boolean;
  onClose: () => void;
  onApply: (suggestion: PlanSuggestion) => void;
}) {
  return (
    <Modal
      open={suggestion !== null}
      onClose={onClose}
      title="สรุปผลลัพธ์ก่อน–หลังปรับแผน"
      footer={
        suggestion ? (
          <>
            <Button variant="outline" onClick={onClose}>
              ปิด
            </Button>
            {applied ? (
              <Button variant="secondary" disabled>
                <Check className="h-4 w-4" />
                ส่งแผนแล้ว
              </Button>
            ) : (
              <Button onClick={() => onApply(suggestion)}>
                <Send className="h-4 w-4" />
                ส่งแผนไปใช้งาน
              </Button>
            )}
          </>
        ) : undefined
      }
    >
      {suggestion && (
        <div className="space-y-4">
          {/* สรุปแผนโดยย่อ */}
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-800">
                {suggestion.title}
              </p>
              <p className="mt-0.5 text-sm text-emerald-700">
                {suggestion.detail}
              </p>
            </div>
          </div>

          {/* ตารางเปรียบเทียบก่อน-หลัง */}
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-2.5">
              <span className="text-xs font-medium text-slate-500">
                รายการเปรียบเทียบ
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                ก่อนปรับแผน
                <ArrowRight className="h-3 w-3" />
                หลังปรับแผน
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {suggestion.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-slate-600">{metric.label}</p>
                    {metric.delta && (
                      <p className="text-xs font-medium text-emerald-600">
                        {metric.delta}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400">{metric.before}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
                    <span className="font-semibold text-emerald-700">
                      {metric.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400">
            * ตัวเลขจากการจำลองการคำนวณของระบบ (โหมด Demo)
          </p>
        </div>
      )}
    </Modal>
  );
}
