export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-cards border border-hairline bg-white shadow-card ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-hairline px-5 py-4">
      <div className="min-w-0">
        <h3 className="font-semibold text-charcoal-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-mid">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
