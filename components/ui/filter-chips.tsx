"use client";

export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-charcoal-ink font-medium text-white"
                : "border border-hairline bg-white text-slate-mid hover:bg-bone"
            }`}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span
                className={`text-xs ${active ? "text-white/70" : "text-slate-mid"}`}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
