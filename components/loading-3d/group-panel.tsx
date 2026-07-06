"use client";

// ===== แผงซ้าย: กลุ่มสินค้า (ตามปลายทาง) + รายการสินค้า + ฟิลเตอร์ + ค้นหา =====
import { useMemo } from "react";
import { PackageSearch, PanelLeftClose } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchInput } from "@/components/ui/search-input";
import { usePackingStore, type ItemFilter } from "@/lib/store/packing-store";
import { formatNumber } from "@/lib/labels";
import type { BadgeTone } from "@/lib/labels";
import type { CargoItem } from "@/lib/types";

// สถานะการจัดของแต่ละรายการ (อิงจำนวนกล่องที่วางได้จริง)
function itemStatus(
  packed: number,
  qty: number,
  hasResult: boolean
): { label: string; tone: BadgeTone } {
  if (!hasResult) return { label: "รอจัด", tone: "slate" };
  if (packed >= qty) return { label: "จัดครบ", tone: "emerald" };
  if (packed > 0) return { label: "จัดบางส่วน", tone: "amber" };
  return { label: "จัดไม่ได้", tone: "red" };
}

function ItemBadges({ item }: { item: CargoItem }) {
  const badges: { label: string; tone: BadgeTone }[] = [];
  if (item.fragile) badges.push({ label: "แตกง่าย", tone: "red" });
  if (item.noStack) badges.push({ label: "ห้ามซ้อน", tone: "amber" });
  if (item.heavy) badges.push({ label: "หนัก", tone: "slate" });
  if (item.rotatable) badges.push({ label: "หมุนได้", tone: "sky" });
  if (badges.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {badges.map((b) => (
        <span
          key={b.label}
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}

export function GroupPanel({ onClose }: { onClose?: () => void }) {
  const result = usePackingStore((s) => s.result);
  const activeGroups = usePackingStore((s) => s.activeGroups);
  const activeItems = usePackingStore((s) => s.activeItems);
  const selectedGroupId = usePackingStore((s) => s.selectedGroupId);
  const selectedItemId = usePackingStore((s) => s.selectedItemId);
  const selectGroup = usePackingStore((s) => s.selectGroup);
  const selectItem = usePackingStore((s) => s.selectItem);
  const itemFilter = usePackingStore((s) => s.itemFilter);
  const setItemFilter = usePackingStore((s) => s.setItemFilter);
  const search = usePackingStore((s) => s.search);
  const setSearch = usePackingStore((s) => s.setSearch);

  const hasResult = result !== null;

  // จำนวนกล่องที่วางได้จริง แยกตาม itemId
  const packedByItem = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of result?.packed ?? []) {
      map.set(b.itemId, (map.get(b.itemId) ?? 0) + 1);
    }
    return map;
  }, [result]);

  const matchFilter = (item: CargoItem, filter: ItemFilter): boolean => {
    const packed = packedByItem.get(item.id) ?? 0;
    switch (filter) {
      case "packed":
        return hasResult && packed >= item.qty;
      case "unpacked":
        return packed === 0;
      case "problem":
        return hasResult && packed < item.qty;
      default:
        return true;
    }
  };

  const matchSearch = (item: CargoItem): boolean => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)
    );
  };

  // จำนวนต่อฟิลเตอร์ (ใช้กับ chip)
  const counts = useMemo(() => {
    const c = { all: 0, unpacked: 0, packed: 0, problem: 0 };
    for (const item of activeItems) {
      c.all++;
      if (matchFilter(item, "unpacked")) c.unpacked++;
      if (matchFilter(item, "packed")) c.packed++;
      if (matchFilter(item, "problem")) c.problem++;
    }
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItems, packedByItem, hasResult]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-lg backdrop-blur-md">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">กลุ่มสินค้า</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            จัดกลุ่มตามปลายทาง — คลิกเพื่อไฮไลต์ในตู้ 3D
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="ซ่อนแผงกลุ่มสินค้า"
            title="ซ่อนแผง"
            className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2.5 border-b border-slate-100 px-4 py-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="ค้นหา SKU หรือชื่อสินค้า"
        />
        <FilterChips
          value={itemFilter}
          onChange={(v) => setItemFilter(v as ItemFilter)}
          options={[
            { value: "all", label: "ทั้งหมด", count: counts.all },
            { value: "unpacked", label: "ยังไม่ได้จัด", count: counts.unpacked },
            { value: "packed", label: "จัดแล้ว", count: counts.packed },
            { value: "problem", label: "มีปัญหา", count: counts.problem },
          ]}
        />
      </div>

      {/* รายการกลุ่ม + สินค้า */}
      <div className="thin-scrollbar min-h-[280px] flex-1 overflow-y-auto p-3">
        {activeGroups.map((group) => {
          const groupItems = activeItems.filter((it) => it.groupId === group.id);
          const visibleItems = groupItems.filter(
            (it) => matchFilter(it, itemFilter) && matchSearch(it)
          );

          const groupTotal = groupItems.reduce((s, it) => s + it.qty, 0);
          const groupPacked = groupItems.reduce(
            (s, it) => s + (packedByItem.get(it.id) ?? 0),
            0
          );
          const groupStatus = itemStatus(groupPacked, groupTotal, hasResult);
          const groupSelected = selectedGroupId === group.id;

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.id} className="mb-3 last:mb-0">
              {/* หัวกลุ่ม */}
              <button
                type="button"
                onClick={() => selectGroup(group.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
                  groupSelected
                    ? "border-deep-charcoal bg-bone"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded"
                  style={{ backgroundColor: group.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {group.name} · {group.destination}
                  </p>
                  <p className="text-xs text-slate-500">
                    จัดแล้ว {formatNumber(groupPacked)}/{formatNumber(groupTotal)} กล่อง
                  </p>
                </div>
                <Badge tone={groupStatus.tone}>{groupStatus.label}</Badge>
              </button>

              {/* รายการสินค้าในกลุ่ม */}
              <ul className="mt-1.5 space-y-1.5 pl-1">
                {visibleItems.map((item) => {
                  const packed = packedByItem.get(item.id) ?? 0;
                  const status = itemStatus(packed, item.qty, hasResult);
                  const selected = selectedItemId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => selectItem(item.id)}
                        className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                          selected
                            ? "border-deep-charcoal bg-bone ring-1 ring-charcoal-ink/20"
                            : "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-slate-900">
                            {item.name}
                          </span>
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono">{item.sku}</span>
                          <span>·</span>
                          <span>{formatNumber(item.qty)} กล่อง</span>
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          {item.length}×{item.width}×{item.height} ซม. ·{" "}
                          {formatNumber(item.weightKg)} กก./กล่อง
                        </div>
                        <ItemBadges item={item} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

        {activeItems.filter(
          (it) => matchFilter(it, itemFilter) && matchSearch(it)
        ).length === 0 && (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <PackageSearch className="h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">ไม่พบสินค้าตามเงื่อนไข</p>
          </div>
        )}
      </div>
    </div>
  );
}
