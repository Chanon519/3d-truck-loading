"use client";

// เมนู dropdown จัดการรายงานตู้ต่อแถว — วาง fixed ตามตำแหน่งปุ่ม เพื่อไม่ให้โดน overflow ของตารางตัด
import { useState } from "react";
import {
  AlertTriangle,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type JobAction =
  | "detail"
  | "assign_vehicle"
  | "assign_driver"
  | "change_status"
  | "move_to_planning"
  | "report_problem";

const MENU_ITEMS: {
  action: JobAction;
  label: string;
  icon: LucideIcon;
  danger?: boolean;
}[] = [
  { action: "detail", label: "ดูรายละเอียด", icon: Eye },
  { action: "assign_vehicle", label: "มอบหมายรถ", icon: Truck },
  { action: "assign_driver", label: "มอบหมายคนขับ", icon: UserRound },
  { action: "change_status", label: "เปลี่ยนสถานะ", icon: RefreshCw },
  { action: "move_to_planning", label: "ย้ายไปวางแผน", icon: Sparkles },
  { action: "report_problem", label: "รายงานปัญหา", icon: AlertTriangle, danger: true },
];

const MENU_WIDTH = 208; // ตรงกับ w-52
const MENU_HEIGHT_ESTIMATE = MENU_ITEMS.length * 36 + 10;

export function JobActionMenu({
  onAction,
}: {
  onAction: (action: JobAction) => void;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  function openMenu(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    // ถ้าพื้นที่ด้านล่างไม่พอ ให้เด้งเมนูขึ้นด้านบน
    const top =
      rect.bottom + MENU_HEIGHT_ESTIMATE > window.innerHeight
        ? Math.max(8, rect.top - MENU_HEIGHT_ESTIMATE - 4)
        : rect.bottom + 4;
    const left = Math.max(8, rect.right - MENU_WIDTH);
    setPos({ top, left });
  }

  function select(action: JobAction) {
    setPos(null);
    onAction(action);
  }

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        aria-label="เมนูจัดการงาน"
        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {pos && (
        <>
          {/* ฉากหลังโปร่งใส — คลิกเพื่อปิดเมนู */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPos(null)}
            aria-hidden="true"
          />
          <div
            className="fixed z-50 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: pos.top, left: pos.left }}
            role="menu"
          >
            {MENU_ITEMS.map((item) => (
              <button
                key={item.action}
                type="button"
                role="menuitem"
                onClick={() => select(item.action)}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
