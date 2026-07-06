// ===== Zustand store: งานขนส่ง =====
import { create } from "zustand";
import type { Job, JobStatus } from "@/lib/types";
import { JOBS } from "@/lib/mock/jobs";

export interface JobsStore {
  jobs: Job[];
  // มอบหมายรถให้กับงาน — ถ้างานยัง pending และมีทั้งรถ+คนขับครบแล้ว จะเปลี่ยนสถานะเป็น assigned
  assignVehicle: (jobId: string, vehicleId: string) => void;
  // มอบหมายคนขับให้กับงาน — เงื่อนไขเดียวกับ assignVehicle
  assignDriver: (jobId: string, driverId: string) => void;
  // เปลี่ยนสถานะงาน
  setStatus: (jobId: string, status: JobStatus) => void;
  // แก้ไขข้อมูลงานบางส่วน
  updateJob: (jobId: string, patch: Partial<Job>) => void;
}

// ถ้างานยัง pending และมีทั้งรถ+คนขับครบแล้ว → เลื่อนสถานะเป็น assigned
function withAutoAssign(job: Job): Job {
  if (job.status === "pending" && job.vehicleId && job.driverId) {
    return { ...job, status: "assigned" };
  }
  return job;
}

export const useJobsStore = create<JobsStore>()((set) => ({
  jobs: JOBS,

  assignVehicle: (jobId, vehicleId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? withAutoAssign({ ...job, vehicleId }) : job
      ),
    })),

  assignDriver: (jobId, driverId) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? withAutoAssign({ ...job, driverId }) : job
      ),
    })),

  setStatus: (jobId, status) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, status } : job
      ),
    })),

  updateJob: (jobId, patch) =>
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...patch } : job
      ),
    })),
}));
