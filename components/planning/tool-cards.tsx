"use client";

// การ์ดเครื่องมือหลัก 2 ใบของหน้า "วางแผนและ Optimize"
// 1) จัดของเข้า Container แบบ 3D  2) จัด Container ใส่รถ
import Link from "next/link";
import { ArrowRight, Box, CircleCheck, Forklift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AWAITING_CONTAINERS } from "@/lib/mock/awaiting-containers";
import { CARGO_GROUPS, CARGO_ITEMS } from "@/lib/mock/cargo";
import { VEHICLES } from "@/lib/mock/vehicles";
import { formatNumber, formatThaiTime } from "@/lib/labels";

// ---------- ชิ้นส่วนย่อย ----------

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function FeatureLine({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-slate-600">
      <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>{text}</span>
    </li>
  );
}

// ภาพประกอบ: หน้าตัดตู้ container พร้อมกล่องสีตามกลุ่มปลายทาง (ประตูอยู่ขวา)
function ContainerIllustration() {
  const [g1, g2, g3] = CARGO_GROUPS.map((g) => g.color);
  // เรียงจากในสุด (ซ้าย = ลงทีหลัง) ไปหาประตู (ขวา = ลงก่อน)
  const columns: { color: string; heights: number[] }[] = [
    { color: g3, heights: [32, 30] },
    { color: g3, heights: [56] },
    { color: g2, heights: [40, 26] },
    { color: g2, heights: [62] },
    { color: g1, heights: [30, 32] },
    { color: g1, heights: [48] },
  ];
  return (
    <div
      className="relative hidden h-24 w-44 shrink-0 rounded-lg border-2 border-slate-300 bg-white p-1.5 sm:block"
      aria-hidden="true"
    >
      <div className="flex h-full items-end gap-1">
        {columns.map((col, i) => (
          <div key={i} className="flex h-full flex-1 flex-col justify-end gap-1">
            {col.heights.map((h, j) => (
              <div
                key={j}
                className="w-full rounded-[3px]"
                style={{
                  height: `${h}%`,
                  backgroundColor: col.color,
                  opacity: j === 0 ? 0.85 : 0.6,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* ประตูตู้ด้านขวา */}
      <div className="absolute -right-1.5 top-1/2 h-4/5 w-1.5 -translate-y-1/2 rounded-full bg-slate-300" />
    </div>
  );
}

// ภาพประกอบ: หัวลาก + หางพ่วงบรรทุกตู้ (วาดด้วย CSS ล้วน)
function TruckIllustration() {
  return (
    <div className="hidden shrink-0 select-none sm:block" aria-hidden="true">
      <div className="flex items-end gap-1.5">
        {/* ตู้บนหางพ่วง */}
        <div className="flex h-12 w-32 items-center justify-center rounded-[4px] border-2 border-violet-300 bg-violet-50">
          <span className="text-[10px] font-bold tracking-[0.25em] text-violet-400">
            40HQ
          </span>
        </div>
        {/* หัวลาก */}
        <div className="relative h-14 w-10">
          <div className="absolute inset-x-0 bottom-0 h-8 rounded-r-lg bg-blue-600" />
          <div className="absolute bottom-7 left-0 h-7 w-8 rounded-t-lg bg-blue-600 pt-1.5">
            <div className="mx-1.5 h-3 rounded-[3px] bg-sky-200" />
          </div>
        </div>
      </div>
      {/* แชสซี + ล้อ */}
      <div className="mt-1 h-1.5 rounded-full bg-slate-300" />
      <div className="-mt-1.5 flex justify-between px-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 w-4 rounded-full border-[3px] border-slate-500 bg-slate-100"
          />
        ))}
      </div>
    </div>
  );
}

// ---------- การ์ดหลัก ----------

export function PackingToolCard() {
  const totalBoxes = CARGO_ITEMS.reduce((sum, item) => sum + item.qty, 0);

  return (
    <Card className="relative flex h-full flex-col overflow-hidden p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-blue-100/70 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
          <Box className="h-7 w-7" />
        </div>
        <ContainerIllustration />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        จัดของเข้า Container แบบ 3D
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        ระบบคำนวณการวางสินค้าในตู้ให้ใช้พื้นที่คุ้มที่สุด
        โดยคำนึงถึงน้ำหนัก ลำดับการส่ง และข้อจำกัดสินค้า
      </p>

      <ul className="mt-4 space-y-1.5">
        <FeatureLine text="ของหนักอยู่ชั้นล่าง ของแตกง่ายไม่ถูกวางทับ" />
        <FeatureLine text="ปลายทางที่ลงก่อน ถูกวางไว้ใกล้ประตูตู้เสมอ" />
        <FeatureLine text="เห็นภาพการจัดวางแบบ 3D พร้อมเหตุผลของทุกกล่อง" />
      </ul>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatChip value={formatNumber(CARGO_ITEMS.length)} label="SKU" />
        <StatChip value={formatNumber(totalBoxes)} label="กล่องรวม" />
        <StatChip
          value={formatNumber(CARGO_GROUPS.length)}
          label="กลุ่มปลายทาง"
        />
      </div>

      <div className="mt-auto pt-5">
        <Link
          href="/transport/demo/loading-3d"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Box className="h-4 w-4" />
          เปิดหน้าจัดของเข้าตู้ 3D
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}

export function TruckAssignToolCard() {
  const readyContainers = AWAITING_CONTAINERS.filter((c) => c.ready);
  const availableTractors = VEHICLES.filter(
    (v) => v.type === "tractor" && v.status === "available"
  );
  const firstAppointment = readyContainers
    .map((c) => c.appointmentTime)
    .sort()[0];

  return (
    <Card className="relative flex h-full flex-col overflow-hidden p-6">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-violet-100/70 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
          <Forklift className="h-7 w-7" />
        </div>
        <TruckIllustration />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        จัด Container ใส่รถ
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        จับคู่ตู้กับหัวลากอัตโนมัติ ตามเวลานัด น้ำหนัก และความพร้อมของรถ
      </p>

      <ul className="mt-4 space-y-1.5">
        <FeatureLine text="จับคู่ตามเวลานัดหมายและระยะทางไปจุดรับตู้" />
        <FeatureLine text="ตรวจน้ำหนักตู้ไม่ให้เกินพิกัดของหัวลาก" />
        <FeatureLine text="ให้คะแนนความเหมาะสมพร้อมเหตุผลทุกคู่" />
      </ul>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatChip
          value={`${formatNumber(readyContainers.length)} ใบ`}
          label="ตู้รอจัดรถ"
        />
        <StatChip
          value={`${formatNumber(availableTractors.length)} คัน`}
          label="หัวลากพร้อม"
        />
        <StatChip
          value={firstAppointment ? formatThaiTime(firstAppointment) : "-"}
          label="นัดแรกวันนี้"
        />
      </div>

      <div className="mt-auto pt-5">
        <Link
          href="/transport/demo/truck-assignment"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Forklift className="h-4 w-4" />
          เปิดหน้าจัด Container ใส่รถ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}
