"use client";

// ===== หน้าเลือกออเดอร์ก่อนเข้า workspace 3D =====
// ผู้ใช้เลือกได้หลายออเดอร์ให้รวมบรรจุตู้เดียวกัน (consolidation) โดยเช็คน้ำหนัก/ปริมาตร
// เทียบพิกัดตู้ที่เลือกแบบสด — น้ำหนักเกินบล็อกจริง (กฎความปลอดภัย), ปริมาตรเกินแค่เตือน
import { useMemo } from "react";
import {
  Building2,
  Clock,
  MapPin,
  Package,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressBar } from "@/components/ui/progress";
import { SelectField } from "@/components/ui/select-field";
import { usePackingStore } from "@/lib/store/packing-store";
import { PACKING_ORDERS } from "@/lib/mock/packing-orders";
import { CONTAINER_SPECS, containerVolumeM3 } from "@/lib/container-specs";
import { formatNumber, formatThaiDateTime } from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";
import type { ContainerSize } from "@/lib/types";

const CONTAINER_OPTIONS = (Object.keys(CONTAINER_SPECS) as ContainerSize[]).map(
  (key) => ({ value: key, label: CONTAINER_SPECS[key].label })
);

export function OrderSelectionScreen() {
  const containerType = usePackingStore((s) => s.containerType);
  const setContainerType = usePackingStore((s) => s.setContainerType);
  const selectedOrderIds = usePackingStore((s) => s.selectedOrderIds);
  const toggleOrder = usePackingStore((s) => s.toggleOrder);
  const enterWorkspace = usePackingStore((s) => s.enterWorkspace);

  const spec = CONTAINER_SPECS[containerType];
  const totalVolume = containerVolumeM3(spec);

  const selectedOrders = useMemo(
    () => PACKING_ORDERS.filter((o) => selectedOrderIds.includes(o.id)),
    [selectedOrderIds]
  );

  const selectedWeight = selectedOrders.reduce((s, o) => s + o.totalWeightKg, 0);
  const selectedVolume = selectedOrders.reduce((s, o) => s + o.totalVolumeM3, 0);
  const totalBoxes = selectedOrders.reduce(
    (s, o) => s + o.items.reduce((si, it) => si + it.qty, 0),
    0
  );

  const weightPct = (selectedWeight / spec.maxWeightKg) * 100;
  const volumePct = (selectedVolume / totalVolume) * 100;
  const overWeight = selectedWeight > spec.maxWeightKg;

  const weightTone: BadgeTone = overWeight
    ? "red"
    : weightPct > 80
      ? "amber"
      : "emerald";
  const volumeTone: BadgeTone = volumePct > 100 ? "amber" : "sky";

  const canEnter = selectedOrders.length > 0 && !overWeight;

  return (
    <div>
      <PageHeader
        title="จัดของเข้า Container แบบ 3D"
        subtitle="เลือกออเดอร์ที่จะรวมบรรจุในตู้นี้ ก่อนเข้าสู่การจัดวางแบบ 3D — 1 ตู้สามารถรวมได้หลายออเดอร์"
      />

      {/* สรุปความจุ */}
      <Card className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SelectField
            label="ประเภทตู้"
            value={containerType}
            onChange={(v) => setContainerType(v as ContainerSize)}
            options={CONTAINER_OPTIONS}
            className="w-56"
          />
          <div className="text-right">
            <p className="text-xs text-slate-500">เลือกแล้ว</p>
            <p className="text-lg font-semibold text-slate-900">
              {formatNumber(selectedOrders.length)} ออเดอร์ ·{" "}
              {formatNumber(totalBoxes)} กล่อง
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">น้ำหนักที่เลือก</span>
              <span
                className={`font-medium ${overWeight ? "text-red-600" : "text-slate-800"}`}
              >
                {formatNumber(Math.round(selectedWeight))} /{" "}
                {formatNumber(spec.maxWeightKg)} กก.
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, weightPct)}
              tone={weightTone}
              className="mt-1.5"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">ปริมาตรที่เลือก</span>
              <span className="font-medium text-slate-800">
                {selectedVolume.toFixed(1)} / {totalVolume.toFixed(1)} ลบ.ม.
              </span>
            </div>
            <ProgressBar
              value={Math.min(100, volumePct)}
              tone={volumeTone}
              className="mt-1.5"
            />
          </div>
        </div>

        {overWeight && (
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-600">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            น้ำหนักรวมเกินพิกัดตู้ที่เลือก — ถอดออเดอร์บางรายการออกก่อนเริ่มจัดของ
          </p>
        )}
      </Card>

      {/* รายการออเดอร์ */}
      <div className="mt-5">
        <CardHeader
          title="ออเดอร์ที่รอบรรจุ"
          subtitle="คลิกเพื่อเลือก/ยกเลิก — เลือกได้หลายออเดอร์พร้อมกัน"
        />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        {PACKING_ORDERS.map((order) => {
          const selected = selectedOrderIds.includes(order.id);
          const wouldOverflow =
            !selected && selectedWeight + order.totalWeightKg > spec.maxWeightKg;
          const boxCount = order.items.reduce((s, it) => s + it.qty, 0);

          return (
            <button
              key={order.id}
              type="button"
              aria-pressed={selected}
              disabled={wouldOverflow}
              onClick={() => toggleOrder(order.id)}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                selected
                  ? overWeight
                    ? "border-red-300 bg-red-50/60 ring-1 ring-red-200"
                    : "border-deep-charcoal bg-bone ring-1 ring-charcoal-ink/20"
                  : wouldOverflow
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 opacity-60"
                    : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-4 w-4 shrink-0 rounded"
                    style={{ backgroundColor: order.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-400">
                      {order.id}
                    </p>
                    <p className="truncate font-semibold text-slate-900">
                      {order.customer}
                    </p>
                  </div>
                </div>
                {selected && (
                  <Badge tone={overWeight ? "red" : "blue"}>
                    {overWeight ? "เกินพิกัด" : "เลือกแล้ว"}
                  </Badge>
                )}
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>ปลายทาง {order.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>{formatThaiDateTime(order.appointmentTime)} น.</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Package className="h-4 w-4 shrink-0 text-slate-400" />
                  <span>
                    {formatNumber(boxCount)} กล่อง ·{" "}
                    {formatNumber(order.totalWeightKg)} กก. ·{" "}
                    {order.totalVolumeM3.toFixed(1)} ลบ.ม.
                  </span>
                </div>
              </div>

              {wouldOverflow && (
                <p className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-red-600">
                  <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                  น้ำหนักเกินพิกัดตู้ที่เลือกไว้
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Building2 className="h-4 w-4 shrink-0" />
          <span>
            เลือกแล้ว {formatNumber(selectedOrders.length)} จาก{" "}
            {formatNumber(PACKING_ORDERS.length)} ออเดอร์
          </span>
        </div>
        <Button onClick={enterWorkspace} disabled={!canEnter} className="px-6 py-3">
          <Sparkles className="h-4 w-4" />
          เริ่มจัดของ ({formatNumber(selectedOrders.length)} ออเดอร์)
        </Button>
      </div>
    </div>
  );
}
