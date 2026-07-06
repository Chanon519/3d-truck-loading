"use client";

// ===== หน้า "งานทอยตู้" (Container Shuttle) — เคลื่อนย้ายตู้ระหว่าง Depot และภายในลาน =====
import { useMemo, useState } from "react";
import type { Job, JobPriority } from "@/lib/types";
import { JOB_STATUS_LABEL } from "@/lib/labels";
import { useJobsStore } from "@/lib/store/jobs-store";
import { vehiclePlate } from "@/lib/mock/vehicles";
import { driverName } from "@/lib/mock/drivers";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast";
import { ShuttleStats } from "@/components/shuttle-jobs/shuttle-stats";
import { ShuttleFilters } from "@/components/shuttle-jobs/shuttle-filters";
import {
  ShuttleTable,
  type ShuttleActionType,
} from "@/components/shuttle-jobs/shuttle-table";
import {
  AssignDriverModal,
  AssignVehicleModal,
  ReportProblemModal,
} from "@/components/shuttle-jobs/shuttle-modals";

type ModalState =
  | { type: "vehicle"; jobId: string }
  | { type: "driver"; jobId: string }
  | { type: "problem"; jobId: string }
  | null;

export default function ShuttleJobsPage() {
  const jobs = useJobsStore((s) => s.jobs);
  const assignVehicle = useJobsStore((s) => s.assignVehicle);
  const assignDriver = useJobsStore((s) => s.assignDriver);
  const setStatus = useJobsStore((s) => s.setStatus);
  const updateJob = useJobsStore((s) => s.updateJob);
  const { toast } = useToast();

  // ตัวกรอง
  const [depotFilter, setDepotFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<ModalState>(null);

  // เฉพาะงานทอยตู้เท่านั้น
  const shuttleJobs = useMemo(
    () => jobs.filter((j) => j.type === "shuttle"),
    [jobs]
  );

  // กรองตาม depot ต้นทาง / สถานะ / คำค้นหา (ยังไม่รวมความเร่งด่วน
  // เพื่อให้ตัวเลข count บน chip สะท้อนเงื่อนไขอื่นที่เลือกไว้)
  const baseFiltered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shuttleJobs
      .filter((job) => {
        if (depotFilter !== "all" && job.originDepotId !== depotFilter) {
          return false;
        }
        if (statusFilter !== "all" && job.status !== statusFilter) {
          return false;
        }
        if (q) {
          const haystack = [
            job.jobNo,
            job.containerNo ?? "",
            job.customer,
            vehiclePlate(job.vehicleId),
            driverName(job.driverId),
            job.fromSlotCode ?? "",
            job.toSlotCode ?? "",
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [shuttleJobs, depotFilter, statusFilter, search]);

  const priorityCounts = useMemo(() => {
    const counts: Record<"all" | JobPriority, number> = {
      all: baseFiltered.length,
      normal: 0,
      urgent: 0,
      critical: 0,
    };
    for (const job of baseFiltered) counts[job.priority] += 1;
    return counts;
  }, [baseFiltered]);

  const filteredJobs = useMemo(
    () =>
      priorityFilter === "all"
        ? baseFiltered
        : baseFiltered.filter((j) => j.priority === priorityFilter),
    [baseFiltered, priorityFilter]
  );

  // งานของ modal ที่เปิดอยู่ — อ่านสดจาก store เสมอ
  const modalJob: Job | null = modal
    ? (shuttleJobs.find((j) => j.id === modal.jobId) ?? null)
    : null;

  const handleAction = (action: ShuttleActionType, job: Job) => {
    switch (action) {
      case "assign_vehicle":
        setModal({ type: "vehicle", jobId: job.id });
        break;
      case "assign_driver":
        setModal({ type: "driver", jobId: job.id });
        break;
      case "confirm":
        if (!job.vehicleId || !job.driverId) {
          toast("ต้องมอบหมายรถและคนขับก่อน", "error");
          return;
        }
        setStatus(job.id, "assigned");
        toast(
          `ยืนยันรับงาน ${job.jobNo} แล้ว — สถานะ: ${JOB_STATUS_LABEL.assigned}`,
          "success"
        );
        break;
      case "start":
        setStatus(job.id, "in_progress");
        toast(
          `เริ่มงาน ${job.jobNo} แล้ว — สถานะ: ${JOB_STATUS_LABEL.in_progress}`,
          "success"
        );
        break;
      case "complete":
        setStatus(job.id, "completed");
        toast(`งาน ${job.jobNo} ${JOB_STATUS_LABEL.completed}แล้ว`, "success");
        break;
      case "report":
        setModal({ type: "problem", jobId: job.id });
        break;
    }
  };

  return (
    <div>
      <PageHeader
        title="งานทอยตู้"
        subtitle="งานเคลื่อนย้ายตู้ระหว่าง Depot และภายในลาน"
      />

      <ShuttleStats jobs={shuttleJobs} />

      <ShuttleFilters
        depot={depotFilter}
        onDepotChange={setDepotFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        priority={priorityFilter}
        onPriorityChange={setPriorityFilter}
        priorityCounts={priorityCounts}
        search={search}
        onSearchChange={setSearch}
      />

      <ShuttleTable jobs={filteredJobs} onAction={handleAction} />

      {modal?.type === "vehicle" && modalJob && (
        <AssignVehicleModal
          job={modalJob}
          onClose={() => setModal(null)}
          onConfirm={(vehicleId) => {
            assignVehicle(modalJob.id, vehicleId);
            toast(
              `มอบหมายรถ ${vehiclePlate(vehicleId)} ให้งาน ${modalJob.jobNo} แล้ว`,
              "success"
            );
            setModal(null);
          }}
        />
      )}

      {modal?.type === "driver" && modalJob && (
        <AssignDriverModal
          job={modalJob}
          onClose={() => setModal(null)}
          onConfirm={(driverId) => {
            assignDriver(modalJob.id, driverId);
            toast(
              `มอบหมายคนขับ ${driverName(driverId)} ให้งาน ${modalJob.jobNo} แล้ว`,
              "success"
            );
            setModal(null);
          }}
        />
      )}

      {modal?.type === "problem" && modalJob && (
        <ReportProblemModal
          job={modalJob}
          onClose={() => setModal(null)}
          onConfirm={(problem) => {
            updateJob(modalJob.id, { status: "problem", problem });
            toast(`รายงานปัญหางาน ${modalJob.jobNo} แล้ว`, "info");
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
