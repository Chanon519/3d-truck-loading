"use client";

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      {label && (
        <span className="mb-1 block text-xs font-medium text-slate-mid">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full cursor-pointer rounded-inputs border border-hairline bg-white px-3 py-2 text-sm text-charcoal-ink focus:border-focus-blue focus:outline-none focus:ring-2 focus:ring-focus-blue/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
