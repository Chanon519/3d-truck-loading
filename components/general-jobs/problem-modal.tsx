"use client";

// Modal รายงานปัญหาของงาน — กรอกรายละเอียดแล้วเปลี่ยนสถานะงานเป็น "มีปัญหา"
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ProblemModal({
  open,
  jobNo,
  onClose,
  onConfirm,
}: {
  open: boolean;
  jobNo: string;
  onClose: () => void;
  onConfirm: (problemText: string) => void;
}) {
  const [text, setText] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`รายงานปัญหา — ${jobNo}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            variant="danger"
            disabled={!text.trim()}
            onClick={() => onConfirm(text.trim())}
          >
            <TriangleAlert className="h-4 w-4" />
            แจ้งปัญหา
          </Button>
        </>
      }
    >
      <div className="mb-3 flex items-start gap-2.5 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          เมื่อแจ้งปัญหา สถานะงานจะเปลี่ยนเป็น &quot;มีปัญหา&quot;
          และทีมปฏิบัติการจะได้รับการแจ้งเตือน
        </span>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-slate-500">
          รายละเอียดปัญหา
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="เช่น รถเสียกลางทาง / ลูกค้าเลื่อนนัด / สินค้าเสียหาย..."
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </label>
    </Modal>
  );
}
