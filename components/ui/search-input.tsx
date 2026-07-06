"use client";

import { Search } from "lucide-react";

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-mid" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-inputs border border-hairline bg-white py-2 pl-9 pr-3 text-sm text-charcoal-ink placeholder:text-slate-mid focus:border-focus-blue focus:outline-none focus:ring-2 focus:ring-focus-blue/20"
      />
    </div>
  );
}
