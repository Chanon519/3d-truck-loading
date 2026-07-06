type Align = "left" | "center" | "right";

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function Table({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left ${className ?? ""}`}>{children}</table>
    </div>
  );
}

export function THead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <thead
      className={`bg-bone text-xs font-medium text-slate-mid ${className ?? ""}`}
    >
      {children}
    </thead>
  );
}

export function TBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={className}>{children}</tbody>;
}

export function TR({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-hairline hover:bg-bone/60 ${
        onClick ? "cursor-pointer" : ""
      } ${className ?? ""}`}
    >
      {children}
    </tr>
  );
}

export function TH({
  children,
  className,
  align = "left",
}: {
  children?: React.ReactNode;
  className?: string;
  align?: Align;
}) {
  return (
    <th
      className={`px-4 py-3 text-sm font-medium ${ALIGN_CLASS[align]} ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

export function TD({
  children,
  className,
  align = "left",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  align?: Align;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={`px-4 py-3 text-sm ${ALIGN_CLASS[align]} ${className ?? ""}`}
    >
      {children}
    </td>
  );
}
