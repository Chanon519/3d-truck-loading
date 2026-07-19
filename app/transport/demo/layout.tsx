"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  Box,
  Boxes,
  ClipboardList,
  Container,
  LayoutDashboard,
  Menu,
  Sparkles,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toast";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  featured?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
  featured?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "ภาพรวม",
    items: [
      {
        label: "ภาพรวม",
        href: "/transport/demo",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "วางแผนและ Optimize",
    featured: true,
    items: [
      {
        label: "แผนงาน",
        href: "/transport/demo/planning",
        icon: Sparkles,
        featured: true,
      },
      {
        label: "จัดของเข้า Container 3D",
        href: "/transport/demo/loading-3d",
        icon: Box,
        featured: true,
      },
    ],
  },
  {
    title: "ประสิทธิภาพ",
    items: [
      { label: "Ranking รถ", href: "/transport/demo/vehicles", icon: Truck },
      { label: "Ranking คนขับ", href: "/transport/demo/drivers", icon: Users },
    ],
  },
  {
    title: "ปฏิบัติการ",
    items: [
      { label: "จัดการ Depot", href: "/transport/demo/depot", icon: Warehouse },
      { label: "จัดการงาน", href: "/transport/demo/jobs", icon: ClipboardList },
      {
        label: "งานตู้",
        href: "/transport/demo/container-jobs",
        icon: Container,
      },
      { label: "งานทั่วไป", href: "/transport/demo/general-jobs", icon: Boxes },
      {
        label: "งานทอยตู้",
        href: "/transport/demo/shuttle-jobs",
        icon: ArrowLeftRight,
      },
    ],
  },
];

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* โลโก้ */}
      <Link
        href="/transport/demo"
        onClick={onNavigate}
        className="flex flex-col items-start gap-3 border-b border-hairline px-5 py-5 transition-opacity hover:opacity-80"
      >
        <Image
          src="/compattana-logo.png"
          alt="Compattana"
          width={2416}
          height={654}
          priority
          className="h-10 w-auto"
        />
        <div className="flex items-center gap-2">
          <Badge tone="violet">TMS</Badge>
          <span className="truncate text-[11px] text-slate-mid">
            ระบบบริหารงานขนส่ง
          </span>
        </div>
      </Link>

      {/* เมนู */}
      <nav className="thin-scrollbar flex-1 overflow-y-auto px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div
            key={group.title}
            className={`mb-5 last:mb-0 ${
              group.featured
                ? "rounded-cards bg-bone p-2 ring-1 ring-lavender-trace"
                : ""
            }`}
          >
            <p
              className={`mb-1.5 flex items-center gap-1.5 px-3 text-[11px] font-semibold tracking-wide uppercase ${
                group.featured
                  ? "text-logo-violet"
                  : "font-medium text-slate-mid"
              }`}
            >
              {group.featured && <Sparkles className="h-3 w-3" />}
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const base =
                  "flex items-center gap-2.5 rounded-secondarybuttons px-3 py-2 text-sm transition-colors";
                const state = active
                  ? item.featured
                    ? "bg-navy font-semibold text-white"
                    : "shadow-[inset_2px_0_0_0_#2e6c87] bg-bone font-medium text-navy"
                  : item.featured
                    ? "bg-white/70 font-medium text-charcoal-ink hover:bg-white"
                    : "text-slate-mid hover:bg-bone hover:text-navy";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`${base} ${state}`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ท้าย sidebar */}
      <div className="border-t border-hairline p-3">
        <div className="rounded-inputs bg-amber-50/80 px-3 py-2 text-center text-xs font-medium text-amber-700">
          โหมด DEMO — ข้อมูลจำลอง
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-mid">
          <Image
            src="/compattana-icon.png"
            alt=""
            width={591}
            height={653}
            className="h-3 w-auto opacity-60"
          />
          <span>Powered by COMPATTANA</span>
        </div>
      </div>
    </div>
  );
}

export default function TransportDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div>
      {/* Sidebar จอใหญ่ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-hairline bg-white lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* แถบบนจอเล็ก */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-hairline bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="เปิดเมนู"
          className="rounded-lg p-1.5 text-slate-mid transition-colors hover:bg-bone"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/transport/demo" className="flex items-center gap-2">
          <Image
            src="/compattana-icon.png"
            alt="Compattana"
            width={591}
            height={653}
            className="h-7 w-auto"
          />
          <span className="text-sm font-semibold tracking-tight text-charcoal-ink">
            TMS Demo
          </span>
        </Link>
      </header>

      {/* Drawer จอเล็ก */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal-ink/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="ปิดเมนู"
              className="absolute right-3 top-4 z-10 rounded-inputs p-1 text-slate-mid transition-colors hover:bg-bone hover:text-charcoal-ink"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              onNavigate={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* เนื้อหาหน้า */}
      <div className="lg:pl-64">
        <main className="min-h-screen">
          <div className="mx-auto max-w-[1600px] p-4 lg:p-8">{children}</div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
