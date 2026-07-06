"use client";

// ===== การ์ดต่อโซนใน Yard Map — หัวการ์ดชื่อโซน + grid ช่องตาม row/slot =====
import { Card, CardHeader } from "@/components/ui/card";
import { DEPOT_ZONE_LABEL } from "@/lib/labels";
import type { DepotSlot, DepotZoneType } from "@/lib/types";
import { SlotCell, type SlotCellMode } from "@/components/depot/slot-cell";

export function ZoneCard({
  zone,
  slots,
  modeOf,
  onSlotClick,
}: {
  zone: DepotZoneType;
  slots: DepotSlot[]; // ช่องทั้งหมดของโซนนี้ (depot เดียว)
  modeOf: (slot: DepotSlot) => SlotCellMode;
  onSlotClick: (slot: DepotSlot) => void;
}) {
  // เรียงตาม row → slot แล้วจัด grid ตามจำนวนคอลัมน์จริงของโซน
  const sorted = [...slots].sort((a, b) => a.row - b.row || a.slot - b.slot);
  const cols = Math.max(...slots.map((s) => s.slot), 1);
  const occupied = slots.filter((s) => s.status === "occupied").length;

  return (
    <Card>
      <CardHeader
        title={DEPOT_ZONE_LABEL[zone]}
        action={
          <span className="text-sm text-slate-500">
            ใช้งาน {occupied}/{slots.length} ช่อง
          </span>
        }
      />
      <div className="thin-scrollbar overflow-x-auto p-4">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            minWidth: `${cols * 64}px`,
          }}
        >
          {sorted.map((slot) => (
            <SlotCell
              key={slot.id}
              slot={slot}
              mode={modeOf(slot)}
              onClick={() => onSlotClick(slot)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
