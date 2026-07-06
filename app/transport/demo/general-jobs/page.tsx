"use client";

// หน้า "งานทั่วไป" — งานขนส่งสินค้าทั่วไปที่ไม่ใช่ตู้คอนเทนเนอร์
import { useMemo, useState } from "react";
import {
  Boxes,
  CircleCheck,
  ClipboardList,
  Hourglass,
  Truck,
} from "lucide-react";
import type { Job } from "@/lib/types";
import {
  DRIVER_STATUS_LABEL,
  DRIVER_STATUS_TONE,
  JOB_STATUS_LABEL,
  VEHICLE_STATUS_LABEL,
  VEHICLE_STATUS_TONE,
  VEHICLE_TYPE_LABEL,
  formatNumber,
} from "@/lib/labels";
import { useJobsStore } from "@/lib/store/jobs-store";
import { VEHICLES, vehiclePlate } from "@/lib/mock/vehicles";
import { DRIVERS, driverName } from "@/lib/mock/drivers";
import { depotName } from "@/lib/mock/depots";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { SelectField } from "@/components/ui/select-field";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { GeneralJobCard } from "@/components/general-jobs/job-card";
import { AssignModal } from "@/components/general-jobs/assign-modal";
import type { AssignOption } from "@/components/general-jobs/assign-modal";
import { ProblemModal } from "@/components/general-jobs/problem-modal";

// ---------- ตัวเลือก filter ----------
const STATUS_OPTIONS = [
  { value: "all", label: "ทุกสถานะ" },
  ...(Object.keys(JOB_STATUS_LABEL) as (keyof typeof JOB_STATUS_LABEL)[]).map(
    (status) => ({ value: status, label: JOB_STATUS_LABEL[status] })
  ),
];

const DATE_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "today", label: "วันนี้" },
  { value: "tomorrow", label: "พรุ่งนี้" },
];

// ลำดับการเรียงการ์ด: งานที่ต้องจัดการก่อนขึ้นก่อน เสร็จสิ้นอยู่ท้ายสุด
const STATUS_ORDER: Record<Job["status"], number> = {
  problem: 0,
  delayed: 1,
  pending: 2,
  assigned: 3,
  in_progress: 4,
  completed: 5,
};

// เทียบว่า ISO datetime ตรงกับวันเดียวกัน (เวลาท้องถิ่น) กับวันอ้างอิงหรือไม่
function isSameLocalDay(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth() &&
    d.getDate() === ref.getDate()
  );
}

export default function GeneralJobsPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const assignVehicle = useJobsStore((s) => s.assignVehicle);
  const assignDriver = useJobsStore((s) => s.assignDriver);
  const setStatus = useJobsStore((s) => s.setStatus);
  const updateJob = useJobsStore((s) => s.updateJob);
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");

  // modal มอบหมายรถ/คนขับ และ modal รายงานปัญหา
  const [assignTarget, setAssignTarget] = useState<{
    job: Job;
    kind: "vehicle" | "driver";
  } | null>(null);
  const [problemJob, setProblemJob] = useState<Job | null>(null);

  // เฉพาะงานทั่วไปเท่านั้น
  const generalJobs = useMemo(
    () => jobs.filter((job) => job.type === "general"),
    [jobs]
  );

  // สรุปตัวเลขบนการ์ดสถิติ
  const stats = useMemo(
    () => ({
      total: generalJobs.length,
      pending: generalJobs.filter((j) => j.status === "pending").length,
      inProgress: generalJobs.filter((j) => j.status === "in_progress").length,
      completed: generalJobs.filter((j) => j.status === "completed").length,
    }),
    [generalJobs]
  );

  // กรอง + เรียงงานตาม filter ที่เลือก
  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return generalJobs
      .filter((job) => {
        if (statusFilter !== "all" && job.status !== statusFilter) return false;
        if (dateFilter === "today" && !isSameLocalDay(job.appointmentTime, today))
          return false;
        if (
          dateFilter === "tomorrow" &&
          !isSameLocalDay(job.appointmentTime, tomorrow)
        )
          return false;
        if (q) {
          const haystack = [
            job.jobNo,
            job.customer,
            job.origin,
            job.destination,
            job.detail ?? "",
            job.note ?? "",
            vehiclePlate(job.vehicleId),
            driverName(job.driverId),
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
          a.appointmentTime.localeCompare(b.appointmentTime)
      );
  }, [generalJobs, statusFilter, dateFilter, search]);

  // ---------- ตัวเลือกใน modal มอบหมาย ----------
  const vehicleOptions: AssignOption[] = useMemo(
    () =>
      VEHICLES.filter((v) => v.status === "available").map((v) => ({
        id: v.id,
        title: v.plate,
        subtitle: `${VEHICLE_TYPE_LABEL[v.type]} · ${depotName(v.depotId)}`,
        badgeLabel: VEHICLE_STATUS_LABEL[v.status],
        badgeTone: VEHICLE_STATUS_TONE[v.status],
      })),
    []
  );

  const driverOptions: AssignOption[] = useMemo(
    () =>
      DRIVERS.filter((d) => d.status === "ready").map((d) => ({
        id: d.id,
        title: d.name,
        subtitle: `${d.code} · ${depotName(d.depotId)}`,
        badgeLabel: DRIVER_STATUS_LABEL[d.status],
        badgeTone: DRIVER_STATUS_TONE[d.status],
      })),
    []
  );

  // ---------- action handlers ----------
  function handleConfirmAssign(optionId: string) {
    if (!assignTarget) return;
    const { job, kind } = assignTarget;
    if (kind === "vehicle") {
      assignVehicle(job.id, optionId);
      toast(`มอบหมายรถ ${vehiclePlate(optionId)} ให้งาน ${job.jobNo} แล้ว`, "success");
      // ถ้ามีคนขับอยู่แล้ว store จะเลื่อนสถานะเป็น "มอบหมายแล้ว" ให้อัตโนมัติ
      if (job.status === "pending" && job.driverId) {
        toast(`งาน ${job.jobNo} เปลี่ยนสถานะเป็น "มอบหมายแล้ว"`, "info");
      }
    } else {
      assignDriver(job.id, optionId);
      toast(`มอบหมายคนขับ ${driverName(optionId)} ให้งาน ${job.jobNo} แล้ว`, "success");
      if (job.status === "pending" && job.vehicleId) {
        toast(`งาน ${job.jobNo} เปลี่ยนสถานะเป็น "มอบหมายแล้ว"`, "info");
      }
    }
    setAssignTarget(null);
  }

  function handleAccept(job: Job) {
    setStatus(job.id, "assigned");
    toast(`รับงาน ${job.jobNo} แล้ว — สถานะ "มอบหมายแล้ว"`, "success");
  }

  function handleStart(job: Job) {
    setStatus(job.id, "in_progress");
    toast(`เริ่มงาน ${job.jobNo} แล้ว — สถานะ "กำลังดำเนินการ"`, "info");
  }

  function handleComplete(job: Job) {
    setStatus(job.id, "completed");
    toast(`ปิดงาน ${job.jobNo} เรียบร้อย — งานเสร็จสมบูรณ์`, "success");
  }

  function handleConfirmProblem(problemText: string) {
    if (!problemJob) return;
    updateJob(problemJob.id, { problem: problemText });
    setStatus(problemJob.id, "problem");
    toast(`รายงานปัญหางาน ${problemJob.jobNo} แล้ว — สถานะ "มีปัญหา"`, "error");
    setProblemJob(null);
  }

  return (
    <div>
      <PageHeader
        title="งานทั่วไป"
        subtitle="งานขนส่งสินค้าทั่วไปที่ไม่ใช่ตู้คอนเทนเนอร์"
      />

      {/* การ์ดสถิติ */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="งานทั้งหมด"
          value={formatNumber(stats.total)}
          sub="งานทั่วไปในระบบ"
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="รอรับงาน"
          value={formatNumber(stats.pending)}
          sub="รอมอบหมายรถและคนขับ"
          icon={Hourglass}
          tone="amber"
        />
        <StatCard
          label="กำลังดำเนินการ"
          value={formatNumber(stats.inProgress)}
          sub="อยู่ระหว่างขนส่ง"
          icon={Truck}
          tone="sky"
        />
        <StatCard
          label="เสร็จสิ้น"
          value={formatNumber(stats.completed)}
          sub="ปิดงานเรียบร้อย"
          icon={CircleCheck}
          tone="emerald"
        />
      </div>

      {/* Filter */}
      <Card className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[200px_200px_minmax(0,1fr)]">
          <SelectField
            label="สถานะ"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_OPTIONS}
          />
          <SelectField
            label="วันที่นัดหมาย"
            value={dateFilter}
            onChange={setDateFilter}
            options={DATE_OPTIONS}
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              ค้นหา
            </span>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="ค้นหาเลขงาน ลูกค้า ต้นทาง ปลายทาง ทะเบียนรถ..."
            />
          </div>
        </div>
      </Card>

      {/* รายการการ์ดงาน */}
      <p className="mb-3 text-sm text-slate-500">
        แสดง {formatNumber(filteredJobs.length)} จาก{" "}
        {formatNumber(generalJobs.length)} งาน
      </p>

      {filteredJobs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Boxes}
            title="ไม่พบงานที่ตรงกับเงื่อนไข"
            subtitle="ลองปรับ filter สถานะ วันที่ หรือคำค้นหา"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <GeneralJobCard
              key={job.id}
              job={job}
              onAssignVehicle={(j) => setAssignTarget({ job: j, kind: "vehicle" })}
              onAssignDriver={(j) => setAssignTarget({ job: j, kind: "driver" })}
              onAccept={handleAccept}
              onStart={handleStart}
              onComplete={handleComplete}
              onReportProblem={setProblemJob}
            />
          ))}
        </div>
      )}

      {/* Modal มอบหมายรถ */}
      <AssignModal
        open={assignTarget?.kind === "vehicle"}
        title={`มอบหมายรถ — ${assignTarget?.job.jobNo ?? ""}`}
        description="เลือกรถที่พร้อมใช้งานเพื่อมอบหมายให้งานนี้"
        options={vehicleOptions}
        emptyTitle="ไม่มีรถที่พร้อมใช้งาน"
        emptySubtitle="รถทุกคันกำลังวิ่งงานหรืออยู่ระหว่างซ่อมบำรุง"
        confirmLabel="มอบหมายรถ"
        onClose={() => setAssignTarget(null)}
        onConfirm={handleConfirmAssign}
      />

      {/* Modal มอบหมายคนขับ */}
      <AssignModal
        open={assignTarget?.kind === "driver"}
        title={`มอบหมายคนขับ — ${assignTarget?.job.jobNo ?? ""}`}
        description="เลือกคนขับที่พร้อมรับงานเพื่อมอบหมายให้งานนี้"
        options={driverOptions}
        emptyTitle="ไม่มีคนขับที่พร้อมรับงาน"
        emptySubtitle="คนขับทุกคนกำลังทำงานหรืออยู่นอกเวลางาน"
        confirmLabel="มอบหมายคนขับ"
        onClose={() => setAssignTarget(null)}
        onConfirm={handleConfirmAssign}
      />

      {/* Modal รายงานปัญหา */}
      <ProblemModal
        open={problemJob !== null}
        jobNo={problemJob?.jobNo ?? ""}
        onClose={() => setProblemJob(null)}
        onConfirm={handleConfirmProblem}
      />
    </div>
  );
}
