"use client";

// ===== หน้า Ranking รถ — จัดอันดับประสิทธิภาพรถทั้งหมดจากคะแนนรวม =====

import { useMemo, useState } from "react";
import { Medal, Route, Trophy, Truck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { FilterChips } from "@/components/ui/filter-chips";
import { SelectField } from "@/components/ui/select-field";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { VEHICLES } from "@/lib/mock/vehicles";
import { DEPOTS, depotName } from "@/lib/mock/depots";
import {
  VEHICLE_TYPE_LABEL,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  formatNumber,
  formatBaht,
} from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";
import type { Vehicle, VehicleType } from "@/lib/types";

// ---------- ช่วงเวลา (mock: ปรับตัวเลขสะสมด้วยตัวหารคงที่) ----------
type Period = "today" | "week" | "month";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "today", label: "วันนี้" },
  { value: "week", label: "สัปดาห์นี้" },
  { value: "month", label: "เดือนนี้" },
];

const PERIOD_DIVISOR: Record<Period, number> = {
  today: 20,
  week: 4,
  month: 1,
};

const PERIOD_LABEL: Record<Period, string> = {
  today: "วันนี้",
  week: "สัปดาห์นี้",
  month: "เดือนนี้",
};

// ปรับตัวเลขสะสม (งาน/เที่ยว/ระยะทาง/รายได้) ตามช่วงเวลา — ค่า % และคะแนนคงเดิม
function scaleVehicle(v: Vehicle, period: Period): Vehicle {
  const d = PERIOD_DIVISOR[period];
  if (d === 1) return v;
  return {
    ...v,
    jobsCompleted: Math.max(1, Math.round(v.jobsCompleted / d)),
    trips: Math.max(1, Math.round(v.trips / d)),
    totalDistanceKm: Math.round(v.totalDistanceKm / d),
    totalRevenue: Math.round(v.totalRevenue / d),
  };
}

// ---------- โทนสี ProgressBar ตามระดับ % ----------
function rateTone(value: number): BadgeTone {
  if (value >= 90) return "emerald";
  if (value >= 75) return "sky";
  return "amber";
}

// ---------- วงกลมอันดับ 1-3 (map class เต็ม — ห้ามประกอบ dynamic string) ----------
const RANK_CIRCLE: Record<number, string> = {
  1: "bg-amber-400 text-white",
  2: "bg-slate-300 text-slate-700",
  3: "bg-orange-300 text-white",
};

// ---------- ตัวเลือก filter ----------
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "ทุกประเภทรถ" },
  ...(Object.keys(VEHICLE_TYPE_LABEL) as VehicleType[]).map((t) => ({
    value: t,
    label: VEHICLE_TYPE_LABEL[t],
  })),
];

const DEPOT_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "ทุก Depot" },
  ...DEPOTS.map((d) => ({ value: d.id, label: d.name })),
];

// ---------- การ์ด Podium ----------
function PodiumCard({ vehicle, rank }: { vehicle: Vehicle; rank: number }) {
  const first = rank === 1;
  return (
    <div
      className={`flex h-full flex-col rounded-2xl shadow-sm ${
        first
          ? "border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white p-6 md:order-2"
          : `border bg-white p-5 ${
              rank === 2 ? "md:order-1" : "md:order-3"
            }`
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex items-center justify-center rounded-full ${
            first
              ? "h-11 w-11 bg-amber-400 text-white"
              : `h-9 w-9 ${
                  rank === 2 ? "bg-slate-200 text-slate-500" : "bg-orange-100 text-orange-500"
                }`
          }`}
        >
          {first ? <Trophy className="h-5 w-5" /> : <Medal className="h-4 w-4" />}
        </span>
        <span
          className={`text-xs font-semibold ${
            first ? "text-amber-600" : "text-slate-500"
          }`}
        >
          อันดับ {rank}
        </span>
      </div>

      <p
        className={`mt-3 font-semibold tracking-tight text-slate-900 ${
          first ? "text-3xl" : "text-2xl"
        }`}
      >
        {vehicle.plate}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge tone="slate">{VEHICLE_TYPE_LABEL[vehicle.type]}</Badge>
        <Badge tone="slate">{depotName(vehicle.depotId)}</Badge>
      </div>

      <div className="mt-4">
        <p className="text-xs text-slate-500">คะแนนรวม</p>
        <p
          className={`font-semibold tracking-tight ${
            first
              ? "text-5xl text-amber-600"
              : "text-4xl text-slate-900"
          }`}
        >
          {vehicle.score}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-3 text-center">
        <div>
          <p className="text-xs text-slate-500">ตรงเวลา</p>
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            {vehicle.onTimeRate}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">ใช้งานรถ</p>
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            {vehicle.utilization}%
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">จำนวนเที่ยว</p>
          <p className="text-sm font-semibold tracking-tight text-slate-900">
            {formatNumber(vehicle.trips)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VehicleRankingPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [depotFilter, setDepotFilter] = useState("all");

  // filter → ปรับตามช่วงเวลา → เรียงคะแนนมาก→น้อย
  const ranked = useMemo(() => {
    return VEHICLES.filter(
      (v) =>
        (typeFilter === "all" || v.type === typeFilter) &&
        (depotFilter === "all" || v.depotId === depotFilter),
    )
      .map((v) => scaleVehicle(v, period))
      .sort((a, b) => b.score - a.score);
  }, [period, typeFilter, depotFilter]);

  const podium = ranked.slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Ranking รถ"
        subtitle="จัดอันดับประสิทธิภาพรถทั้งหมด อ้างอิงจากคะแนนรวม"
      />

      {/* แถว filter */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <FilterChips
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(v) => setPeriod(v as Period)}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[26rem]">
          <SelectField
            value={typeFilter}
            onChange={setTypeFilter}
            options={TYPE_OPTIONS}
          />
          <SelectField
            value={depotFilter}
            onChange={setDepotFilter}
            options={DEPOT_OPTIONS}
          />
        </div>
      </div>

      {/* Podium 3 อันดับแรก */}
      {podium.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
          {podium.map((v, i) => (
            <PodiumCard key={v.id} vehicle={v} rank={i + 1} />
          ))}
        </div>
      )}

      {/* ตารางอันดับเต็ม */}
      <Card>
        <CardHeader
          title="ตารางอันดับทั้งหมด"
          subtitle={`${formatNumber(ranked.length)} คัน · ข้อมูล${PERIOD_LABEL[period]}`}
          action={
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Route className="h-3.5 w-3.5" />
                เรียงตามคะแนนรวม
              </span>
            }
        />
        {ranked.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="ไม่พบรถตามเงื่อนไขที่เลือก"
            subtitle="ลองเปลี่ยนประเภทรถหรือ Depot แล้วค้นหาอีกครั้ง"
          />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH className="w-16">อันดับ</TH>
                <TH>ทะเบียนรถ</TH>
                <TH>ประเภทรถ</TH>
                <TH>Depot</TH>
                <TH align="right">จำนวนงาน</TH>
                <TH align="right">จำนวนเที่ยว</TH>
                <TH>ตรงเวลา %</TH>
                <TH>ใช้งานรถ %</TH>
                <TH align="right">ระยะทางรวม (กม.)</TH>
                <TH align="right">รายได้รวม</TH>
                <TH align="right">คะแนนรวม</TH>
                <TH>สถานะ</TH>
              </TR>
            </THead>
            <TBody>
              {ranked.map((v, i) => {
                const rank = i + 1;
                return (
                  <TR key={v.id}>
                    <TD>
                      {rank <= 3 ? (
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${RANK_CIRCLE[rank]}`}
                        >
                          {rank}
                        </span>
                      ) : (
                        <span className="inline-flex h-7 w-7 items-center justify-center text-slate-500">
                          {rank}
                        </span>
                      )}
                    </TD>
                    <TD className="font-medium tracking-tight text-slate-900">
                      {v.plate}
                    </TD>
                    <TD className="text-slate-600">
                      {VEHICLE_TYPE_LABEL[v.type]}
                    </TD>
                    <TD className="text-slate-600">{depotName(v.depotId)}</TD>
                    <TD align="right" className="tabular-nums text-slate-900">
                      {formatNumber(v.jobsCompleted)}
                    </TD>
                    <TD align="right" className="tabular-nums text-slate-900">
                      {formatNumber(v.trips)}
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-16 shrink-0">
                          <ProgressBar
                            value={v.onTimeRate}
                            tone={rateTone(v.onTimeRate)}
                          />
                        </div>
                        <span className="tabular-nums text-slate-900">
                          {v.onTimeRate}%
                        </span>
                      </div>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <div className="w-16 shrink-0">
                          <ProgressBar
                            value={v.utilization}
                            tone={rateTone(v.utilization)}
                          />
                        </div>
                        <span className="tabular-nums text-slate-900">
                          {v.utilization}%
                        </span>
                      </div>
                    </TD>
                    <TD align="right" className="tabular-nums text-slate-900">
                      {formatNumber(v.totalDistanceKm)}
                    </TD>
                    <TD align="right" className="tabular-nums text-slate-900">
                      {formatBaht(v.totalRevenue)}
                    </TD>
                    <TD
                      align="right"
                      className="tabular-nums font-semibold tracking-tight text-slate-900"
                    >
                      {v.score}
                    </TD>
                    <TD>
                      <Badge tone={VEHICLE_STATUS_TONE[v.status]}>
                        {VEHICLE_STATUS_LABEL[v.status]}
                      </Badge>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
