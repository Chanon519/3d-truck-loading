"use client";

// ===== Modal อธิบายหลักการ Best Fit แบบภาษาคน (สำหรับนำเสนอลูกค้า) =====
import {
  ArrowDownWideNarrow,
  Layers,
  MoveDiagonal,
  ShieldCheck,
  Weight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

const STEPS: { icon: LucideIcon; title: string; detail: string }[] = [
  {
    icon: ArrowDownWideNarrow,
    title: "เรียงตามลำดับการส่ง",
    detail:
      "กลุ่มปลายทางที่ต้องลงของทีหลัง จะถูกวางไว้ด้านในสุดของตู้ ส่วนปลายทางที่ลงก่อนวางไว้ใกล้ประตู เพื่อให้เปิดตู้แล้วหยิบของออกได้ตามคิว",
  },
  {
    icon: Weight,
    title: "ของหนักลงชั้นล่างก่อน",
    detail:
      "ภายในแต่ละกลุ่ม ระบบวางสินค้าหนักและชิ้นใหญ่ก่อน ให้เป็นฐานที่มั่นคง แล้วจึงวางของเบากว่าซ้อนขึ้นไปด้านบน",
  },
  {
    icon: Layers,
    title: "เลือกตำแหน่งที่ต่ำและชิดในสุด",
    detail:
      "แต่ละกล่องจะถูกวางที่จุดว่างซึ่งต่ำที่สุดก่อน (เต็มพื้นก่อนขึ้นชั้น) แล้วเลือกจุดที่ชิดผนังในสุดและชิดข้าง เพื่อไม่ให้เกิดช่องว่างเสียเปล่า",
  },
  {
    icon: MoveDiagonal,
    title: "ลองหมุนกล่องให้พอดี",
    detail:
      "ถ้าสินค้าหมุนได้ ระบบจะลองหมุน 90° เพื่อหาทิศที่ใส่ลงช่องว่างที่เหลือได้พอดีที่สุด",
  },
  {
    icon: ShieldCheck,
    title: "ตรวจเงื่อนไขความปลอดภัย",
    detail:
      "ทุกครั้งที่วาง ระบบตรวจว่าไม่เกินพิกัดน้ำหนักตู้ มีพื้นผิวรองรับฐานอย่างน้อย 70% ไม่วางทับสินค้า “ห้ามซ้อน” และไม่วางของหนักทับสินค้า “แตกง่าย”",
  },
];

export function AlgorithmModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="ระบบจัดของเข้าตู้อย่างไร (Best Fit)"
      wide
      footer={
        <Button onClick={onClose}>เข้าใจแล้ว</Button>
      }
    >
      <p className="text-sm text-slate-600">
        ระบบใช้หลักการ <span className="font-medium">Best Fit</span> เพื่อวางสินค้าให้ใช้พื้นที่ในตู้คุ้มที่สุด
        โดยคำนึงถึงขนาด น้ำหนัก ลำดับการส่ง และข้อจำกัดของสินค้าไปพร้อมกัน
        นี่คือขั้นตอนการคิดของระบบ:
      </p>

      <ol className="mt-4 space-y-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-charcoal-ink text-white">
              <step.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">
                {i + 1}. {step.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        หมายเหตุ: เป็นอัลกอริทึมสาธิตเพื่อให้เห็นแนวคิด ระบบจริงสามารถปรับให้รองรับ
        เงื่อนไขเฉพาะของแต่ละธุรกิจได้ละเอียดยิ่งขึ้น
      </p>
    </Modal>
  );
}
