import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-inputs bg-bone text-slate-mid">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="text-sm font-medium text-charcoal-ink">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-mid">{subtitle}</p>}
    </div>
  );
}
