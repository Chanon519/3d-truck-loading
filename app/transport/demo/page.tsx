"use client";

// ===== หน้า "ภาพรวม" (Dashboard) — สรุปสถานการณ์ทั้งระบบใน 1 หน้า =====
// ตัวเลขทุกตัวคำนวณจริงจาก mock data (JOBS ผ่าน store, VEHICLES, DRIVERS, DEPOTS)
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  Box,
  CircleCheck,
  ClipboardList,
  Container,
  Forklift,
  RefreshCw,
  Route,
  Sparkles,
  Timer,
  TriangleAlert,
  Trophy,
  Truck,
  UserCheck,
  Warehouse,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useJobsStore } from "@/lib/store/jobs-store";
import { VEHICLES } from "@/lib/mock/vehicles";
import { DRIVERS } from "@/lib/mock/drivers";
import { DEPOTS } from "@/lib/mock/depots";
import {
  JOB_PRIORITY_LABEL,
  JOB_PRIORITY_TONE,
  JOB_STATUS_LABEL,
  JOB_STATUS_TONE,
  JOB_TYPE_LABEL,
  JOB_TYPE_TONE,
  VEHICLE_TYPE_LABEL,
  formatNumber,
  formatThaiDateTime,
} from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";
import type { Job, JobType } from "@/lib/types";
import { JobTypeDonut } from "@/components/overview/job-type-donut";
import {
  HourlyJobsChart,
  type HourlyBucket,
} from "@/components/overview/hourly-jobs-chart";

// ---------- ค่าคงที่ระดับ module (ข้อมูล mock ที่ไม่เปลี่ยนระหว่างใช้งาน) ----------

// Top 3 รถ/คนขับ ตามคะแนนรวม
const TOP_VEHICLES = [...VEHICLES].sort((a, b) => b.score - a.score).slice(0, 3);
const TOP_DRIVERS = [...DRIVERS].sort((a, b) => b.score - a.score).slice(0, 3);

// ช่วงเวลานัดหมายวันนี้ 06:00–21:00 รวมเป็นช่วงละ 3 ชม.
const HOUR_BUCKETS = [
  { label: "06-09", from: 6, to: 9 },
  { label: "09-12", from: 9, to: 12 },
  { label: "12-15", from: 12, to: 15 },
  { label: "15-18", from: 15, to: 18 },
  { label: "18-21", from: 18, to: 21 },
];

// ทางลัดไปหน้าหลักของระบบ
const SHORTCUTS: {
  label: string;
  desc: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: "จัดการงาน",
    desc: "ดู มอบหมาย และติดตามงานทั้งหมด",
    href: "/transport/demo/jobs",
    icon: ClipboardList,
  },
  {
    label: "จัดการ Depot",
    desc: "ผังช่องจอดและลานตู้ทั้ง 3 แห่ง",
    href: "/transport/demo/depot",
    icon: Warehouse,
  },
  {
    label: "จัดของเข้า Container 3D",
    desc: "วางแผนจัดเรียงสินค้าในตู้",
    href: "/transport/demo/loading-3d",
    icon: Box,
  },
  {
    label: "วางแผนและ Optimize",
    desc: "จัดสรรรถและเส้นทางอัตโนมัติ",
    href: "/transport/demo/planning",
    icon: Sparkles,
  },
];

// โทนสี ProgressBar ตามความหนาแน่นการใช้พื้นที่
function utilizationTone(utilization: number): BadgeTone {
  if (utilization >= 90) return "red";
  if (utilization >= 70) return "amber";
  return "blue";
}

// ลำดับความรุนแรงของงานที่ต้องติดตาม (น้อย = รุนแรงกว่า แสดงก่อน)
function followUpSeverity(job: Job): number {
  if (job.status === "problem") return 0;
  if (job.status === "delayed") return 1;
  return 2;
}

// ---------- การ์ดคู่ "รถอันดับดี" / "คนขับอันดับดี" ----------
function TopRankList({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: {
    id: string;
    primary: string;
    secondary: string;
    score: number;
    onTimeRate: number;
  }[];
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <ul className="divide-y divide-slate-100 px-5">
        {rows.map((row, i) => (
          <li key={row.id} className="flex items-center gap-3 py-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                i === 0 ? "bg-amber-50" : "bg-slate-100"
              }`}
            >
              {i === 0 ? (
                <Trophy className="h-4 w-4 text-amber-500" />
              ) : (
                <span className="text-sm font-semibold text-slate-500">
                  {i + 1}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {row.primary}
              </p>
              <p className="truncate text-xs text-slate-500">
                {row.secondary} · ตรงเวลา {row.onTimeRate}%
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-blue-600">
                {formatNumber(row.score)}
              </p>
              <p className="text-xs text-slate-400">คะแนน</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function OverviewPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const { toast } = useToast();

  // "วันนี้" ของ demo = วันที่เร็วที่สุดในชุดข้อมูลงาน (mock มีงานวันนี้ + พรุ่งนี้)
  const todayKey = useMemo(
    () =>
      jobs
        .map((j) => j.appointmentTime.slice(0, 10))
        .sort()[0] ?? "",
    [jobs]
  );

  const todayJobs = useMemo(
    () => jobs.filter((j) => j.appointmentTime.slice(0, 10) === todayKey),
    [jobs, todayKey]
  );

  // ---------- ตัวเลขหลักของวันนี้ ----------
  const stats = useMemo(() => {
    const inProgress = todayJobs.filter(
      (j) => j.status === "in_progress"
    ).length;
    const completed = todayJobs.filter((j) => j.status === "completed").length;
    const delayed = todayJobs.filter((j) => j.status === "delayed").length;
    const problem = todayJobs.filter((j) => j.status === "problem").length;

    const typeCounts: Record<JobType, number> = {
      container: 0,
      general: 0,
      shuttle: 0,
    };
    for (const job of todayJobs) typeCounts[job.type] += 1;

    const containerToday = todayJobs.filter((j) => j.type === "container");
    const containerWaiting = containerToday.filter(
      (j) => j.status === "pending" || j.status === "assigned"
    ).length;
    const containerLoading = containerToday.filter(
      (j) => j.status === "in_progress"
    ).length;

    const shuttleCompleted = todayJobs.filter(
      (j) => j.type === "shuttle" && j.status === "completed"
    ).length;

    return {
      total: todayJobs.length,
      inProgress,
      completed,
      delayed,
      problem,
      lateTotal: delayed + problem,
      typeCounts,
      containerWaiting,
      containerLoading,
      shuttleToday: typeCounts.shuttle,
      shuttleCompleted,
    };
  }, [todayJobs]);

  const availableVehicles = VEHICLES.filter(
    (v) => v.status === "available"
  ).length;
  const onJobVehicles = VEHICLES.filter((v) => v.status === "on_job").length;
  const readyDrivers = DRIVERS.filter((d) => d.status === "ready").length;

  // ---------- งานตามช่วงเวลานัดหมายวันนี้ ----------
  const hourlyData: HourlyBucket[] = useMemo(
    () =>
      HOUR_BUCKETS.map((bucket) => ({
        label: bucket.label,
        rangeLabel: `ช่วง ${String(bucket.from).padStart(2, "0")}:00–${String(
          bucket.to
        ).padStart(2, "0")}:00 น.`,
        count: todayJobs.filter((j) => {
          const hour = Number(j.appointmentTime.slice(11, 13));
          return hour >= bucket.from && hour < bucket.to;
        }).length,
      })),
    [todayJobs]
  );

  // ---------- งานที่ต้องติดตาม: delayed / problem / priority critical ----------
  const followUps = useMemo(
    () =>
      jobs
        .filter(
          (j) =>
            j.status === "delayed" ||
            j.status === "problem" ||
            j.priority === "critical"
        )
        .sort(
          (a, b) =>
            followUpSeverity(a) - followUpSeverity(b) ||
            a.appointmentTime.localeCompare(b.appointmentTime)
        ),
    [jobs]
  );

  const todayLabel = todayKey
    ? new Date(`${todayKey}T00:00:00+07:00`).toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const completedPercent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="ภาพรวม"
        subtitle={`สรุปสถานการณ์งานขนส่งประจำ${todayLabel}`}
        actions={
          <Button
            variant="outline"
            onClick={() => toast("อัปเดตข้อมูลภาพรวมล่าสุดแล้ว", "success")}
          >
            <RefreshCw className="h-4 w-4" />
            รีเฟรชข้อมูล
          </Button>
        }
      />

      {/* ---------- แถว 1: StatCard หลัก ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="งานทั้งหมดวันนี้"
          value={formatNumber(stats.total)}
          sub={`ตู้ ${formatNumber(stats.typeCounts.container)} · ทั่วไป ${formatNumber(
            stats.typeCounts.general
          )} · ทอยตู้ ${formatNumber(stats.typeCounts.shuttle)}`}
          icon={ClipboardList}
          tone="blue"
          href="/transport/demo/jobs"
        />
        <StatCard
          label="กำลังดำเนินการ"
          value={formatNumber(stats.inProgress)}
          sub="งานที่กำลังวิ่งอยู่ตอนนี้"
          icon={Timer}
          tone="sky"
        />
        <StatCard
          label="เสร็จแล้ว"
          value={formatNumber(stats.completed)}
          sub={`คิดเป็น ${completedPercent}% ของงานวันนี้`}
          icon={CircleCheck}
          tone="emerald"
        />
        <StatCard
          label="ล่าช้า"
          value={formatNumber(stats.lateTotal)}
          sub={`ล่าช้า ${formatNumber(stats.delayed)} · มีปัญหา ${formatNumber(
            stats.problem
          )}`}
          icon={TriangleAlert}
          tone="amber"
        />
      </div>

      {/* ---------- แถว 2: StatCard รอง ---------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="รถพร้อมใช้งาน"
          value={`${formatNumber(availableVehicles)}/${formatNumber(VEHICLES.length)}`}
          sub="คัน พร้อมรับงานทันที"
          icon={Truck}
          tone="emerald"
          href="/transport/demo/vehicles"
        />
        <StatCard
          label="รถกำลังวิ่งงาน"
          value={formatNumber(onJobVehicles)}
          sub={`จากทั้งหมด ${formatNumber(VEHICLES.length)} คัน`}
          icon={Route}
          tone="sky"
        />
        <StatCard
          label="คนขับพร้อมงาน"
          value={`${formatNumber(readyDrivers)}/${formatNumber(DRIVERS.length)}`}
          sub="คน พร้อมออกงานทันที"
          icon={UserCheck}
          tone="emerald"
          href="/transport/demo/drivers"
        />
        <StatCard
          label="งานทอยตู้วันนี้"
          value={formatNumber(stats.shuttleToday)}
          sub={`เสร็จแล้ว ${formatNumber(stats.shuttleCompleted)} งาน`}
          icon={ArrowLeftRight}
          tone="sky"
          href="/transport/demo/shuttle-jobs"
        />
      </div>

      {/* ---------- แถว 3: Container / Depot / งานตามช่วงเวลา ---------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* สถานะ Container */}
        <Card>
          <CardHeader
            title="สถานะ Container"
            subtitle="งานตู้วันนี้ + สัดส่วนประเภทงาน"
          />
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Container className="h-4 w-4" />
                  <span className="text-xs">ตู้รอดำเนินการ</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatNumber(stats.containerWaiting)}
                </p>
                <p className="text-xs text-slate-500">รอเริ่มงาน/มอบหมายแล้ว</p>
              </div>
              <div className="rounded-xl bg-sky-50 p-3">
                <div className="flex items-center gap-2 text-sky-600">
                  <Forklift className="h-4 w-4" />
                  <span className="text-xs">กำลังโหลด</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatNumber(stats.containerLoading)}
                </p>
                <p className="text-xs text-slate-500">กำลังดำเนินการขนส่ง</p>
              </div>
            </div>
            <div className="mt-4">
              <JobTypeDonut counts={stats.typeCounts} />
            </div>
          </div>
        </Card>

        {/* การใช้พื้นที่ Depot */}
        <Card>
          <CardHeader
            title="การใช้พื้นที่ Depot"
            subtitle="อัตราการใช้พื้นที่แต่ละแห่ง"
            action={
              <Link
                href="/transport/demo/depot"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ดูผัง Depot
              </Link>
            }
          />
          <div className="space-y-5 p-5">
            {DEPOTS.map((depot) => {
              const vehiclesInDepot = VEHICLES.filter(
                (v) => v.depotId === depot.id
              ).length;
              return (
                <div key={depot.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {depot.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {depot.province} · รถประจำ{" "}
                        {formatNumber(vehiclesInDepot)} คัน
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {depot.utilization}%
                    </p>
                  </div>
                  <ProgressBar
                    value={depot.utilization}
                    tone={utilizationTone(depot.utilization)}
                    className="mt-2"
                  />
                </div>
              );
            })}
            <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
              พื้นที่ใช้งานตั้งแต่ 70% ขึ้นไปถือว่าเริ่มหนาแน่น
              ควรวางแผนทอยตู้ล่วงหน้า
            </p>
          </div>
        </Card>

        {/* งานตามช่วงเวลา */}
        <Card>
          <CardHeader
            title="งานตามช่วงเวลา"
            subtitle="จำนวนงานตามเวลานัดหมายวันนี้ (06:00–21:00 น.)"
          />
          <div className="p-5">
            <HourlyJobsChart data={hourlyData} />
            <p className="mt-3 text-xs text-slate-400">
              ช่วงเช้า 06:00–12:00 น. เป็นช่วงที่มีงานหนาแน่นที่สุดของวัน
            </p>
          </div>
        </Card>
      </div>

      {/* ---------- แถว 4: งานที่ต้องติดตาม + อันดับดี ---------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* งานที่ต้องติดตาม */}
        <Card>
          <CardHeader
            title="งานที่ต้องติดตาม"
            subtitle="งานล่าช้า มีปัญหา หรือความสำคัญด่วนมาก"
            action={
              <Link
                href="/transport/demo/jobs"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ดูทั้งหมด
              </Link>
            }
          />
          <Table>
            <THead>
              <TR>
                <TH>เลขงาน</TH>
                <TH>ประเภท</TH>
                <TH>ลูกค้า</TH>
                <TH>เวลานัด</TH>
                <TH>สถานะ</TH>
                <TH>หมายเหตุ</TH>
              </TR>
            </THead>
            <TBody>
              {followUps.length === 0 ? (
                <TR>
                  <TD colSpan={6} align="center" className="text-slate-500">
                    ไม่มีงานที่ต้องติดตามในตอนนี้
                  </TD>
                </TR>
              ) : (
                followUps.map((job) => (
                  <TR key={job.id}>
                    <TD className="font-medium text-slate-900">{job.jobNo}</TD>
                    <TD>
                      <Badge tone={JOB_TYPE_TONE[job.type]}>
                        {JOB_TYPE_LABEL[job.type]}
                      </Badge>
                    </TD>
                    <TD className="text-slate-600">
                      <div className="max-w-[180px] truncate" title={job.customer}>
                        {job.customer}
                      </div>
                    </TD>
                    <TD className="whitespace-nowrap text-slate-600">
                      {formatThaiDateTime(job.appointmentTime)}
                    </TD>
                    <TD>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge tone={JOB_STATUS_TONE[job.status]}>
                          {JOB_STATUS_LABEL[job.status]}
                        </Badge>
                        {job.priority === "critical" && (
                          <Badge tone={JOB_PRIORITY_TONE[job.priority]}>
                            {JOB_PRIORITY_LABEL[job.priority]}
                          </Badge>
                        )}
                      </div>
                    </TD>
                    <TD className="text-slate-500">
                      <div
                        className="max-w-[220px] truncate"
                        title={job.problem ?? job.note ?? "-"}
                      >
                        {job.problem ?? job.note ?? "-"}
                      </div>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </Card>

        {/* การ์ดคู่: รถอันดับดี / คนขับอันดับดี */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TopRankList
            title="รถอันดับดี"
            subtitle="Top 3 ตามคะแนนรวม"
            rows={TOP_VEHICLES.map((v) => ({
              id: v.id,
              primary: v.plate,
              secondary: VEHICLE_TYPE_LABEL[v.type],
              score: v.score,
              onTimeRate: v.onTimeRate,
            }))}
          />
          <TopRankList
            title="คนขับอันดับดี"
            subtitle="Top 3 ตามคะแนนรวม"
            rows={TOP_DRIVERS.map((d) => ({
              id: d.id,
              primary: d.name,
              secondary: d.code,
              score: d.score,
              onTimeRate: d.onTimeRate,
            }))}
          />
        </div>
      </div>

      {/* ---------- แถวล่าง: ทางลัด ---------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <shortcut.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {shortcut.label}
              </p>
              <p className="truncate text-xs text-slate-500">{shortcut.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-blue-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
