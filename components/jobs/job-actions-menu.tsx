"use client";

// เมนู "จัดการ" รายแถวของตารางงาน — dropdown ทำเองด้วย state
// ใช้ position: fixed คำนวณพิกัดจากปุ่ม เพื่อไม่ให้เมนูถูก clip โดย overflow ของตาราง

import { useRef, useState } from "react";
import {
  Eye,
  MoreHorizontal,
  RefreshCw,
  Send,
  Truck,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type JobAction =
  | "detail"
  | "assign_vehicle"
  | "assign_driver"
  | "change_status"
  | "create_plan";

const MENU_ITEMS: { action: JobAction; label: string; icon: LucideIcon }[] = [
  { action: "detail", label: "ดูรายละเอียด", icon: Eye },
  { action: "assign_vehicle", label: "มอบหมายรถ", icon: Truck },
  { action: "assign_driver", label: "มอบหมายคนขับ", icon: UserRound },
  { action: "change_status", label: "เปลี่ยนสถานะ", icon: RefreshCw },
  { action: "create_plan", label: "สร้างแผนจากงานนี้", icon: Send },
];

const MENU_WIDTH = 200; // px
const ITEM_HEIGHT = 36; // px ต่อรายการ (py-2 + text-sm)
const MENU_PADDING = 8; // py-1 บน-ล่าง

export function JobActionsMenu({
  onAction,
}: {
  onAction: (action: JobAction) => void;
}) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const open = pos !== null;

  const openMenu = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuHeight = MENU_ITEMS.length * ITEM_HEIGHT + MENU_PADDING;
    // ถ้าพื้นที่ด้านล่างไม่พอ ให้เปิดขึ้นด้านบนแทน
    const openUp = rect.bottom + menuHeight + 8 > window.innerHeight;
    setPos({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: Math.max(
        8,
        Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)
      ),
    });
  };

  const select = (action: JobAction) => {
    setPos(null);
    onAction(action);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? setPos(null) : openMenu())}
        aria-label="เมนูจัดการงาน"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`rounded-lg p-1.5 transition-colors ${
          open
            ? "bg-slate-100 text-slate-700"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {pos && (
        <>
          {/* ฉากหลังโปร่งใส — คลิกที่ไหนก็ได้เพื่อปิดเมนู */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setPos(null)}
            aria-hidden="true"
          />
          <div
            role="menu"
            className="fixed z-50 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            style={{ top: pos.top, left: pos.left, width: MENU_WIDTH }}
          >
            {MENU_ITEMS.map((item) => (
              <button
                key={item.action}
                type="button"
                role="menuitem"
                onClick={() => select(item.action)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <item.icon className="h-4 w-4 shrink-0 text-slate-400" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
