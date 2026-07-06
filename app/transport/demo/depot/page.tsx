"use client";

// ===== หน้าจัดการ Depot (Yard Map) — แผนผังลานจอด/ลานตู้แบบ Real-time =====
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  LayoutGrid,
  MapPin,
  SquareDashed,
  SquareParking,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { FilterChips } from "@/components/ui/filter-chips";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { useDepotStore } from "@/lib/store/depot-store";
import { DEPOTS } from "@/lib/mock/depots";
import { formatNumber } from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";
import type { DepotSlot, DepotZoneType } from "@/lib/types";
import { ZoneCard } from "@/components/depot/zone-card";
import { YardLegend } from "@/components/depot/yard-legend";
import { SlotDetail } from "@/components/depot/slot-detail";
import type { SlotCellMode } from "@/components/depot/slot-cell";

// ลำดับการแสดงโซนบน Yard Map
const ZONE_ORDER: DepotZoneType[] = [
  "ready",
  "loading",
  "staging",
  "container_yard",
  "maintenance",
  "blocked",
];

// มุมมองการกรองช่อง
type ViewFilter = "all" | "vehicle" | "container" | "empty" | "problem";

const VIEW_FILTER_LABEL: Record<ViewFilter, string> = {
  all: "ทั้งหมด",
  vehicle: "เฉพาะรถ",
  container: "เฉพาะตู้",
  empty: "ช่องว่าง",
  problem: "มีปัญหา",
};

function matchesFilter(slot: DepotSlot, filter: ViewFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "vehicle":
      return slot.occupancyType === "vehicle";
    case "container":
      return slot.occupancyType === "container";
    case "empty":
      return slot.status === "empty";
    case "problem":
      return slot.status === "problem";
  }
}

// ช่องปลายทางรองรับของที่กำลังย้ายหรือไม่ (รถลงช่องรถ/ผสม, ตู้ลงช่องตู้/ผสม)
function canReceive(
  occupancy: DepotSlot["occupancyType"],
  slotType: DepotSlot["slotType"]
): boolean {
  if (occupancy === "vehicle") return slotType === "vehicle" || slotType === "mixed";
  if (occupancy === "container")
    return slotType === "container" || slotType === "mixed";
  return false;
}

export default function DepotPage() {
  const slots = useDepotStore((s) => s.slots);
  const moveOccupant = useDepotStore((s) => s.moveOccupant);
  const { toast } = useToast();

  const [depotId, setDepotId] = useState<string>("DEP-LKB"); // default ICD ลาดกระบัง
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [moveFromId, setMoveFromId] = useState<string | null>(null);

  // ---------- ข้อมูลของ depot ที่เลือก ----------
  const depotSlots = slots.filter((s) => s.depotId === depotId);
  const selectedSlot = depotSlots.find((s) => s.id === selectedId) ?? null;
  const moveFromSlot = depotSlots.find((s) => s.id === moveFromId) ?? null;

  const total = depotSlots.length;
  const occupied = depotSlots.filter((s) => s.status === "occupied").length;
  const empty = depotSlots.filter((s) => s.status === "empty").length;
  const problem = depotSlots.filter((s) => s.status === "problem").length;
  const utilization = total > 0 ? Math.round((occupied / total) * 100) : 0;
  const utilizationTone: BadgeTone =
    utilization >= 90 ? "red" : utilization >= 75 ? "amber" : "blue";

  // โซนที่มีอยู่จริงใน depot นี้ เรียงตามลำดับมาตรฐาน
  const zones = ZONE_ORDER.filter((z) => depotSlots.some((s) => s.zone === z));

  // ---------- โหมดการแสดงผลของแต่ละช่อง ----------
  const modeOf = (slot: DepotSlot): SlotCellMode => {
    if (moveFromSlot) {
      if (slot.id === moveFromSlot.id) return "move-source";
      if (
        slot.status === "empty" &&
        canReceive(moveFromSlot.occupancyType, slot.slotType)
      ) {
        return "move-target";
      }
      return "move-ineligible";
    }
    if (slot.id === selectedId) return "selected";
    if (!matchesFilter(slot, viewFilter)) return "dimmed";
    return "normal";
  };

  // ---------- คลิกช่อง ----------
  const handleSlotClick = (slot: DepotSlot) => {
    if (moveFromSlot) {
      // คลิกช่องต้นทางซ้ำ = ยกเลิกการย้าย
      if (slot.id === moveFromSlot.id) {
        setMoveFromId(null);
        toast("ยกเลิกการย้ายแล้ว", "info");
        return;
      }
      // คลิกช่องใดก็ได้ → ให้ store ตัดสิน แล้วแจ้งผลผ่าน toast
      const result = moveOccupant(moveFromSlot.id, slot.id);
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) {
        setMoveFromId(null);
        setSelectedId(slot.id); // เลือกช่องปลายทางให้เห็นของที่ย้ายมา
      }
      return;
    }
    setSelectedId(slot.id);
  };

  const handleChangeDepot = (id: string) => {
    setDepotId(id);
    setSelectedId(null);
    setMoveFromId(null);
  };

  const handleCancelMove = () => {
    setMoveFromId(null);
    toast("ยกเลิกการย้ายแล้ว", "info");
  };

  const movingLabel =
    moveFromSlot?.occupancyType === "vehicle"
      ? `รถ ${moveFromSlot.vehicleId}`
      : moveFromSlot?.occupancyType === "container"
        ? `ตู้ ${moveFromSlot.containerId}`
        : "";

  const detailPanel = selectedSlot ? (
    <SlotDetail
      slot={selectedSlot}
      moving={moveFromId === selectedSlot.id}
      onStartMove={() => setMoveFromId(selectedSlot.id)}
      onCancelMove={handleCancelMove}
    />
  ) : null;

  return (
    <div>
      <PageHeader
        title="จัดการ Depot"
        subtitle="แผนผังลานจอดและลานตู้แบบ Real-time"
      />

      {/* ---------- เลือก Depot ---------- */}
      <div className="mb-4">
        <FilterChips
          options={DEPOTS.map((d) => ({
            value: d.id,
            label: d.name,
            count: slots.filter((s) => s.depotId === d.id).length,
          }))}
          value={depotId}
          onChange={handleChangeDepot}
        />
      </div>

      {/* ---------- สถิติของ depot ที่เลือก ---------- */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="ช่องทั้งหมด"
          value={formatNumber(total)}
          icon={LayoutGrid}
          tone="blue"
        />
        <StatCard
          label="ใช้งานอยู่"
          value={formatNumber(occupied)}
          icon={SquareParking}
          tone="sky"
        />
        <StatCard
          label="ว่าง"
          value={formatNumber(empty)}
          icon={SquareDashed}
          tone="emerald"
        />
        <StatCard
          label="มีปัญหา"
          value={formatNumber(problem)}
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      {/* ---------- Utilization ---------- */}
      <Card className="mb-4 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            อัตราการใช้พื้นที่ — ใช้งาน {formatNumber(occupied)} จาก{" "}
            {formatNumber(total)} ช่อง
          </p>
          <p className="text-sm font-semibold text-slate-900">{utilization}%</p>
        </div>
        <ProgressBar value={utilization} tone={utilizationTone} />
      </Card>

      {/* ---------- Filter มุมมอง + Legend ---------- */}
      <Card className="mb-4 p-4">
        <FilterChips
          options={(Object.keys(VIEW_FILTER_LABEL) as ViewFilter[]).map((v) => ({
            value: v,
            label: VIEW_FILTER_LABEL[v],
            count: depotSlots.filter((s) => matchesFilter(s, v)).length,
          }))}
          value={viewFilter}
          onChange={(v) => setViewFilter(v as ViewFilter)}
        />
        <div className="mt-3 border-t border-slate-100 pt-3">
          <YardLegend />
        </div>
      </Card>

      {/* ---------- Yard Map + Panel รายละเอียด ---------- */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {/* แถบบอกสถานะโหมดย้าย */}
          {moveFromSlot && (
            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex min-w-0 items-center gap-2 text-sm text-emerald-800">
                <ArrowRightLeft className="h-4 w-4 shrink-0" />
                <span className="min-w-0">
                  กำลังย้าย{" "}
                  <span className="font-semibold">{movingLabel}</span> จากช่อง{" "}
                  <span className="font-semibold">{moveFromSlot.slotCode}</span>{" "}
                  — คลิกช่องว่างที่เรืองแสงเพื่อเลือกปลายทาง
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleCancelMove}
              >
                ยกเลิกการย้าย
              </Button>
            </div>
          )}

          {zones.map((zone) => (
            <ZoneCard
              key={zone}
              zone={zone}
              slots={depotSlots.filter((s) => s.zone === zone)}
              modeOf={modeOf}
              onSlotClick={handleSlotClick}
            />
          ))}
        </div>

        {/* Panel รายละเอียด — คอลัมน์ขวา sticky บนจอใหญ่ */}
        <div className="hidden xl:block">
          <div className="sticky top-6">
            <Card className="p-5">
              {detailPanel ?? (
                <EmptyState
                  icon={MapPin}
                  title="ยังไม่ได้เลือกช่อง"
                  subtitle="คลิกช่องบนแผนผังเพื่อดูรายละเอียดและสั่งย้าย"
                />
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modal รายละเอียด — จอเล็ก (ปิดอัตโนมัติระหว่างเลือกปลายทางย้าย เพื่อให้เห็นแผนผัง) */}
      <div className="xl:hidden">
        <Modal
          open={!!selectedSlot && !moveFromId}
          onClose={() => setSelectedId(null)}
          title={selectedSlot ? `รายละเอียดช่อง ${selectedSlot.slotCode}` : ""}
        >
          {detailPanel}
        </Modal>
      </div>
    </div>
  );
}
