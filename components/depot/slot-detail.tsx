"use client";

// ===== เนื้อหารายละเอียดช่องจอด — ใช้ร่วมกันทั้ง panel ขวา (จอใหญ่) และ Modal (จอเล็ก) =====
import {
  ArrowRightLeft,
  Container,
  StickyNote,
  Truck,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DEPOT_ZONE_LABEL,
  SLOT_STATUS_LABEL,
  SLOT_STATUS_TONE,
  formatNumber,
} from "@/lib/labels";
import type { DepotSlot } from "@/lib/types";

// ป้ายประเภทช่อง (ไม่มีใน labels.ts เพราะเป็นรายละเอียดเฉพาะหน้านี้)
const SLOT_TYPE_LABEL: Record<DepotSlot["slotType"], string> = {
  vehicle: "ช่องจอดรถ",
  container: "ช่องวางตู้",
  mixed: "ช่องผสม (รถ/ตู้)",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="shrink-0 text-sm text-slate-500">{label}</span>
      <span className="min-w-0 text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

export function SlotDetail({
  slot,
  moving, // กำลังอยู่ในโหมดเลือกปลายทางย้ายหรือไม่
  onStartMove,
  onCancelMove,
}: {
  slot: DepotSlot;
  moving: boolean;
  onStartMove: () => void;
  onCancelMove: () => void;
}) {
  const hasOccupant = slot.occupancyType !== "none";

  return (
    <div>
      {/* slotCode ใหญ่ + สถานะ */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-3xl font-semibold text-slate-900">{slot.slotCode}</p>
        <Badge tone={SLOT_STATUS_TONE[slot.status]}>
          {SLOT_STATUS_LABEL[slot.status]}
        </Badge>
      </div>

      <div className="divide-y divide-slate-100 border-y border-slate-100">
        <DetailRow label="Depot" value={slot.depotName} />
        <DetailRow label="โซน" value={DEPOT_ZONE_LABEL[slot.zone]} />
        <DetailRow
          label="แถว / ช่อง"
          value={`แถว ${formatNumber(slot.row)} ช่อง ${formatNumber(slot.slot)}`}
        />
        <DetailRow label="ประเภทช่อง" value={SLOT_TYPE_LABEL[slot.slotType]} />
        <DetailRow
          label="ของที่อยู่"
          value={
            slot.occupancyType === "vehicle" ? (
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-4 w-4 shrink-0 text-sky-600" />
                <span className="truncate">{slot.vehicleId}</span>
              </span>
            ) : slot.occupancyType === "container" ? (
              <span className="inline-flex items-center gap-1.5">
                <Container className="h-4 w-4 shrink-0 text-blue-600" />
                <span className="truncate">{slot.containerId}</span>
              </span>
            ) : (
              <span className="text-slate-400">— ไม่มี —</span>
            )
          }
        />
      </div>

      {/* หมายเหตุ */}
      {slot.note && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5">
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-800">{slot.note}</p>
        </div>
      )}

      {/* ปุ่มย้าย / ยกเลิกการย้าย */}
      {hasOccupant &&
        (moving ? (
          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
              คลิกช่องว่างที่เรืองแสงสีเขียวบนแผนผัง
              เพื่อเลือกตำแหน่งปลายทางของการย้าย
            </div>
            <Button variant="outline" className="w-full" onClick={onCancelMove}>
              <Undo2 className="h-4 w-4" />
              ยกเลิกการย้าย
            </Button>
          </div>
        ) : (
          <Button className="mt-4 w-full" onClick={onStartMove}>
            <ArrowRightLeft className="h-4 w-4" />
            ย้ายไปช่องอื่น
          </Button>
        ))}
    </div>
  );
}
