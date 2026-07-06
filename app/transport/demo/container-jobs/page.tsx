"use client";

// ===== หน้า "งานตู้" — งานขนส่งตู้คอนเทนเนอร์ รับ-ส่ง ตู้หนักและตู้เปล่า =====
import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, Container, Truck } from "lucide-react";
import type { ContainerJobType, ContainerSize, Job, JobStatus } from "@/lib/types";
import {
  CONTAINER_JOB_TYPE_LABEL,
  JOB_STATUS_LABEL,
  formatNumber,
} from "@/lib/labels";
import { useJobsStore } from "@/lib/store/jobs-store";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { SelectField } from "@/components/ui/select-field";
import { SearchInput } from "@/components/ui/search-input";
import { ContainerJobsTable } from "@/components/container-jobs/container-jobs-table";
import type { JobAction } from "@/components/container-jobs/job-action-menu";
import { JobDetailModal } from "@/components/container-jobs/job-detail-modal";
import { AssignVehicleModal } from "@/components/container-jobs/assign-vehicle-modal";
import { AssignDriverModal } from "@/components/container-jobs/assign-driver-modal";
import { ChangeStatusModal } from "@/components/container-jobs/change-status-modal";
import { ReportProblemModal } from "@/components/container-jobs/report-problem-modal";

type ModalKind = Exclude<JobAction, "move_to_planning">;

const SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "20FT", label: "20FT" },
  { value: "40FT", label: "40FT" },
  { value: "40HQ", label: "40HQ" },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  ...(Object.entries(JOB_STATUS_LABEL) as [JobStatus, string][]).map(
    ([value, label]) => ({ value, label })
  ),
];

// ตัดช่องว่างและแปลงเป็นตัวพิมพ์เล็ก เพื่อให้ค้นหาเลขตู้แบบมี/ไม่มีช่องว่างก็เจอ
function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

export default function ContainerJobsPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const { toast } = useToast();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);

  // เฉพาะงานตู้เท่านั้น
  const containerJobs = useMemo(
    () => jobs.filter((j) => j.type === "container"),
    [jobs]
  );

  // ---- สถิติบนการ์ด 4 ใบ ----
  const total = containerJobs.length;
  const pendingCount = containerJobs.filter((j) => j.status === "pending").length;
  const inProgressCount = containerJobs.filter(
    (j) => j.status === "in_progress"
  ).length;
  const problemCount = containerJobs.filter((j) => j.status === "problem").length;
  const delayedCount = containerJobs.filter((j) => j.status === "delayed").length;

  // ---- ตัวเลือก filter ประเภทงานตู้ ----
  const typeOptions = useMemo(
    () => [
      { value: "all", label: "ทั้งหมด", count: total },
      ...(
        Object.entries(CONTAINER_JOB_TYPE_LABEL) as [ContainerJobType, string][]
      ).map(([value, label]) => ({
        value,
        label,
        count: containerJobs.filter((j) => j.containerJobType === value).length,
      })),
    ],
    [containerJobs, total]
  );

  // ---- กรอง + เรียงตามเวลานัดหมาย ----
  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return containerJobs
      .filter((j) => typeFilter === "all" || j.containerJobType === typeFilter)
      .filter(
        (j) =>
          sizeFilter === "all" || j.containerSize === (sizeFilter as ContainerSize)
      )
      .filter((j) => statusFilter === "all" || j.status === statusFilter)
      .filter((j) => {
        if (!q) return true;
        const hay = normalize(
          `${j.jobNo} ${j.containerNo ?? ""} ${j.customer}`
        );
        return hay.includes(q);
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [containerJobs, typeFilter, sizeFilter, statusFilter, search]);

  const selectedJob = containerJobs.find((j) => j.id === selectedJobId) ?? null;

  function closeModal() {
    setActiveModal(null);
    setSelectedJobId(null);
  }

  function handleAction(job: Job, action: JobAction) {
    if (action === "move_to_planning") {
      toast(`ย้ายงาน ${job.jobNo} ไปหน้าวางแผนและ Optimize แล้ว`, "info");
      return;
    }
    setSelectedJobId(job.id);
    setActiveModal(action);
  }

  return (
    <div>
      <PageHeader
        title="งานตู้"
        subtitle="งานขนส่งตู้คอนเทนเนอร์ รับ-ส่ง ตู้หนักและตู้เปล่า"
      />

      {/* การ์ดสถิติ 4 ใบ */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="งานตู้ทั้งหมด"
          value={formatNumber(total)}
          sub="งานตู้ทุกสถานะ"
          icon={Container}
          tone="blue"
        />
        <StatCard
          label="รอมอบหมาย"
          value={formatNumber(pendingCount)}
          sub="ยังไม่ระบุรถและคนขับ"
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          label="กำลังดำเนินการ"
          value={formatNumber(inProgressCount)}
          sub="อยู่ระหว่างวิ่งงาน"
          icon={Truck}
          tone="sky"
        />
        <StatCard
          label="มีปัญหา / ล่าช้า"
          value={formatNumber(problemCount + delayedCount)}
          sub={`มีปัญหา ${formatNumber(problemCount)} · ล่าช้า ${formatNumber(delayedCount)}`}
          icon={AlertTriangle}
          tone="red"
        />
      </div>

      {/* ตารางรายการงานตู้ + ตัวกรอง */}
      <Card>
        <CardHeader
          title="รายการงานตู้"
          subtitle={`แสดง ${formatNumber(filtered.length)} จาก ${formatNumber(total)} งาน`}
        />

        <div className="space-y-3 border-b border-slate-100 px-5 py-4">
          <FilterChips
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <SelectField
              label="ขนาดตู้"
              value={sizeFilter}
              onChange={setSizeFilter}
              options={SIZE_OPTIONS}
              className="md:w-40"
            />
            <SelectField
              label="สถานะ"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
              className="md:w-44"
            />
            <label className="block md:flex-1">
              <span className="mb-1 block text-xs font-medium text-slate-500">
                ค้นหา
              </span>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="ค้นหาเลขงาน / เลขตู้ / ลูกค้า..."
              />
            </label>
          </div>
        </div>

        <ContainerJobsTable jobs={filtered} onAction={handleAction} />
      </Card>

      {/* ---- Modals ---- */}
      {selectedJob && activeModal === "detail" && (
        <JobDetailModal job={selectedJob} onClose={closeModal} />
      )}
      {selectedJob && activeModal === "assign_vehicle" && (
        <AssignVehicleModal job={selectedJob} onClose={closeModal} />
      )}
      {selectedJob && activeModal === "assign_driver" && (
        <AssignDriverModal job={selectedJob} onClose={closeModal} />
      )}
      {selectedJob && activeModal === "change_status" && (
        <ChangeStatusModal job={selectedJob} onClose={closeModal} />
      )}
      {selectedJob && activeModal === "report_problem" && (
        <ReportProblemModal job={selectedJob} onClose={closeModal} />
      )}
    </div>
  );
}
