// ===== ป้ายข้อความภาษาไทย + โทนสี badge (single source of truth) =====
// โทนสีที่ใช้กับ <Badge tone="..."> : blue | sky | emerald | amber | red | slate | violet

import type {
  VehicleType,
  VehicleStatus,
  DriverStatus,
  JobType,
  JobStatus,
  JobPriority,
  ContainerJobType,
  DepotZoneType,
  SlotStatus,
  PlanStatus,
  PlanState,
} from "./types";

export type BadgeTone =
  | "blue"
  | "sky"
  | "emerald"
  | "amber"
  | "red"
  | "slate"
  | "violet"
  | "orange";

// ---------- รถ ----------
export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  tractor: "หัวลาก",
  ten_wheel: "รถ 10 ล้อ",
  six_wheel: "รถ 6 ล้อ",
  pickup_box: "รถกระบะตู้ทึบ",
};

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  available: "พร้อมใช้งาน",
  on_job: "กำลังวิ่งงาน",
  maintenance: "ซ่อมบำรุง",
  inactive: "ไม่พร้อมใช้งาน",
};

export const VEHICLE_STATUS_TONE: Record<VehicleStatus, BadgeTone> = {
  available: "emerald",
  on_job: "sky",
  maintenance: "amber",
  inactive: "slate",
};

// ---------- คนขับ ----------
export const DRIVER_STATUS_LABEL: Record<DriverStatus, string> = {
  ready: "พร้อมรับงาน",
  on_job: "กำลังทำงาน",
  off_duty: "นอกเวลางาน",
  on_leave: "ลาหยุด",
};

export const DRIVER_STATUS_TONE: Record<DriverStatus, BadgeTone> = {
  ready: "emerald",
  on_job: "sky",
  off_duty: "slate",
  on_leave: "amber",
};

// ---------- งาน ----------
export const JOB_TYPE_LABEL: Record<JobType, string> = {
  container: "งานตู้",
  general: "งานทั่วไป",
  shuttle: "งานทอยตู้",
};

export const JOB_TYPE_TONE: Record<JobType, BadgeTone> = {
  container: "blue",
  general: "violet",
  shuttle: "sky",
};

export const JOB_STATUS_LABEL: Record<JobStatus, string> = {
  pending: "รอดำเนินการ",
  assigned: "มอบหมายแล้ว",
  in_progress: "กำลังดำเนินการ",
  completed: "เสร็จสิ้น",
  delayed: "ล่าช้า",
  problem: "มีปัญหา",
};

export const JOB_STATUS_TONE: Record<JobStatus, BadgeTone> = {
  pending: "slate",
  assigned: "violet",
  in_progress: "sky",
  completed: "emerald",
  delayed: "amber",
  problem: "red",
};

export const JOB_PRIORITY_LABEL: Record<JobPriority, string> = {
  normal: "ปกติ",
  urgent: "เร่งด่วน",
  critical: "ด่วนมาก",
};

export const JOB_PRIORITY_TONE: Record<JobPriority, BadgeTone> = {
  normal: "slate",
  urgent: "orange", // งานเร่งด่วน = accent ปฏิบัติการสีส้ม
  critical: "red",
};

export const CONTAINER_JOB_TYPE_LABEL: Record<ContainerJobType, string> = {
  import_laden: "รับตู้หนัก (ขาเข้า)",
  export_laden: "ส่งตู้หนัก (ขาออก)",
  empty_pickup: "รับตู้เปล่า",
  empty_return: "คืนตู้เปล่า",
};

// ---------- Depot ----------
export const DEPOT_ZONE_LABEL: Record<DepotZoneType, string> = {
  ready: "โซนรถพร้อมวิ่ง",
  maintenance: "โซนรถรอซ่อม",
  container_yard: "โซนลานตู้",
  loading: "โซน Loading",
  staging: "โซน Staging",
  blocked: "โซนปิดใช้งาน",
};

export const SLOT_STATUS_LABEL: Record<SlotStatus, string> = {
  empty: "ว่าง",
  occupied: "ใช้งานอยู่",
  reserved: "ถูกจอง",
  blocked: "ปิดใช้งาน",
  problem: "มีปัญหา",
};

export const SLOT_STATUS_TONE: Record<SlotStatus, BadgeTone> = {
  empty: "slate",
  occupied: "sky",
  reserved: "violet",
  blocked: "slate",
  problem: "red",
};

// ---------- แผนการจัด ----------
export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  draft: "ร่างแผน",
  calculated: "คำนวณแล้ว",
  has_warning: "มีคำเตือน",
};

export const PLAN_STATUS_TONE: Record<PlanStatus, BadgeTone> = {
  draft: "slate",
  calculated: "emerald",
  has_warning: "amber",
};

// ---------- แผนงาน (ผู้ใช้สร้างเอง) ----------
export const PLAN_STATE_LABEL: Record<PlanState, string> = {
  draft: "ร่างแผน",
  ready: "พร้อมออกรถ",
  applied: "นำไปใช้แล้ว",
};

export const PLAN_STATE_TONE: Record<PlanState, BadgeTone> = {
  draft: "slate",
  ready: "emerald",
  applied: "violet",
};

// ---------- ตัวช่วย format ----------
export function formatNumber(n: number): string {
  return n.toLocaleString("th-TH");
}

export function formatBaht(n: number): string {
  return `฿${n.toLocaleString("th-TH")}`;
}

// แสดงวันเวลาแบบไทยสั้น ๆ เช่น "3 ก.ค. 14:30"
export function formatThaiDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

export function formatThaiTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
