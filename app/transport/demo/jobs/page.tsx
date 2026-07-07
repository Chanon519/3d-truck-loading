"use client";

// หน้า "จัดการงาน" — รวมงานขนส่งทุกประเภท (งานตู้ / งานทั่วไป / งานทอยตู้) ในที่เดียว

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleCheck,
  ClipboardList,
  Clock,
  Plus,
  Sparkles,
  TriangleAlert,
  Truck,
  X,
} from "lucide-react";
import type { Job, JobStatus } from "@/lib/types";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterChips } from "@/components/ui/filter-chips";
import { SelectField } from "@/components/ui/select-field";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/components/ui/toast";
import { useJobsStore } from "@/lib/store/jobs-store";
import { usePlansStore, findPlanForJob } from "@/lib/store/plans-store";
import { derivePlanState } from "@/lib/plan-helpers";
import type { BadgeTone } from "@/lib/labels";
import { JOB_STATUS_LABEL, JOB_TYPE_LABEL, formatNumber } from "@/lib/labels";
import { JobsTable } from "@/components/jobs/jobs-table";
import type { JobAction } from "@/components/jobs/job-actions-menu";
import { JobDetailModal } from "@/components/jobs/job-detail-modal";
import { AssignVehicleModal } from "@/components/jobs/assign-vehicle-modal";
import { AssignDriverModal } from "@/components/jobs/assign-driver-modal";
import { ChangeStatusModal } from "@/components/jobs/change-status-modal";
import { CreatePlanModal } from "@/components/planning/create-plan-modal";

// วันอ้างอิงของชุดข้อมูล Demo (สอดคล้องกับ lib/mock/jobs.ts — งานวันนี้ 2026-07-03)
const DEMO_TODAY = "2026-07-03";
const DEMO_TOMORROW = "2026-07-04";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  ...(Object.keys(JOB_STATUS_LABEL) as JobStatus[]).map((status) => ({
    value: status,
    label: JOB_STATUS_LABEL[status],
  })),
];

const DATE_FILTER_OPTIONS = [
  { value: "all", label: "ทั้งหมด" },
  { value: "today", label: "วันนี้" },
  { value: "tomorrow", label: "พรุ่งนี้" },
];

export default function JobsPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const createPlan = usePlansStore((s) => s.createPlan);
  const plans = usePlansStore((s) => s.plans);
  const { toast } = useToast();
  const router = useRouter();

  // ป้าย "อยู่ในแผน" — ให้กับตารางงาน
  const planTag = (jobId: string) => {
    const plan = findPlanForJob(plans, jobId);
    if (!plan) return null;
    const applied = derivePlanState(plan) === "applied";
    const tone: BadgeTone = applied ? "violet" : "slate";
    return {
      text: applied ? `อยู่ในแผน ${plan.id}` : `ร่างแผน ${plan.id}`,
      tone,
    };
  };

  // ---------- ตัวกรอง ----------
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ---------- โหมดเลือกงานเพื่อสร้างแผน ----------
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  // ---------- Modal ----------
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [assignVehicleJob, setAssignVehicleJob] = useState<Job | null>(null);
  const [assignDriverJob, setAssignDriverJob] = useState<Job | null>(null);
  const [changeStatusJob, setChangeStatusJob] = useState<Job | null>(null);

  // ---------- สถิติหัวหน้า (นับจาก store ทั้งหมด ไม่ขึ้นกับตัวกรอง) ----------
  const stats = useMemo(() => {
    const byStatus = (statuses: JobStatus[]) =>
      jobs.filter((j) => statuses.includes(j.status)).length;
    return {
      total: jobs.length,
      pending: byStatus(["pending"]),
      assigned: byStatus(["assigned"]),
      waiting: byStatus(["pending", "assigned"]),
      inProgress: byStatus(["in_progress"]),
      completed: byStatus(["completed"]),
      delayed: byStatus(["delayed"]),
      problem: byStatus(["problem"]),
      issues: byStatus(["delayed", "problem"]),
      container: jobs.filter((j) => j.type === "container").length,
      general: jobs.filter((j) => j.type === "general").length,
      shuttle: jobs.filter((j) => j.type === "shuttle").length,
    };
  }, [jobs]);

  const typeChipOptions = [
    { value: "all", label: "ทั้งหมด", count: stats.total },
    { value: "container", label: JOB_TYPE_LABEL.container, count: stats.container },
    { value: "general", label: JOB_TYPE_LABEL.general, count: stats.general },
    { value: "shuttle", label: JOB_TYPE_LABEL.shuttle, count: stats.shuttle },
  ];

  // ---------- กรอง + เรียงตามเวลานัดหมาย ----------
  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs
      .filter((job) => {
        if (typeFilter !== "all" && job.type !== typeFilter) return false;
        if (statusFilter !== "all" && job.status !== statusFilter) return false;
        if (dateFilter !== "all") {
          // mock ทุกงานเขียน ISO พร้อม offset +07:00 → ตัดเอาส่วนวันที่ได้ตรง ๆ
          const day = job.appointmentTime.slice(0, 10);
          if (dateFilter === "today" && day !== DEMO_TODAY) return false;
          if (dateFilter === "tomorrow" && day !== DEMO_TOMORROW) return false;
        }
        if (q) {
          const haystack =
            `${job.jobNo} ${job.customer} ${job.origin} ${job.destination}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [jobs, typeFilter, statusFilter, dateFilter, search]);

  // ---------- เลือกงานสร้างแผน ----------
  const selectedJobs = useMemo(
    () => jobs.filter((j) => selectedIds.includes(j.id)),
    [jobs, selectedIds]
  );

  const toggleSelect = (jobId: string) =>
    setSelectedIds((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );

  const toggleAll = () => {
    const visibleIds = filteredJobs.map((j) => j.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : visibleIds);
  };

  const handleCreatePlan = (name: string) => {
    const planId = createPlan(name, selectedIds);
    setPlanModalOpen(false);
    setSelectedIds([]);
    toast(`สร้างแผน ${planId} แล้ว`, "success");
    router.push(`/transport/demo/planning/${planId}`);
  };

  // ---------- เมนูจัดการรายแถว ----------
  const handleAction = (job: Job, action: JobAction) => {
    switch (action) {
      case "detail":
        setDetailJob(job);
        break;
      case "assign_vehicle":
        setAssignVehicleJob(job);
        break;
      case "assign_driver":
        setAssignDriverJob(job);
        break;
      case "change_status":
        setChangeStatusJob(job);
        break;
      case "create_plan":
        // สร้างแผนจากงานเดียว — ตั้ง selection แล้วเปิด modal
        setSelectedIds([job.id]);
        setPlanModalOpen(true);
        break;
    }
  };

  return (
    <div>
      <PageHeader
        title="จัดการงาน"
        subtitle="งานขนส่งทั้งหมดทุกประเภทในที่เดียว"
        actions={
          <Button
            onClick={() =>
              toast("โหมด Demo: ยังไม่เปิดใช้การสร้างงาน", "info")
            }
          >
            <Plus className="h-4 w-4" />
            สร้างงานใหม่
          </Button>
        }
      />

      {/* ---------- สถิติภาพรวม 5 ใบ ---------- */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="งานทั้งหมด"
          value={formatNumber(stats.total)}
          sub={`ตู้ ${formatNumber(stats.container)} · ทั่วไป ${formatNumber(stats.general)} · ทอยตู้ ${formatNumber(stats.shuttle)}`}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="รอดำเนินการ"
          value={formatNumber(stats.waiting)}
          sub={`รอ ${formatNumber(stats.pending)} · มอบหมายแล้ว ${formatNumber(stats.assigned)}`}
          icon={Clock}
          tone="amber"
        />
        <StatCard
          label="กำลังดำเนินการ"
          value={formatNumber(stats.inProgress)}
          icon={Truck}
          tone="sky"
        />
        <StatCard
          label="เสร็จสิ้น"
          value={formatNumber(stats.completed)}
          icon={CircleCheck}
          tone="emerald"
        />
        <StatCard
          label="ล่าช้า + ปัญหา"
          value={formatNumber(stats.issues)}
          sub={`ล่าช้า ${formatNumber(stats.delayed)} · มีปัญหา ${formatNumber(stats.problem)}`}
          icon={TriangleAlert}
          tone="red"
        />
      </div>

      {/* ---------- แถวตัวกรอง ---------- */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col gap-4">
          <FilterChips
            options={typeChipOptions}
            value={typeFilter}
            onChange={setTypeFilter}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SelectField
              label="สถานะ"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_FILTER_OPTIONS}
            />
            <SelectField
              label="วันที่นัดหมาย"
              value={dateFilter}
              onChange={setDateFilter}
              options={DATE_FILTER_OPTIONS}
            />
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-500">
                ค้นหา
              </span>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="เลขงาน / ลูกค้า / ต้นทาง / ปลายทาง"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ---------- ตารางงาน ---------- */}
      <Card className={selectedIds.length > 0 ? "mb-24" : ""}>
        <CardHeader
          title="รายการงาน"
          subtitle={`แสดง ${formatNumber(filteredJobs.length)} จาก ${formatNumber(stats.total)} งาน · ติ๊กเลือกงานเพื่อสร้างแผน`}
        />
        <JobsTable
          jobs={filteredJobs}
          onAction={handleAction}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          planTag={planTag}
        />
      </Card>

      {/* ---------- แถบสร้างแผน (โผล่เมื่อเลือกงาน) ---------- */}
      {selectedIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 lg:pl-64">
          <div className="flex w-full max-w-2xl items-center justify-between gap-3 rounded-cards border border-hairline bg-white px-4 py-3 shadow-overlay">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-logo-violet text-xs font-semibold text-white">
                {formatNumber(selectedIds.length)}
              </span>
              <span className="text-charcoal-ink">เลือกงานไว้แล้ว</span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="ml-1 inline-flex items-center gap-1 rounded-inputs px-2 py-1 text-xs text-slate-mid transition-colors hover:bg-bone"
              >
                <X className="h-3.5 w-3.5" />
                ล้าง
              </button>
            </div>
            <Button variant="orange" onClick={() => setPlanModalOpen(true)}>
              <Sparkles className="h-4 w-4" />
              สร้างแผน
            </Button>
          </div>
        </div>
      )}

      {/* ---------- Modal ต่าง ๆ ---------- */}
      {detailJob && (
        <JobDetailModal job={detailJob} onClose={() => setDetailJob(null)} />
      )}
      {assignVehicleJob && (
        <AssignVehicleModal
          job={assignVehicleJob}
          onClose={() => setAssignVehicleJob(null)}
        />
      )}
      {assignDriverJob && (
        <AssignDriverModal
          job={assignDriverJob}
          onClose={() => setAssignDriverJob(null)}
        />
      )}
      {changeStatusJob && (
        <ChangeStatusModal
          job={changeStatusJob}
          onClose={() => setChangeStatusJob(null)}
        />
      )}

      <CreatePlanModal
        key={planModalOpen ? "plan-open" : "plan-closed"}
        open={planModalOpen}
        jobs={selectedJobs}
        onClose={() => setPlanModalOpen(false)}
        onConfirm={handleCreatePlan}
      />
    </div>
  );
}
