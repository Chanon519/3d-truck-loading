// ===== ประเภทข้อมูลหลักของ Demo ระบบบริหารงานขนส่ง =====
// ไฟล์นี้เป็น "contract" กลาง — ทุกหน้า ทุก mock data ต้องอ้างอิง type จากที่นี่เท่านั้น

// ---------- รถ ----------
export type VehicleType = "tractor" | "ten_wheel" | "six_wheel" | "pickup_box";
export type VehicleStatus = "available" | "on_job" | "maintenance" | "inactive";

export interface Vehicle {
  id: string;
  plate: string; // ทะเบียนรถ
  type: VehicleType;
  depotId: string;
  status: VehicleStatus;
  jobsCompleted: number; // จำนวนงาน
  trips: number; // จำนวนเที่ยว
  onTimeRate: number; // ตรงเวลา % (0-100)
  utilization: number; // การใช้งานรถ % (0-100)
  totalDistanceKm: number; // ระยะทางรวม (กม.)
  totalRevenue: number; // รายได้รวม (บาท)
  score: number; // คะแนนรวม (0-100)
}

// ---------- คนขับ ----------
export type DriverStatus = "ready" | "on_job" | "off_duty" | "on_leave";

export interface Driver {
  id: string;
  code: string; // รหัสคนขับ เช่น DRV-001
  name: string; // ชื่อ-นามสกุล ภาษาไทย
  depotId: string;
  status: DriverStatus;
  jobsCompleted: number;
  trips: number;
  onTimeRate: number; // %
  safetyScore: number; // คะแนนความปลอดภัย (0-100)
  serviceScore: number; // คะแนนบริการ (0-100)
  incidents: number; // จำนวนเหตุผิดปกติ
  workHours: number; // ชั่วโมงทำงานรวม
  score: number; // คะแนนรวม (0-100)
}

// ---------- Depot ----------
export interface Depot {
  id: string;
  name: string;
  shortName: string; // ชื่อย่อสำหรับ badge/ตาราง
  province: string;
  utilization: number; // % การใช้พื้นที่
}

export type DepotZoneType =
  | "ready" // โซนรถพร้อมวิ่ง
  | "maintenance" // โซนรถรอซ่อม
  | "container_yard" // โซนลานตู้
  | "loading" // โซน Loading Area
  | "staging" // โซน Staging Area
  | "blocked"; // โซนปิดใช้งาน

export type SlotOccupancyType = "none" | "vehicle" | "container";
export type SlotStatus = "empty" | "occupied" | "reserved" | "blocked" | "problem";

export interface DepotSlot {
  id: string;
  depotId: string;
  depotName: string;
  zone: DepotZoneType;
  row: number;
  slot: number;
  slotCode: string; // เช่น A-01, Y-12
  slotType: "vehicle" | "container" | "mixed";
  occupancyType: SlotOccupancyType;
  vehicleId?: string; // ทะเบียนหรือ id รถที่จอด
  containerId?: string; // เลขตู้ที่วาง
  status: SlotStatus;
  note?: string;
}

// ---------- งาน ----------
export type JobType = "container" | "general" | "shuttle";
export type JobStatus =
  | "pending" // รอดำเนินการ
  | "assigned" // มอบหมายแล้ว
  | "in_progress" // กำลังดำเนินการ
  | "completed" // เสร็จสิ้น
  | "delayed" // ล่าช้า
  | "problem"; // มีปัญหา

export type JobPriority = "normal" | "urgent" | "critical";

export type ContainerSize = "20FT" | "40FT" | "40HQ";

export type ContainerJobType =
  | "import_laden" // รับตู้หนัก (ขาเข้า)
  | "export_laden" // ส่งตู้หนัก (ขาออก)
  | "empty_pickup" // รับตู้เปล่า
  | "empty_return"; // คืนตู้เปล่า

// ใช้ interface เดียวสำหรับทุกประเภทงาน — field เฉพาะประเภทเป็น optional
export interface Job {
  id: string;
  jobNo: string; // เลขงาน เช่น JOB-2607-001
  type: JobType;
  customer: string;
  origin: string; // ต้นทาง
  destination: string; // ปลายทาง
  appointmentTime: string; // ISO string เวลานัดหมาย
  vehicleId?: string;
  driverId?: string;
  status: JobStatus;
  priority: JobPriority;
  note?: string;
  detail?: string; // รายละเอียดงาน (งานทั่วไป)
  // --- เฉพาะงานตู้ / งานทอยตู้ ---
  containerNo?: string; // เลข Container เช่น TCLU1234567
  containerSize?: ContainerSize;
  containerJobType?: ContainerJobType;
  pickupLocation?: string; // จุดรับตู้
  deliveryLocation?: string; // จุดส่งตู้
  originDepotId?: string;
  destDepotId?: string;
  // --- เฉพาะงานทอยตู้ ---
  fromSlotCode?: string; // ตำแหน่งเริ่มต้นในลาน
  toSlotCode?: string; // ตำแหน่งปลายทางในลาน
  problem?: string; // ปัญหา/ข้อยกเว้น
}

// ---------- สินค้าและการจัดตู้ (3D Packing) ----------
export interface ContainerSpec {
  type: ContainerSize;
  label: string; // เช่น "ตู้ 40 ฟุต ไฮคิวบ์ (40HQ)"
  innerLength: number; // ซม. (แกน x)
  innerWidth: number; // ซม. (แกน y)
  innerHeight: number; // ซม. (แกน z)
  maxWeightKg: number; // น้ำหนักบรรทุกสูงสุด
}

export interface CargoGroup {
  id: string;
  name: string; // เช่น "กลุ่มที่ 1"
  destination: string; // ปลายทาง เช่น "กรุงเทพฯ"
  color: string; // hex สีประจำกลุ่ม
  unloadOrder: number; // ลำดับการลงของ: 1 = ลงก่อน (วางใกล้ประตู), มาก = ลงหลัง (วางในสุด)
}

export interface CargoItem {
  id: string;
  sku: string;
  name: string; // ชื่อสินค้า ภาษาไทย
  groupId: string;
  qty: number; // จำนวนกล่อง
  length: number; // ซม.
  width: number; // ซม.
  height: number; // ซม.
  weightKg: number; // น้ำหนักต่อกล่อง
  fragile: boolean; // แตกง่าย
  noStack: boolean; // ห้ามวางของทับด้านบน
  heavy: boolean; // สินค้าหนัก (ควรอยู่ชั้นล่าง)
  rotatable: boolean; // หมุนแนวนอนได้
}

// ออเดอร์สินค้าที่รอบรรจุ — เลือกได้หลายออเดอร์ให้รวมบรรจุตู้เดียวกัน (consolidation)
// 1 งานตู้ (Job) อาจประกอบด้วยหลายออเดอร์
export interface PackingOrder {
  id: string; // เช่น "ORD-2607-101"
  customer: string;
  destination: string;
  appointmentTime: string; // ISO
  unloadOrder: number; // ลำดับการลงของ: 1 = ลงก่อน (วางใกล้ประตู), มาก = ลงหลัง (วางในสุด)
  color: string; // hex สีประจำออเดอร์
  items: CargoItem[]; // groupId ของแต่ละ item = order.id นี้
  totalWeightKg: number; // น้ำหนักรวมของออเดอร์ (คำนวณล่วงหน้า)
  totalVolumeM3: number; // ปริมาตรรวมของออเดอร์ (คำนวณล่วงหน้า)
}

// กล่องที่ถูกจัดวางแล้วใน container
// พิกัด: x = ตามความยาวตู้ (0 = ด้านในสุด), y = ตามความกว้าง, z = ความสูงจากพื้นตู้ (หน่วย ซม.)
export interface PackedBox {
  id: string; // unique ต่อกล่อง เช่น `${itemId}-3`
  itemId: string;
  sku: string;
  name: string;
  groupId: string;
  position: { x: number; y: number; z: number };
  size: { length: number; width: number; height: number }; // ขนาดหลังหมุนแล้ว
  rotated: boolean;
  weightKg: number;
  color: string;
  reason: string; // เหตุผลการวางแบบภาษาคน
}

export type PlanStatus = "draft" | "calculated" | "has_warning";

export interface PackingResult {
  packed: PackedBox[];
  unpackedItems: { item: CargoItem; qtyLeft: number; reason: string }[];
  usedWeightKg: number;
  usedVolumeM3: number;
  totalVolumeM3: number;
  weightPercent: number;
  volumePercent: number;
  warnings: string[];
}

// ---------- จัด Container ใส่รถ ----------
export interface AwaitingContainer {
  id: string;
  containerNo: string;
  size: ContainerSize;
  weightKg: number; // น้ำหนักรวมสินค้า
  customer: string;
  destination: string;
  appointmentTime: string; // ISO
  ready: boolean; // พร้อมจัดรถหรือไม่
}

export interface TruckAssignment {
  truckId: string; // Vehicle.id
  containerIds: string[]; // AwaitingContainer.id ที่มอบหมาย
  score: number; // คะแนนความเหมาะสม 0-100
  reasons: string[]; // เหตุผลแบบภาษาคน
  warnings: string[]; // คำเตือน เช่น น้ำหนักใกล้เพดาน
}

// ---------- แผนงานที่ผู้ใช้สร้างเอง (เลือกงานจากหน้าจัดการงาน) ----------
// วงจรชีวิตแผน: draft (ยังมีหน่วยไม่พร้อม) → ready (ทุกหน่วยพร้อมออกรถ) → applied (นำไปใช้แล้ว)
export type PlanState = "draft" | "ready" | "applied";

// หน่วยจัดส่ง 1 หน่วย = 1 งานในแผน มี 2 มิติความพร้อม: จัดของ (packed) + จัดรถ (vehicleId)
// ทำมิติไหนก่อนก็ได้ — งานตู้ต้องจัดของ+มีตู้+หัวลาก, งานทอยตู้ต้องมีตู้+หัวลาก(ไม่ต้องจัดของ),
// งานทั่วไปใช้รถที่มีตู้ในตัว (ไม่ต้องใช้ตู้/ไม่ต้องจัดของ)
export interface PlanUnit {
  id: string; // เช่น "PU-1"
  jobId: string; // งานต้นทาง (1 หน่วย : 1 งาน)
  needsContainer: boolean; // มีตู้คอนเทนเนอร์ (งานตู้ + งานทอยตู้)
  needsPacking: boolean; // ต้องจัดของเข้าตู้แบบ 3D (เฉพาะงานตู้)
  containerType?: ContainerSize;
  packed: boolean; // มิติ "จัดของ" สำเร็จ (auto-true ถ้าไม่ต้องจัดของ)
  packingResult?: PackingResult; // ผลการจัดของล่าสุด
  packingOrderIds?: string[]; // ออเดอร์ที่ผูกไว้สำหรับหน้า 3D (demo)
  vehicleId?: string; // มิติ "จัดรถ"
  driverId?: string; // คนขับที่มอบหมาย
}

export interface TransportPlan {
  id: string; // เช่น "PLN-2607-01"
  name: string; // ชื่อแผน (แก้ไขได้)
  createdAt: string; // ISO
  jobIds: string[]; // งานต้นทางที่เลือกมาสร้างแผน
  units: PlanUnit[];
  state: PlanState;
}
