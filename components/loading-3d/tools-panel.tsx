"use client";

// ===== แผงขวา: ปุ่มเครื่องมือ + ผลการจัด + คำเตือน =====
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Eraser,
  Loader2,
  PanelRightClose,
  RefreshCw,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { usePackingStore } from "@/lib/store/packing-store";
import { formatNumber } from "@/lib/labels";

function ResultRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span
        className={strong ? "font-semibold text-slate-900" : "text-slate-700"}
      >
        {value}
      </span>
    </div>
  );
}

export function ToolsPanel({
  onExplain,
  onClose,
}: {
  onExplain: () => void;
  onClose?: () => void;
}) {
  const { toast } = useToast();
  const result = usePackingStore((s) => s.result);
  const compute = usePackingStore((s) => s.compute);
  const clear = usePackingStore((s) => s.clear);

  const [calculating, setCalculating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  // จำลองการคิดของระบบ ~0.8 วินาที ก่อนแสดงผล
  const runCompute = (recalc: boolean) => {
    if (calculating) return;
    setCalculating(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      compute();
      setCalculating(false);
      toast(recalc ? "จัดใหม่เรียบร้อย" : "คำนวณการจัดของเสร็จแล้ว", "success");
    }, 800);
  };

  const handleClear = () => {
    clear();
    toast("ล้างแผนแล้ว", "info");
  };

  const boxesLeft =
    result?.unpackedItems.reduce((s, u) => s + u.qtyLeft, 0) ?? 0;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur-md">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">เครื่องมือจัดวาง</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            ให้ระบบคำนวณการวางแบบ Best Fit
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="ซ่อนแผงเครื่องมือ"
            title="ซ่อนแผง"
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="thin-scrollbar flex-1 overflow-y-auto p-4">
        {/* ปุ่มหลัก */}
        <div className="space-y-2">
          <Button
            onClick={() => runCompute(false)}
            disabled={calculating}
            className="w-full"
          >
            {calculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {calculating ? "กำลังคำนวณ..." : "คำนวณการจัดของ"}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => runCompute(true)}
              disabled={calculating || !result}
            >
              <RefreshCw className="h-4 w-4" />
              จัดใหม่
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={calculating || !result}
            >
              <Eraser className="h-4 w-4" />
              ล้างแผน
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={() => toast("บันทึกแผน Demo แล้ว", "success")}
            disabled={!result}
            className="w-full"
          >
            <Save className="h-4 w-4" />
            บันทึกแผน Demo
          </Button>
          <Button variant="ghost" onClick={onExplain} className="w-full">
            <BookOpen className="h-4 w-4" />
            ดูคำอธิบาย Algorithm
          </Button>
        </div>

        {/* ผลการจัด */}
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-slate-900">ผลการจัดของ</h4>
          {result ? (
            <div className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 px-3">
              <ResultRow
                label="สินค้าจัดเข้าแล้ว"
                value={`${formatNumber(result.packed.length)} กล่อง`}
                strong
              />
              <ResultRow
                label="สินค้าที่เหลือ"
                value={`${formatNumber(boxesLeft)} กล่อง`}
              />
              <ResultRow
                label="น้ำหนักรวม"
                value={`${formatNumber(Math.round(result.usedWeightKg))} กก.`}
              />
              <ResultRow
                label="ปริมาตรรวม"
                value={`${result.usedVolumeM3.toFixed(1)} / ${result.totalVolumeM3.toFixed(1)} ลบ.ม.`}
              />
              <ResultRow
                label="พื้นที่ใช้ไป"
                value={`${Math.round(result.volumePercent)}%`}
                strong
              />
            </div>
          ) : (
            <div className="mt-2 rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
              ยังไม่มีผลการคำนวณ
              <br />
              กด &ldquo;คำนวณการจัดของ&rdquo; เพื่อเริ่ม
            </div>
          )}
        </div>

        {/* คำเตือน */}
        {result && result.warnings.length > 0 && (
          <div className="mt-5">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold text-amber-700">
              <TriangleAlert className="h-4 w-4" />
              คำเตือน
            </h4>
            <ul className="mt-2 space-y-2">
              {result.warnings.map((w, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                >
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* รายละเอียดสินค้าที่จัดไม่ได้ */}
        {result && result.unpackedItems.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-slate-900">
              สินค้าที่จัดเข้าไม่ได้
            </h4>
            <ul className="mt-2 space-y-2">
              {result.unpackedItems.map((u) => (
                <li
                  key={u.item.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                >
                  <p className="font-medium text-slate-800">
                    {u.item.name}{" "}
                    <span className="font-normal text-slate-400">
                      ({formatNumber(u.qtyLeft)} กล่อง)
                    </span>
                  </p>
                  <p className="mt-0.5 text-red-600">เหตุผล: {u.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
