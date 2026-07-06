"use client";

// ===== แถบตัวกรองงานทอยตู้: Depot ต้นทาง / สถานะ / ความเร่งด่วน / ค้นหา =====
import type { JobPriority, JobStatus } from "@/lib/types";
import { JOB_PRIORITY_LABEL, JOB_STATUS_LABEL } from "@/lib/labels";
import { DEPOTS } from "@/lib/mock/depots";
import { Card } from "@/components/ui/card";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchInput } from "@/components/ui/search-input";
import { SelectField } from "@/components/ui/select-field";

const STATUS_ORDER: JobStatus[] = [
  "pending",
  "assigned",
  "in_progress",
  "completed",
  "delayed",
  "problem",
];

const PRIORITY_ORDER: JobPriority[] = ["normal", "urgent", "critical"];

export function ShuttleFilters({
  depot,
  onDepotChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  priorityCounts,
  search,
  onSearchChange,
}: {
  depot: string;
  onDepotChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  priority: string;
  onPriorityChange: (v: string) => void;
  priorityCounts: Record<"all" | JobPriority, number>;
  search: string;
  onSearchChange: (v: string) => void;
}) {
  const depotOptions = [
    { value: "all", label: "ทุก Depot" },
    ...DEPOTS.map((d) => ({ value: d.id, label: d.name })),
  ];

  const statusOptions = [
    { value: "all", label: "ทุกสถานะ" },
    ...STATUS_ORDER.map((s) => ({ value: s, label: JOB_STATUS_LABEL[s] })),
  ];

  const priorityChips = [
    { value: "all", label: "ทั้งหมด", count: priorityCounts.all },
    ...PRIORITY_ORDER.map((p) => ({
      value: p,
      label: JOB_PRIORITY_LABEL[p],
      count: priorityCounts[p],
    })),
  ];

  return (
    <Card className="mb-6 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-[240px_240px_minmax(0,1fr)]">
        <SelectField
          label="Depot ต้นทาง"
          value={depot}
          onChange={onDepotChange}
          options={depotOptions}
        />
        <SelectField
          label="สถานะ"
          value={status}
          onChange={onStatusChange}
          options={statusOptions}
        />
        <div>
          <span className="mb-1 block text-xs font-medium text-slate-500">
            ค้นหา
          </span>
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="ค้นหาเลขงาน, เลข Container, ลูกค้า, ทะเบียนรถ, คนขับ..."
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-slate-500">ความเร่งด่วน</span>
        <FilterChips
          options={priorityChips}
          value={priority}
          onChange={onPriorityChange}
        />
      </div>
    </Card>
  );
}
