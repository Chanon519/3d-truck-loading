// ===== เซลล์แสดงเส้นทางทอยตู้: depot ต้นทาง+ช่องจอด → depot ปลายทาง+ช่องจอด =====
import { ArrowRight } from "lucide-react";
import type { Job } from "@/lib/types";
import { depotName } from "@/lib/mock/depots";

function RoutePoint({
  name,
  slot,
  bold,
}: {
  name: string;
  slot?: string;
  bold: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {/* ถ้าเป็นการทอยข้าม depot ให้เน้นชื่อ depot ตัวหนา */}
      <span className={bold ? "font-semibold text-slate-900" : "text-slate-700"}>
        {name}
      </span>
      {slot && (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
          {slot}
        </span>
      )}
    </span>
  );
}

export function ShuttleRoute({ job }: { job: Job }) {
  const crossDepot = Boolean(
    job.originDepotId && job.destDepotId && job.originDepotId !== job.destDepotId
  );
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <RoutePoint
        name={depotName(job.originDepotId)}
        slot={job.fromSlotCode}
        bold={crossDepot}
      />
      <ArrowRight
        className={`h-4 w-4 shrink-0 ${crossDepot ? "text-blue-600" : "text-slate-400"}`}
      />
      <RoutePoint
        name={depotName(job.destDepotId)}
        slot={job.toSlotCode}
        bold={crossDepot}
      />
    </div>
  );
}
