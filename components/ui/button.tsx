type ButtonVariant =
  | "primary"
  | "orange"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
type ButtonSize = "sm" | "md";

// รูปทรง/สีต่อ variant — navy เป็นหลัก, orange สำหรับงานปฏิบัติการสำคัญ (Optimize/Dispatch/Assign)
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "rounded-buttons bg-navy text-white hover:bg-navy-deep",
  orange: "rounded-buttons bg-orange text-white hover:bg-orange-strong",
  secondary:
    "rounded-secondarybuttons bg-bone text-charcoal-ink hover:bg-[#e1e9ed]",
  outline:
    "rounded-buttons border border-hairline bg-white text-charcoal-ink hover:border-navy hover:bg-bone",
  ghost: "rounded-secondarybuttons text-slate-mid hover:bg-bone hover:text-navy",
  danger: "rounded-buttons bg-[#dc2626] text-white hover:bg-[#b91c1c]",
};

// เงาเบาบางเท่านั้น (Cohere = flat/bordered) — ปุ่มทึบมี lift จาง ๆ, ปุ่มโปร่งแทบไม่มีเงา
const SHADOW_CLASS: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: { sm: "shadow-subtle-sm", md: "shadow-subtle" },
  orange: { sm: "shadow-subtle-sm", md: "shadow-subtle" },
  danger: { sm: "shadow-subtle-sm", md: "shadow-subtle" },
  outline: { sm: "shadow-subtle-2-sm", md: "shadow-subtle-2" },
  secondary: { sm: "", md: "" },
  ghost: { sm: "", md: "" },
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${VARIANT_CLASS[variant]} ${SHADOW_CLASS[variant][size]} ${SIZE_CLASS[size]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
