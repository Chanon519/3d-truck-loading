"use client";

// ===== แผงล่าง: รายการกล่องที่จัดเข้าตู้แล้ว พร้อมตำแหน่ง/ขนาด/เหตุผล =====
import { useMemo } from "react";
import { PackageOpen, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePackingStore } from "@/lib/store/packing-store";
import { formatNumber } from "@/lib/labels";

export function DetailPanel({ onClose }: { onClose?: () => void }) {
  const result = usePackingStore((s) => s.result);
  const activeGroups = usePackingStore((s) => s.activeGroups);
  const selectedGroupId = usePackingStore((s) => s.selectedGroupId);
  const selectedItemId = usePackingStore((s) => s.selectedItemId);
  const selectedBoxId = usePackingStore((s) => s.selectedBoxId);
  const selectBox = usePackingStore((s) => s.selectBox);
  const focusSelected = usePackingStore((s) => s.focusSelected);

  // กรองตามกลุ่ม/สินค้าที่เลือกไว้ในแผงซ้าย เพื่อให้ทุกแผงเชื่อมกัน
  const rows = useMemo(() => {
    const boxes = result?.packed ?? [];
    return boxes.filter((b) => {
      if (selectedGroupId && b.groupId !== selectedGroupId) return false;
      if (selectedItemId && b.itemId !== selectedItemId) return false;
      return true;
    });
  }, [result, selectedGroupId, selectedItemId]);

  const filterHint =
    selectedGroupId || selectedItemId
      ? " (แสดงเฉพาะที่เลือก)"
      : "";

  const groupMap = useMemo(
    () => new Map(activeGroups.map((g) => [g.id, g])),
    [activeGroups]
  );

  const handleRow = (id: string) => {
    // เลือกกล่อง แล้วโฟกัสกล้องไปที่กล่องนั้น
    if (selectedBoxId !== id) selectBox(id);
    // ให้ selectBox ทำงานก่อน แล้วค่อยสั่งโฟกัส
    setTimeout(() => {
      if (usePackingStore.getState().selectedBoxId === id) focusSelected();
    }, 0);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            รายละเอียดการจัดวาง{filterHint}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            คลิกแถวเพื่อโฟกัสกล่องในมุมมอง 3D — ตำแหน่งอ้างอิงจากผนังในสุดของตู้
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <Badge tone="blue">{formatNumber(rows.length)} กล่อง</Badge>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดรายละเอียด"
              title="ปิด"
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!result || rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <PackageOpen className="h-9 w-9 text-slate-300" />
          <p className="mt-2 text-sm font-medium text-slate-700">
            {result ? "ไม่มีกล่องในเงื่อนไขที่เลือก" : "ยังไม่มีการจัดวาง"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {result
              ? "ลองล้างการเลือกกลุ่ม/สินค้าทางซ้าย"
              : "กด “คำนวณการจัดของ” เพื่อดูตำแหน่งของแต่ละกล่อง"}
          </p>
        </div>
      ) : (
        <div className="thin-scrollbar flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">กล่อง</th>
                <th className="px-4 py-2.5 font-medium">กลุ่ม / ปลายทาง</th>
                <th className="px-4 py-2.5 font-medium">ตำแหน่ง (x, y, z ซม.)</th>
                <th className="px-4 py-2.5 font-medium">ขนาดหลังจัด (ซม.)</th>
                <th className="px-4 py-2.5 font-medium">น้ำหนัก</th>
                <th className="px-4 py-2.5 font-medium">เหตุผลการวาง</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((box) => {
                const group = groupMap.get(box.groupId);
                const selected = selectedBoxId === box.id;
                return (
                  <tr
                    key={box.id}
                    onClick={() => handleRow(box.id)}
                    className={`cursor-pointer transition-colors ${
                      selected ? "bg-bone" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-slate-900">{box.name}</p>
                      <p className="font-mono text-xs text-slate-400">
                        {box.sku}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: box.color }}
                        />
                        <span className="text-slate-600">
                          {group?.destination ?? "-"}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-600">
                      {Math.round(box.position.x)}, {Math.round(box.position.y)},{" "}
                      {Math.round(box.position.z)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {box.size.length}×{box.size.width}×{box.size.height}
                      {box.rotated && (
                        <span className="ml-1.5">
                          <Badge tone="sky">หมุน 90°</Badge>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {formatNumber(box.weightKg)} กก.
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-500">
                      {box.reason}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
