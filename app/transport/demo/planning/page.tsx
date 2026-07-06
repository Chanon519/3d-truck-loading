"use client";

// หน้า "แผนงาน" — รายการแผนที่ผู้ใช้สร้างเอง (สร้างจากหน้าจัดการงาน)
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowRightLeft,
  Boxes,
  ClipboardCheck,
  Container,
  FileStack,
  PackageCheck,
  Plus,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useToast } from "@/components/ui/toast";
import { usePlansStore, findPlanForJob } from "@/lib/store/plans-store";
import { useJobsStore } from "@/lib/store/jobs-store";
import { derivePlanState, planProgress } from "@/lib/plan-helpers";
import {
  PLAN_STATE_LABEL,
  PLAN_STATE_TONE,
  formatNumber,
  formatThaiDateTime,
} from "@/lib/labels";
import type { TransportPlan } from "@/lib/types";

// นับงานแต่ละประเภทในแผน จาก units (container = ต้องจัดของ, shuttle = มีตู้แต่ไม่จัดของ, general = ไม่มีตู้)
function typeCounts(plan: TransportPlan) {
  return {
    container: plan.units.filter((u) => u.needsPacking).length,
    shuttle: plan.units.filter((u) => u.needsContainer && !u.needsPacking)
      .length,
    general: plan.units.filter((u) => !u.needsContainer).length,
  };
}

function PlanCard({
  plan,
  onDelete,
  onOptimize,
}: {
  plan: TransportPlan;
  onDelete: (plan: TransportPlan) => void;
  onOptimize: (plan: TransportPlan) => void;
}) {
  const state = derivePlanState(plan);
  const { ready, total } = planProgress(plan);
  const counts = typeCounts(plan);
  const pct = total > 0 ? Math.round((ready / total) * 100) : 0;

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-charcoal-ink">{plan.name}</p>
          <p className="mt-0.5 text-xs text-slate-mid">
            {plan.id} · สร้างเมื่อ {formatThaiDateTime(plan.createdAt)}
          </p>
        </div>
        <Badge tone={PLAN_STATE_TONE[state]}>{PLAN_STATE_LABEL[state]}</Badge>
      </div>

      {/* จำนวนงานแยกประเภท */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-mid">
        <span className="inline-flex items-center gap-1.5">
          <Container className="h-4 w-4" />
          งานตู้ {formatNumber(counts.container)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Boxes className="h-4 w-4" />
          งานทั่วไป {formatNumber(counts.general)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ArrowRightLeft className="h-4 w-4" />
          งานทอยตู้ {formatNumber(counts.shuttle)}
        </span>
      </div>

      {/* progress พร้อมออกรถ */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-mid">พร้อมออกรถ</span>
          <span className="font-medium text-charcoal-ink">
            {formatNumber(ready)}/{formatNumber(total)}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bone">
          <div
            className="h-full rounded-full bg-logo-violet transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {state === "draft" && (
          <Button
            variant="orange"
            className="w-full"
            onClick={() => onOptimize(plan)}
          >
            <Sparkles className="h-4 w-4" />
            Optimize อัตโนมัติ
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Link href={`/transport/demo/planning/${plan.id}`} className="flex-1">
            <Button className="w-full" variant={state === "draft" ? "outline" : "primary"}>
              เปิดแผน
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => onDelete(plan)}
            aria-label={`ลบแผน ${plan.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function PlansPage() {
  const plans = usePlansStore((s) => s.plans);
  const deletePlan = usePlansStore((s) => s.deletePlan);
  const autoOptimize = usePlansStore((s) => s.autoOptimize);
  const createPlan = usePlansStore((s) => s.createPlan);
  const jobs = useJobsStore((s) => s.jobs);
  const { toast } = useToast();
  const router = useRouter();

  // งานที่รอวางแผน = สถานะ pending และยังไม่อยู่ในแผนใด
  const plannableJobs = useMemo(
    () => jobs.filter((j) => j.status === "pending" && !findPlanForJob(plans, j.id)),
    [jobs, plans]
  );

  // Optimize อัตโนมัติจากศูนย์: สร้างแผนจากงานที่รอวางแผน แล้ว optimize ทันที
  const handleAutoCreate = () => {
    if (plannableJobs.length === 0) {
      toast("ไม่มีงานที่รอวางแผน — ทุกงานถูกจัดแผนแล้ว", "info");
      return;
    }
    const name = `แผนอัตโนมัติ ${formatThaiDateTime(new Date().toISOString())}`;
    const id = createPlan(
      name,
      plannableJobs.map((j) => j.id)
    );
    autoOptimize(id);
    toast(
      `สร้างและ Optimize แผนอัตโนมัติแล้ว — ${plannableJobs.length} งาน`,
      "success"
    );
    router.push(`/transport/demo/planning/${id}`);
  };

  const stats = useMemo(() => {
    const withState = plans.map((p) => derivePlanState(p));
    return {
      total: plans.length,
      draft: withState.filter((s) => s === "draft").length,
      ready: withState.filter((s) => s === "ready").length,
      applied: withState.filter((s) => s === "applied").length,
    };
  }, [plans]);

  const handleDelete = (plan: TransportPlan) => {
    deletePlan(plan.id);
    toast(`ลบแผน ${plan.name} แล้ว`, "info");
  };

  // Optimize อัตโนมัติทีละแผน
  const handleOptimize = (plan: TransportPlan) => {
    autoOptimize(plan.id);
    toast(`Optimize แผน ${plan.name} แล้ว`, "success");
  };

  // Optimize อัตโนมัติทุกแผนร่างในครั้งเดียว
  const handleOptimizeAll = () => {
    const drafts = plans.filter((p) => derivePlanState(p) === "draft");
    drafts.forEach((p) => autoOptimize(p.id));
    const after = usePlansStore.getState().plans;
    const ready = after.filter((p) => derivePlanState(p) === "ready").length;
    toast(
      `Optimize ${drafts.length} แผนแล้ว — พร้อมออกรถ ${ready} แผน`,
      "success"
    );
  };

  return (
    <div>
      <PageHeader
        title="แผนงาน"
        subtitle="สร้างและจัดการแผนขนส่งของคุณเอง — จัดของเข้าตู้และจัดรถในที่เดียว"
        actions={
          <>
            <Button variant="orange" onClick={handleAutoCreate}>
              <Sparkles className="h-4 w-4" />
              Optimize อัตโนมัติ
            </Button>
            <Link href="/transport/demo/jobs">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                สร้างแผนใหม่
              </Button>
            </Link>
          </>
        }
      />

      {/* ---------- สรุป ---------- */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="แผนทั้งหมด"
          value={formatNumber(stats.total)}
          icon={FileStack}
          tone="blue"
        />
        <StatCard
          label="ร่างแผน"
          value={formatNumber(stats.draft)}
          sub="ยังจัดไม่ครบ"
          icon={ClipboardCheck}
          tone="slate"
        />
        <StatCard
          label="พร้อมออกรถ"
          value={formatNumber(stats.ready)}
          sub="พร้อมนำไปใช้"
          icon={PackageCheck}
          tone="emerald"
        />
        <StatCard
          label="นำไปใช้แล้ว"
          value={formatNumber(stats.applied)}
          sub="มอบหมายงานแล้ว"
          icon={Truck}
          tone="violet"
        />
      </div>

      {/* ---------- Optimize อัตโนมัติ ---------- */}
      {stats.draft > 0 && (
        <Card className="mb-6 flex flex-col gap-3 border-l-4 border-l-orange p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-inputs bg-orange-wash text-orange">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-charcoal-ink">
                Optimize แผนอัตโนมัติ
              </p>
              <p className="text-sm text-slate-mid">
                ให้ระบบจัดของเข้าตู้และจัดรถ/คนขับให้ทุกงานในแผนร่าง{" "}
                {formatNumber(stats.draft)} แผน โดยอัตโนมัติ
                แล้วคุณค่อยตรวจและปรับก่อนนำไปใช้
              </p>
            </div>
          </div>
          <Button variant="orange" className="shrink-0" onClick={handleOptimizeAll}>
            <Sparkles className="h-4 w-4" />
            Optimize ร่างทั้งหมด ({formatNumber(stats.draft)})
          </Button>
        </Card>
      )}

      {/* ---------- รายการแผน ---------- */}
      {plans.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="ยังไม่มีแผน"
            subtitle={
              plannableJobs.length > 0
                ? `กด “Optimize อัตโนมัติ” ให้ระบบสร้างแผนจากงานที่รอวางแผน ${formatNumber(plannableJobs.length)} งาน หรือเลือกงานเองก็ได้`
                : "ไปที่หน้าจัดการงาน เลือกงานที่ต้องการ แล้วกด “สร้างแผน”"
            }
          />
          <div className="flex flex-wrap justify-center gap-2 pb-8">
            <Button variant="orange" onClick={handleAutoCreate}>
              <Sparkles className="h-4 w-4" />
              Optimize อัตโนมัติ
            </Button>
            <Link href="/transport/demo/jobs">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                ไปเลือกงานเอง
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onDelete={handleDelete}
              onOptimize={handleOptimize}
            />
          ))}
        </div>
      )}
    </div>
  );
}
