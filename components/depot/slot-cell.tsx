"use client";

// ===== ช่องจอดใน Yard Map — กล่องเดียวแทน 1 slot =====
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  Container,
  Truck,
} from "lucide-react";
import type { DepotSlot } from "@/lib/types";

// โหมดการแสดงผลของช่อง ขึ้นกับสถานะการเลือก/การย้ายบนหน้า
export type SlotCellMode =
  | "normal" // โหมดปกติ
  | "dimmed" // ไม่เข้าเงื่อนไข filter — จางลงแต่ยังอยู่
  | "selected" // ช่องที่ถูกเลือกดูรายละเอียด
  | "move-source" // ช่องต้นทางที่กำลังย้ายของออก
  | "move-target" // ช่องว่างที่ย้ายไปได้ — เรืองแสง
  | "move-ineligible"; // ช่องที่ย้ายไปไม่ได้ (คลิกแล้วเห็นคำเตือน)

// map class เต็มทุกสถานะ — ห้ามประกอบ class แบบ dynamic string (Tailwind 4)
const STATUS_CLASS: Record<string, string> = {
  empty: "bg-white border-dashed border-slate-300",
  "occupied-vehicle": "bg-sky-50 border-sky-400",
  "occupied-container": "bg-blue-50 border-blue-500",
  reserved: "bg-violet-50 border-violet-400",
  blocked: "bg-slate-100 border-slate-300",
  problem: "bg-red-50 border-red-400",
};

const MODE_CLASS: Record<SlotCellMode, string> = {
  normal: "",
  dimmed: "opacity-25",
  selected: "ring-2 ring-logo-violet ring-offset-1",
  "move-source": "ring-2 ring-logo-violet ring-offset-1",
  "move-target": "ring-2 ring-emerald-400 animate-pulse cursor-pointer",
  "move-ineligible": "opacity-40 cursor-not-allowed",
};

// ลายทแยงสำหรับช่องปิดใช้งาน
const BLOCKED_STRIPES: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(100,116,139,0.12) 6px, rgba(100,116,139,0.12) 12px)",
};

function statusKey(slot: DepotSlot): string {
  if (slot.status === "occupied") {
    return slot.occupancyType === "vehicle"
      ? "occupied-vehicle"
      : "occupied-container";
  }
  return slot.status;
}

// ไอคอน + ป้ายของที่อยู่ในช่อง
function CellContent({ slot }: { slot: DepotSlot }) {
  if (slot.status === "blocked") {
    return <Ban className="h-4 w-4 text-slate-400" />;
  }
  if (slot.status === "problem") {
    return (
      <>
        <AlertTriangle className="h-4 w-4 text-red-500" />
        {slot.occupancyType !== "none" && (
          <span className="w-full truncate text-center text-[10px] leading-tight text-red-700">
            {slot.vehicleId ?? slot.containerId}
          </span>
        )}
      </>
    );
  }
  if (slot.status === "reserved") {
    return <CalendarClock className="h-4 w-4 text-violet-500" />;
  }
  if (slot.occupancyType === "vehicle") {
    return (
      <>
        <Truck className="h-4 w-4 text-sky-600" />
        <span className="w-full truncate text-center text-[10px] leading-tight text-sky-800">
          {slot.vehicleId}
        </span>
      </>
    );
  }
  if (slot.occupancyType === "container") {
    return (
      <>
        <Container className="h-4 w-4 text-blue-600" />
        <span className="w-full truncate text-center text-[10px] leading-tight text-blue-800">
          {slot.containerId}
        </span>
      </>
    );
  }
  // ช่องว่าง
  return <span className="text-[10px] text-slate-300">ว่าง</span>;
}

export function SlotCell({
  slot,
  mode,
  onClick,
}: {
  slot: DepotSlot;
  mode: SlotCellMode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`${slot.slotCode}${slot.note ? ` — ${slot.note}` : ""}`}
      className={`flex aspect-[5/3] w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border-2 px-1 py-0.5 transition-all ${
        STATUS_CLASS[statusKey(slot)]
      } ${MODE_CLASS[mode]} ${
        mode === "normal" || mode === "dimmed" || mode === "selected"
          ? "cursor-pointer hover:shadow-md"
          : ""
      }`}
      style={slot.status === "blocked" ? BLOCKED_STRIPES : undefined}
    >
      <span className="text-[10px] font-medium leading-none text-slate-400">
        {slot.slotCode}
      </span>
      <CellContent slot={slot} />
    </button>
  );
}
