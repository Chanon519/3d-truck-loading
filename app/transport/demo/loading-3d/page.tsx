"use client";

// ===== หน้า "จัดของเข้า Container แบบ 3D" — workspace เต็มพื้นที่ =====
// พื้นที่ 3D เป็นฉากหลังเต็มจอ ส่วนข้อมูล/เครื่องมือลอยเป็น overlay ที่ย่อ-ขยายได้
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useSyncExternalStore, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronUp,
  Check,
  ListChecks,
  Loader2,
  PanelLeftOpen,
  PanelRightOpen,
  Table2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { WorkspaceTopBar } from "@/components/loading-3d/summary-bar";
import { GroupPanel } from "@/components/loading-3d/group-panel";
import { ToolsPanel } from "@/components/loading-3d/tools-panel";
import { DetailPanel } from "@/components/loading-3d/detail-panel";
import { ViewportToolbar } from "@/components/loading-3d/viewport-toolbar";
import { AlgorithmModal } from "@/components/loading-3d/algorithm-modal";
import { OrderSelectionScreen } from "@/components/loading-3d/order-selection";
import { usePackingStore } from "@/lib/store/packing-store";
import { usePlansStore } from "@/lib/store/plans-store";
import { CONTAINER_SPECS } from "@/lib/container-specs";
import { formatNumber } from "@/lib/labels";
import type { ContainerSize } from "@/lib/types";

// ฉาก 3D ต้องเรนเดอร์ฝั่ง client เท่านั้น (Three.js) — ปิด SSR
const ContainerScene = dynamic(
  () =>
    import("@/components/three/container-scene").then((m) => m.ContainerScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="mt-2 text-sm">กำลังโหลดพื้นที่ 3D...</p>
        </div>
      </div>
    ),
  }
);

const CONTAINER_OPTIONS = (
  Object.keys(CONTAINER_SPECS) as ContainerSize[]
).map((key) => ({ value: key, label: CONTAINER_SPECS[key].label }));

// จอกว้าง (≥ lg) หรือไม่ — ใช้กำหนดค่าเริ่มต้นว่าจะเปิดแผงข้างหรือไม่
// (SSR-safe ด้วย useSyncExternalStore — ไม่มี hydration mismatch)
const DESKTOP_QUERY = "(min-width: 1024px)";
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(DESKTOP_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true
  );
}

// ปุ่มเรียกแผงกลับมาเมื่อถูกซ่อน
function LauncherButton({
  icon: Icon,
  label,
  onClick,
  className,
  style,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`pointer-events-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white ${className ?? ""}`}
    >
      <Icon className="h-4 w-4 text-charcoal-ink" />
      {label}
    </button>
  );
}

function Loading3DWorkspace() {
  const phase = usePackingStore((s) => s.phase);
  const containerType = usePackingStore((s) => s.containerType);
  const setContainerType = usePackingStore((s) => s.setContainerType);
  const result = usePackingStore((s) => s.result);
  const compute = usePackingStore((s) => s.compute);
  const backToSelection = usePackingStore((s) => s.backToSelection);
  const seedFromPlanUnit = usePackingStore((s) => s.seedFromPlanUnit);

  // ---------- โหมด "มาจากแผน" (deep-link ?planId=&unitId=) ----------
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const unitId = searchParams.get("unitId");
  const inPlanMode = Boolean(planId && unitId);
  const plans = usePlansStore((s) => s.plans);
  const packUnit = usePlansStore((s) => s.packUnit);

  // seed store จากหน่วยงานในแผน (ครั้งเดียวต่อ unit)
  const seededKey = useRef<string | null>(null);
  useEffect(() => {
    if (!planId || !unitId) return;
    const key = `${planId}:${unitId}`;
    if (seededKey.current === key) return;
    const unit = plans
      .find((p) => p.id === planId)
      ?.units.find((u) => u.id === unitId);
    if (!unit) return;
    seededKey.current = key;
    seedFromPlanUnit(
      unit.packingOrderIds ?? [],
      unit.containerType ?? "40HQ"
    );
  }, [planId, unitId, plans, seedFromPlanUnit]);

  const confirmPlanPacking = () => {
    if (!planId || !unitId || !result) return;
    packUnit(planId, unitId, result);
    router.push(`/transport/demo/planning/${planId}`);
  };

  const isDesktop = useIsDesktop();
  const [explainOpen, setExplainOpen] = useState(false);
  // null = ตามค่าเริ่มต้นของอุปกรณ์ (เปิดบนจอกว้าง, ปิดบนจอเล็ก); bool = ผู้ใช้เลือกเอง
  const [leftOverride, setLeftOverride] = useState<boolean | null>(null);
  const [rightOverride, setRightOverride] = useState<boolean | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const leftOpen = leftOverride ?? isDesktop;
  const rightOpen = rightOverride ?? isDesktop;

  const spec = CONTAINER_SPECS[containerType];
  const packedCount = result?.packed.length ?? 0;

  // วัดความสูงจริงของคลัสเตอร์บน (แถบสรุป + เครื่องมือมุมกล้อง) แทนการเดาค่าคงที่
  // เพราะแถบสรุปสามารถ wrap เป็น 2 บรรทัดได้เมื่อพื้นที่แคบ/เนื้อหายาว — กันแผงข้างซ้อนทับ
  const topClusterRef = useRef<HTMLDivElement>(null);
  const [sideTop, setSideTop] = useState(124);
  useEffect(() => {
    const el = topClusterRef.current;
    if (!el) return;
    const update = () => setSideTop(el.offsetHeight + 20);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
    // ผูกกับ phase: ตอน mount ครั้งแรกอยู่ phase "select" (div ยังไม่ถูก render, ref เป็น null)
    // ต้องรอ effect รันใหม่ตอนสลับมา "workspace" จริง ๆ ref ถึงจะจับ element ได้
  }, [phase]);

  // กันเคส result หายไปตอนอยู่ใน workspace แล้ว (ปกติ enterWorkspace() คำนวณให้แล้ว)
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!result && phase === "workspace") compute();
  }, [result, phase, compute]);

  if (phase === "select") {
    return <OrderSelectionScreen />;
  }

  return (
    <div className="fixed inset-y-0 right-0 left-0 z-10 overflow-hidden bg-slate-100 lg:left-64">
      {/* พื้นที่ 3D เต็มพื้นหลัง — เต็มจอจริง ไม่อยู่ในกรอบ card ของ layout เดิม */}
      {/* lg:left-64 กันไม่ให้ overlay ถูก sidebar (fixed, w-64, z-30) บังบนจอกว้าง */}
      <div className="absolute inset-0">
        <ContainerScene spec={spec} />
      </div>

      {/* คลัสเตอร์บน: แถบสรุป + เครื่องมือมุมกล้อง */}
      <div
        ref={topClusterRef}
        className="pointer-events-none absolute inset-x-3 top-3 z-40 flex flex-col gap-2"
      >
        <WorkspaceTopBar
          trailing={
            <div className="flex items-center gap-2">
              <SelectField
                value={containerType}
                onChange={(v) => setContainerType(v as ContainerSize)}
                options={CONTAINER_OPTIONS}
                className="w-44"
              />
              <Button variant="outline" size="sm" onClick={backToSelection}>
                <ListChecks className="h-4 w-4" />
                แก้ไขรายการออเดอร์
              </Button>
              {inPlanMode && (
                <Button size="sm" onClick={confirmPlanPacking} disabled={!result}>
                  <Check className="h-4 w-4" />
                  ยืนยันแผนจัดของ
                </Button>
              )}
            </div>
          }
        />
        <ViewportToolbar />
      </div>

      {/* แผงซ้าย: กลุ่มสินค้า */}
      {leftOpen ? (
        <div
          className="pointer-events-auto absolute bottom-3 left-3 z-20 w-[300px] max-w-[calc(100vw-1.5rem)]"
          style={{ top: sideTop }}
        >
          <GroupPanel onClose={() => setLeftOverride(false)} />
        </div>
      ) : (
        <LauncherButton
          icon={PanelLeftOpen}
          label="กลุ่มสินค้า"
          onClick={() => setLeftOverride(true)}
          className="absolute left-3 z-20"
          style={{ top: sideTop }}
        />
      )}

      {/* แผงขวา: เครื่องมือและผลลัพธ์ */}
      {rightOpen ? (
        <div
          className="pointer-events-auto absolute bottom-3 right-3 z-20 w-[320px] max-w-[calc(100vw-1.5rem)]"
          style={{ top: sideTop }}
        >
          <ToolsPanel
            onExplain={() => setExplainOpen(true)}
            onClose={() => setRightOverride(false)}
          />
        </div>
      ) : (
        <LauncherButton
          icon={PanelRightOpen}
          label="เครื่องมือ"
          onClick={() => setRightOverride(true)}
          className="absolute right-3 z-20"
          style={{ top: sideTop }}
        />
      )}

      {/* แถบล่าง: รายละเอียดการจัดวาง (ย่อ/ขยาย) */}
      {detailOpen ? (
        <div
          className="pointer-events-auto absolute bottom-3 z-30 h-[44vh] max-h-[440px]"
          style={{
            left: leftOpen ? 320 : 12,
            right: rightOpen ? 340 : 12,
          }}
        >
          <DetailPanel onClose={() => setDetailOpen(false)} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="pointer-events-auto absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
        >
          <Table2 className="h-4 w-4 text-charcoal-ink" />
          รายละเอียดการจัดวาง
          {result && (
            <span className="rounded-full bg-bone px-2 py-0.5 text-xs font-semibold text-charcoal-ink">
              {formatNumber(packedCount)} กล่อง
            </span>
          )}
          <ChevronUp className="h-4 w-4 text-slate-400" />
        </button>
      )}

      <AlgorithmModal open={explainOpen} onClose={() => setExplainOpen(false)} />
    </div>
  );
}

export default function Loading3DPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-slate-100 min-h-screen">
          <div className="flex flex-col items-center text-slate-400">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="mt-2 text-sm">กำลังโหลดหน้าจัดของ...</p>
          </div>
        </div>
      }
    >
      <Loading3DWorkspace />
    </Suspense>
  );
}
