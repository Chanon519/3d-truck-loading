"use client";

// ===== หน้า "จัด Container ใส่รถ" — จับคู่ตู้กับหัวลากอัตโนมัติ =====
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Eraser,
  Forklift,
  Gauge,
  Loader2,
  PackageX,
  Sparkles,
  Truck,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { AssignmentCard } from "@/components/truck-assignment/assignment-card";
import { AWAITING_CONTAINERS } from "@/lib/mock/awaiting-containers";
import { VEHICLES } from "@/lib/mock/vehicles";
import { depotName } from "@/lib/mock/depots";
import {
  assignableTractors,
  computeTruckAssignment,
  type TruckAssignmentResult,
} from "@/lib/algorithms/truck-assignment";
import {
  PLAN_STATUS_LABEL,
  PLAN_STATUS_TONE,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  VEHICLE_TYPE_LABEL,
  formatNumber,
  formatThaiTime,
} from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";
import type { ContainerSize, PlanStatus } from "@/lib/types";

type Phase = "idle" | "calculating" | "done";

const CONTAINER_MAP = new Map(AWAITING_CONTAINERS.map((c) => [c.id, c]));
const VEHICLE_MAP = new Map(VEHICLES.map((v) => [v.id, v]));

const SIZE_TONE: Record<ContainerSize, BadgeTone> = {
  "20FT": "slate",
  "40FT": "sky",
  "40HQ": "violet",
};

export default function TruckAssignmentPage() {
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<TruckAssignmentResult | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  // ---------- ข้อมูลอินพุต ----------
  const readyContainers = useMemo(
    () =>
      AWAITING_CONTAINERS.filter((c) => c.ready).sort((a, b) =>
        a.appointmentTime.localeCompare(b.appointmentTime)
      ),
    []
  );
  const notReadyCount = AWAITING_CONTAINERS.length - readyContainers.length;
  const tractors = useMemo(() => assignableTractors(VEHICLES), []);
  const availableNow = tractors.filter((t) => t.status === "available");

  const done = phase === "done";
  const calculating = phase === "calculating";
  const planStatus: PlanStatus = done
    ? result && result.unassignedContainers.length > 0
      ? "has_warning"
      : "calculated"
    : "draft";

  // ---------- actions ----------
  const handleCompute = () => {
    if (calculating) return;
    setPhase("calculating");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setResult(computeTruckAssignment(AWAITING_CONTAINERS, VEHICLES));
      setPhase("done");
      toast("จับคู่ตู้กับหัวลากเสร็จแล้ว", "success");
    }, 1000);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase("idle");
    setResult(null);
    toast("ล้างแผนแล้ว", "info");
  };

  return (
    <div>
      <PageHeader
        title="จัด Container ใส่รถ"
        subtitle="จับคู่ตู้กับหัวลากอัตโนมัติ ตามเวลานัด น้ำหนัก และความพร้อมของรถ"
        actions={
          <>
            <Badge tone={PLAN_STATUS_TONE[planStatus]}>
              {PLAN_STATUS_LABEL[planStatus]}
            </Badge>
            <Button
              variant="orange"
              onClick={handleCompute}
              disabled={calculating}
            >
              {calculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {calculating ? "กำลังจับคู่..." : "คำนวณการจัดรถ"}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={phase === "idle"}
            >
              <Eraser className="h-4 w-4" />
              ล้างแผน
            </Button>
          </>
        }
      />

      {/* ---------- สรุปด้านบน ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="ตู้รอจัดรถ"
          value={formatNumber(readyContainers.length)}
          sub="พร้อมจับคู่หัวลาก"
          icon={Container}
          tone="amber"
        />
        <StatCard
          label="หัวลากพร้อมทันที"
          value={formatNumber(availableNow.length)}
          sub="ออกงานได้เลย"
          icon={Truck}
          tone="emerald"
        />
        <StatCard
          label="หัวลากมอบหมายได้"
          value={formatNumber(tractors.length)}
          sub="รวมรถที่กำลังวิ่งงาน"
          icon={Forklift}
          tone="blue"
        />
        <StatCard
          label="ตู้ยังไม่พร้อม"
          value={formatNumber(notReadyCount)}
          sub="รอเอกสาร/ตรวจปล่อย"
          icon={PackageX}
          tone="slate"
        />
        <StatCard
          label="จับคู่แล้ว"
          value={formatNumber(done && result ? result.assignments.length : 0)}
          sub={done ? "พร้อมส่งไปใช้งาน" : "รอการคำนวณ"}
          icon={Sparkles}
          tone="violet"
        />
        <StatCard
          label="คะแนนเฉลี่ย"
          value={done && result ? `${result.avgScore}` : "-"}
          sub="ความเหมาะสมของการจับคู่"
          icon={Gauge}
          tone="sky"
        />
      </div>

      {/* ---------- idle: แสดงอินพุต + CTA ---------- */}
      {phase === "idle" && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* คิวตู้ */}
          <Card>
            <CardHeader
              title="ตู้ที่รอจัดรถ"
              subtitle="เรียงตามเวลานัดรับตู้"
              action={<Badge tone="amber">{readyContainers.length} ใบ</Badge>}
            />
            <ul className="divide-y divide-slate-100">
              {readyContainers.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-5 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Container className="h-4 w-4 shrink-0 text-blue-600" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {c.containerNo}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {c.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={SIZE_TONE[c.size]}>{c.size}</Badge>
                    <span className="text-xs text-slate-500">
                      {formatThaiTime(c.appointmentTime)} น.
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* หัวลากที่มอบหมายได้ */}
          <Card>
            <CardHeader
              title="หัวลากที่มอบหมายได้"
              subtitle="พร้อมทันทีจะถูกจัดก่อน"
              action={<Badge tone="blue">{tractors.length} คัน</Badge>}
            />
            <ul className="divide-y divide-slate-100">
              {tractors.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 px-5 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Truck className="h-4 w-4 shrink-0 text-charcoal-ink" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {t.plate}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {VEHICLE_TYPE_LABEL[t.type]} · {depotName(t.depotId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-medium text-slate-400">
                      {t.score} คะแนน
                    </span>
                    <Badge tone={VEHICLE_STATUS_TONE[t.status]}>
                      {VEHICLE_STATUS_LABEL[t.status]}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* CTA */}
          <Card className="p-8 lg:col-span-2">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bone text-charcoal-ink">
                <Forklift className="h-7 w-7" />
              </div>
              <p className="mt-4 font-semibold text-slate-900">
                พร้อมให้ระบบจับคู่ตู้กับหัวลากแล้ว
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                ระบบจะจับคู่ตู้ {formatNumber(readyContainers.length)} ใบ
                กับหัวลากที่เหมาะสมที่สุด โดยเรียงตามเวลานัด น้ำหนัก
                และความพร้อมของรถ พร้อมให้เหตุผลของทุกคู่
              </p>
              <Button onClick={handleCompute} className="mt-5">
                <Sparkles className="h-4 w-4" />
                คำนวณการจัดรถ
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ---------- calculating ---------- */}
      {calculating && (
        <Card className="mt-6 p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bone">
              <Loader2 className="h-7 w-7 animate-spin text-charcoal-ink" />
            </div>
            <p className="mt-4 font-semibold text-slate-900">กำลังจับคู่...</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              ระบบกำลังวิเคราะห์ตู้ {formatNumber(readyContainers.length)} ใบ กับหัวลาก{" "}
              {formatNumber(tractors.length)} คัน เพื่อหาการจับคู่ที่เหมาะสมที่สุด
            </p>
            <div className="mt-5 w-full max-w-sm space-y-2">
              <div className="h-2 w-full animate-pulse rounded-full bg-hairline" />
              <div className="h-2 w-3/4 animate-pulse rounded-full bg-hairline" />
              <div className="h-2 w-1/2 animate-pulse rounded-full bg-hairline" />
            </div>
          </div>
        </Card>
      )}

      {/* ---------- done: ผลการจับคู่ ---------- */}
      {done && result && (
        <div className="mt-6 space-y-6">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                ผลการจับคู่ที่แนะนำ
              </h2>
              <Badge tone={PLAN_STATUS_TONE.calculated}>
                จับคู่แล้ว {formatNumber(result.assignments.length)} คู่
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {result.assignments.map((a) => {
                const container = CONTAINER_MAP.get(a.containerIds[0]);
                const truck = VEHICLE_MAP.get(a.truckId);
                if (!container || !truck) return null;
                return (
                  <AssignmentCard
                    key={a.truckId}
                    assignment={a}
                    container={container}
                    truck={truck}
                  />
                );
              })}
            </div>
          </div>

          {/* ตู้ที่ยังไม่ได้จัด */}
          {result.unassignedContainers.length > 0 && (
            <Card>
              <CardHeader
                title="ตู้ที่ยังไม่ได้จัดรถ"
                subtitle="ต้องดำเนินการเพิ่มเติมก่อนจัดรถ"
                action={
                  <Badge tone="amber">
                    {result.unassignedContainers.length} ใบ
                  </Badge>
                }
              />
              <ul className="divide-y divide-slate-100">
                {result.unassignedContainers.map(({ container, reason }) => (
                  <li
                    key={container.id}
                    className="flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {container.containerNo}{" "}
                          <span className="font-normal text-slate-400">
                            · {container.destination}
                          </span>
                        </p>
                        <p className="truncate text-xs text-amber-700">
                          {reason}
                        </p>
                      </div>
                    </div>
                    <Badge tone={SIZE_TONE[container.size]}>
                      {container.size}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* หัวลากที่ยังว่าง */}
          {result.idleTrucks.length > 0 && (
            <Card>
              <CardHeader
                title="หัวลากที่ยังว่าง (สำรอง)"
                subtitle="พร้อมรองรับงานเพิ่มหรือรอบถัดไป"
                action={<Badge tone="emerald">{result.idleTrucks.length} คัน</Badge>}
              />
              <div className="flex flex-wrap gap-2 p-4">
                {result.idleTrucks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <Truck className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-800">
                      {t.plate}
                    </span>
                    <span className="text-xs text-slate-400">
                      {depotName(t.depotId)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
