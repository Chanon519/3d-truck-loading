"use client";

// ===== หน้า Ranking คนขับ =====
// จัดอันดับประสิทธิภาพคนขับจาก mock data (DRIVERS) พร้อม filter ช่วงเวลา / Depot / ประเภทงาน
// การ filter เป็น mock: ช่วงเวลาใช้ตัวคูณปริมาณงาน, ประเภทงานถ่วง score คงที่ให้อันดับสลับเล็กน้อย

import { useMemo, useState } from "react";
import { Download, Medal, Trophy, Users } from "lucide-react";
import type { Driver } from "@/lib/types";
import {
  DRIVER_STATUS_LABEL,
  DRIVER_STATUS_TONE,
  formatNumber,
  type BadgeTone,
} from "@/lib/labels";
import { DRIVERS } from "@/lib/mock/drivers";
import { DEPOTS, depotName } from "@/lib/mock/depots";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { SelectField } from "@/components/ui/select-field";
import { ProgressBar } from "@/components/ui/progress";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";

// ---------- ตัวเลือก filter ----------
type PeriodKey = "today" | "week" | "month";
type JobTypeKey = "all" | "container" | "general" | "shuttle";

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "today", label: "วันนี้" },
  { value: "week", label: "สัปดาห์นี้" },
  { value: "month", label: "เดือนนี้" },
];

// ตัวคูณปริมาณงานตามช่วงเวลา (mock — เดือนนี้ = ข้อมูลเต็ม)
const PERIOD_FACTOR: Record<PeriodKey, number> = {
  today: 1 / 22,
  week: 7 / 30,
  month: 1,
};

const JOB_TYPE_OPTIONS: { value: JobTypeKey; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "container", label: "งานตู้" },
  { value: "general", label: "งานทั่วไป" },
  { value: "shuttle", label: "งานทอยตู้" },
];

// สัดส่วนปริมาณงานต่อประเภท (mock)
const JOB_TYPE_SHARE: Record<JobTypeKey, number> = {
  all: 1,
  container: 0.5,
  general: 0.3,
  shuttle: 0.2,
};

// ---------- ตัวช่วยคำนวณ mock ----------
// hash คงที่จาก string — ใช้ถ่วง score ให้อันดับสลับเล็กน้อยเมื่อเปลี่ยน filter
function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) % 997;
  }
  return h;
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

// แถวข้อมูลหลังปรับตาม filter แล้ว
interface RankedDriver extends Driver {
  rank: number;
  adjScore: number;
  adjJobs: number;
  adjTrips: number;
  adjWorkHours: number;
  adjIncidents: number;
}

function buildRanking(
  period: PeriodKey,
  depotId: string,
  jobType: JobTypeKey
): RankedDriver[] {
  const factor = PERIOD_FACTOR[period] * JOB_TYPE_SHARE[jobType];

  const rows = DRIVERS.filter(
    (d) => depotId === "all" || d.depotId === depotId
  ).map((d) => {
    // ถ่วง score คงที่ตามช่วงเวลา (เดือนนี้ = ค่าจริง)
    const periodDelta =
      period === "month" ? 0 : (stableHash(d.id + period) % 5) - 2;
    // ถ่วง score คงที่ตามประเภทงาน (ทั้งหมด = ค่าจริง)
    const typeDelta =
      jobType === "all" ? 0 : (stableHash(d.id + jobType) % 7) - 3;

    // เหตุผิดปกติ: ย่อส่วนตามช่วงเวลาแบบง่าย ๆ
    const adjIncidents =
      period === "today"
        ? d.incidents >= 3
          ? 1
          : 0
        : period === "week"
          ? Math.ceil(d.incidents / 2)
          : d.incidents;

    return {
      ...d,
      rank: 0,
      adjScore: clampScore(d.score + periodDelta + typeDelta),
      adjJobs: Math.max(1, Math.round(d.jobsCompleted * factor)),
      adjTrips: Math.max(1, Math.round(d.trips * factor)),
      adjWorkHours: Math.max(1, Math.round(d.workHours * PERIOD_FACTOR[period])),
      adjIncidents,
    };
  });

  rows.sort((a, b) => b.adjScore - a.adjScore || b.score - a.score);
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}

// ---------- โทนสีตามช่วงคะแนน ----------
function safetyTone(score: number): BadgeTone {
  if (score >= 90) return "emerald";
  if (score >= 80) return "amber";
  return "red";
}

function onTimeTone(rate: number): BadgeTone {
  if (rate >= 95) return "emerald";
  if (rate >= 88) return "sky";
  return "amber";
}

// ---------- สไตล์ podium ตามอันดับ (class เต็มทุกตัว — ห้าม dynamic string) ----------
const PODIUM_STYLE: Record<
  number,
  { avatar: string; ring: string; badge: string; label: string }
> = {
  1: {
    avatar: "bg-amber-400 text-white",
    ring: "ring-4 ring-amber-100",
    badge: "bg-amber-50 text-amber-700",
    label: "อันดับ 1",
  },
  2: {
    avatar: "bg-slate-400 text-white",
    ring: "ring-4 ring-slate-100",
    badge: "bg-slate-100 text-slate-600",
    label: "อันดับ 2",
  },
  3: {
    avatar: "bg-orange-400 text-white",
    ring: "ring-4 ring-orange-100",
    badge: "bg-orange-50 text-orange-700",
    label: "อันดับ 3",
  },
};

// จัดลำดับการแสดงบนจอกว้าง: อันดับ 2 - 1 - 3 (แชมป์อยู่กลาง)
const PODIUM_ORDER: Record<number, string> = {
  1: "md:order-2",
  2: "md:order-1",
  3: "md:order-3",
};

function PodiumCard({ driver }: { driver: RankedDriver }) {
  const style = PODIUM_STYLE[driver.rank];
  const isChampion = driver.rank === 1;

  return (
    <Card
      className={`flex flex-col items-center px-5 py-6 text-center ${PODIUM_ORDER[driver.rank]} ${
        isChampion ? "border-amber-200 md:-mt-3 md:pb-9" : ""
      }`}
    >
      <span
        className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
      >
        {isChampion ? (
          <Trophy className="h-3.5 w-3.5" />
        ) : (
          <Medal className="h-3.5 w-3.5" />
        )}
        {style.label}
      </span>

      {/* avatar ตัวอักษรแรกของชื่อ */}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${style.avatar} ${style.ring}`}
      >
        {driver.name.charAt(0)}
      </div>

      <p className="mt-3 font-semibold text-slate-900">{driver.name}</p>
      <p className="text-sm text-slate-500">
        {driver.code} · {depotName(driver.depotId)}
      </p>

      <p className="mt-3 text-4xl font-bold text-slate-900">
        {driver.adjScore}
        <span className="ml-1 text-sm font-normal text-slate-400">คะแนน</span>
      </p>

      {/* แถวตัวชี้วัดย่อย */}
      <div className="mt-4 grid w-full grid-cols-3 divide-x divide-slate-100 rounded-xl bg-slate-50 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {driver.onTimeRate}%
          </p>
          <p className="mt-0.5 text-xs text-slate-500">ตรงเวลา</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {driver.safetyScore}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">ความปลอดภัย</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {driver.serviceScore}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">บริการ</p>
        </div>
      </div>
    </Card>
  );
}

export default function DriverRankingPage() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [depotId, setDepotId] = useState<string>("all");
  const [jobType, setJobType] = useState<JobTypeKey>("all");

  const ranked = useMemo(
    () => buildRanking(period, depotId, jobType),
    [period, depotId, jobType]
  );
  const podium = ranked.slice(0, 3);

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "";

  return (
    <div>
      <PageHeader
        title="Ranking คนขับ"
        subtitle="จัดอันดับประสิทธิภาพคนขับ จากความตรงเวลา ความปลอดภัย และคุณภาพบริการ"
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast("ส่งออกรายงาน Ranking คนขับแล้ว (โหมด Demo)", "success")
            }
          >
            <Download className="h-4 w-4" />
            ส่งออกรายงาน
          </Button>
        }
      />

      {/* Filter */}
      <Card className="mb-6 flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1.5 text-xs font-medium text-slate-500">ช่วงเวลา</p>
          <FilterChips
            options={PERIOD_OPTIONS}
            value={period}
            onChange={(v) => setPeriod(v as PeriodKey)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[26rem]">
          <SelectField
            label="Depot"
            value={depotId}
            onChange={setDepotId}
            options={[
              { value: "all", label: "ทุก Depot" },
              ...DEPOTS.map((d) => ({ value: d.id, label: d.name })),
            ]}
          />
          <SelectField
            label="ประเภทงาน"
            value={jobType}
            onChange={(v) => setJobType(v as JobTypeKey)}
            options={JOB_TYPE_OPTIONS}
          />
        </div>
      </Card>

      {ranked.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="ไม่พบคนขับตามเงื่อนไขที่เลือก"
            subtitle="ลองเปลี่ยน Depot หรือประเภทงาน แล้วค้นหาอีกครั้ง"
          />
        </Card>
      ) : (
        <>
          {/* Podium 3 อันดับแรก */}
          <div className="mb-6 grid grid-cols-1 items-end gap-4 md:grid-cols-3">
            {podium.map((d) => (
              <PodiumCard key={d.id} driver={d} />
            ))}
          </div>

          {/* ตารางอันดับทั้งหมด */}
          <Card>
            <CardHeader
              title="อันดับคนขับทั้งหมด"
              subtitle={`${periodLabel} · ทั้งหมด ${formatNumber(ranked.length)} คน เรียงตามคะแนนรวม`}
            />
            <Table>
              <THead>
                <TR className="hover:bg-slate-50">
                  <TH align="center" className="w-16">
                    อันดับ
                  </TH>
                  <TH>คนขับ</TH>
                  <TH>Depot</TH>
                  <TH align="right">จำนวนงาน</TH>
                  <TH align="right">จำนวนเที่ยว</TH>
                  <TH className="min-w-36">ตรงเวลา %</TH>
                  <TH align="center">ความปลอดภัย</TH>
                  <TH align="center">บริการ</TH>
                  <TH align="center">เหตุผิดปกติ</TH>
                  <TH align="right">ชั่วโมงรวม</TH>
                  <TH align="right">คะแนนรวม</TH>
                  <TH>สถานะ</TH>
                </TR>
              </THead>
              <TBody>
                {ranked.map((d) => (
                  <TR key={d.id}>
                    <TD align="center">
                      {d.rank <= 3 ? (
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${PODIUM_STYLE[d.rank].badge}`}
                        >
                          {d.rank}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-slate-500">
                          {d.rank}
                        </span>
                      )}
                    </TD>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                          {d.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {d.name}
                          </p>
                          <p className="text-xs text-slate-500">{d.code}</p>
                        </div>
                      </div>
                    </TD>
                    <TD className="text-slate-600">
                      {depotName(d.depotId)}
                    </TD>
                    <TD align="right" className="text-slate-700">
                      {formatNumber(d.adjJobs)}
                    </TD>
                    <TD align="right" className="text-slate-700">
                      {formatNumber(d.adjTrips)}
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <ProgressBar
                          value={d.onTimeRate}
                          tone={onTimeTone(d.onTimeRate)}
                          className="w-20"
                        />
                        <span className="text-xs font-medium text-slate-600">
                          {d.onTimeRate}%
                        </span>
                      </div>
                    </TD>
                    <TD align="center">
                      <Badge tone={safetyTone(d.safetyScore)}>
                        {d.safetyScore}
                      </Badge>
                    </TD>
                    <TD align="center" className="text-slate-700">
                      {d.serviceScore}
                    </TD>
                    <TD align="center">
                      {d.adjIncidents > 0 ? (
                        <Badge tone="red">{d.adjIncidents}</Badge>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TD>
                    <TD align="right" className="text-slate-700">
                      {formatNumber(d.adjWorkHours)} ชม.
                    </TD>
                    <TD align="right">
                      <span className="font-bold text-slate-900">
                        {d.adjScore}
                      </span>
                    </TD>
                    <TD>
                      <Badge tone={DRIVER_STATUS_TONE[d.status]}>
                        {DRIVER_STATUS_LABEL[d.status]}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
