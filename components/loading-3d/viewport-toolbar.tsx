"use client";

// ===== แถบเครื่องมือลอยบนพื้นที่ 3D: เปลี่ยนมุมมอง + เปิด/ปิดการแสดงผล =====
import {
  Box,
  Crosshair,
  Grid3x3,
  RotateCcw,
  Tag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePackingStore, type CameraPreset } from "@/lib/store/packing-store";

const VIEW_OPTIONS: { key: CameraPreset; label: string }[] = [
  { key: "3d", label: "3D" },
  { key: "top", label: "มุมบน" },
  { key: "side", label: "มุมข้าง" },
  { key: "back", label: "ท้ายตู้" },
];

function IconToggle({
  active,
  onClick,
  title,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
        active
          ? "border-hairline bg-bone text-charcoal-ink"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function ViewportToolbar() {
  const cameraPreset = usePackingStore((s) => s.cameraPreset);
  const setCameraPreset = usePackingStore((s) => s.setCameraPreset);
  const resetCamera = usePackingStore((s) => s.resetCamera);
  const focusSelected = usePackingStore((s) => s.focusSelected);
  const selectedBoxId = usePackingStore((s) => s.selectedBoxId);
  const showLabels = usePackingStore((s) => s.showLabels);
  const showGrid = usePackingStore((s) => s.showGrid);
  const showFrame = usePackingStore((s) => s.showFrame);
  const toggleLabels = usePackingStore((s) => s.toggleLabels);
  const toggleGrid = usePackingStore((s) => s.toggleGrid);
  const toggleFrame = usePackingStore((s) => s.toggleFrame);

  return (
    <div className="pointer-events-none flex flex-wrap items-start justify-between gap-2">
      {/* เปลี่ยนมุมมอง */}
      <div className="pointer-events-auto inline-flex rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
        {VIEW_OPTIONS.map((opt) => {
          const active = cameraPreset === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setCameraPreset(opt.key)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-charcoal-ink text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* เครื่องมือแสดงผล */}
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 p-1 shadow-sm backdrop-blur">
        <IconToggle
          active={false}
          onClick={resetCamera}
          title="รีเซ็ตมุมกล้อง"
          icon={RotateCcw}
        />
        <IconToggle
          active={false}
          onClick={() => selectedBoxId && focusSelected()}
          title={selectedBoxId ? "โฟกัสกล่องที่เลือก" : "เลือกกล่องก่อนโฟกัส"}
          icon={Crosshair}
        />
        <span className="mx-0.5 h-5 w-px bg-slate-200" />
        <IconToggle
          active={showLabels}
          onClick={toggleLabels}
          title="ป้ายชื่อ SKU"
          icon={Tag}
        />
        <IconToggle
          active={showGrid}
          onClick={toggleGrid}
          title="เส้นตารางพื้น"
          icon={Grid3x3}
        />
        <IconToggle
          active={showFrame}
          onClick={toggleFrame}
          title="โครงตู้"
          icon={Box}
        />
      </div>
    </div>
  );
}
