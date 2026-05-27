"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";
import Brand from "./Brand";
import { ROLE_LABELS } from "@/lib/format";
import { logoutAction } from "@/actions/auth";

type NavItem = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };

const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  clipboard: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2",
  plus: "M12 5v14M5 12h14",
  tag: "M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  layers: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
};

function navFor(role: Role, unread: number): NavItem[] {
  if (role === "ADMIN")
    return [
      { href: "/admin", label: "Обзор", icon: "grid" },
      { href: "/admin/orders", label: "Заказы", icon: "clipboard" },
      { href: "/admin/users", label: "Пользователи", icon: "users" },
      { href: "/admin/services", label: "Услуги", icon: "tag" },
      { href: "/admin/parts", label: "Склад", icon: "box" },
      { href: "/admin/categories", label: "Категории", icon: "layers" },
      { href: "/notifications", label: "Уведомления", icon: "bell", badge: unread },
      { href: "/profile", label: "Профиль", icon: "user" },
    ];
  if (role === "MASTER")
    return [
      { href: "/master", label: "Заказы в работе", icon: "wrench" },
      { href: "/notifications", label: "Уведомления", icon: "bell", badge: unread },
      { href: "/profile", label: "Профиль", icon: "user" },
    ];
  return [
    { href: "/orders", label: "Мои заказы", icon: "clipboard" },
    { href: "/orders/new", label: "Новая заявка", icon: "plus" },
    { href: "/services", label: "Услуги и цены", icon: "tag" },
    { href: "/notifications", label: "Уведомления", icon: "bell", badge: unread },
    { href: "/profile", label: "Профиль", icon: "user" },
  ];
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function PanelShell({
  user,
  unread,
  children,
}: {
  user: { fullName: string; role: Role; email: string };
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = navFor(user.role, unread);
  const [open, setOpen] = useState(false);

  // Активный пункт — с самым длинным совпадающим префиксом пути.
  const activeHref = items
    .map((i) => i.href)
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  const SidebarBody = (
    <>
      <div className="px-5 py-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-1">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={() => setOpen(false)}
            className={`sidebar-link ${it.href === activeHref ? "sidebar-link-active" : ""}`}
          >
            <Icon d={ICONS[it.icon]} />
            <span className="flex-1">{it.label}</span>
            {it.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
                {it.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-900">
            {user.fullName.charAt(0)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800">{user.fullName}</div>
            <div className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost mt-1 w-full justify-start gap-3 px-3 py-2.5 text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Выйти
          </button>
        </form>
      </div>
    </>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Десктопный сайдбар */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200 bg-white lg:flex">
        {SidebarBody}
      </aside>

      {/* Мобильный сайдбар */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            {SidebarBody}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        {/* Топбар */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <button className="btn-ghost p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Меню">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          </button>
          <div className="lg:hidden">
            <Brand subtitle={false} />
          </div>
          <div className="flex-1" />
          <Link href="/notifications" className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100" title="Уведомления">
            <Icon d={ICONS.bell} />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>
          <Link href="/" className="btn-ghost hidden text-sm sm:inline-flex" title="Перейти на сайт">
            На сайт
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
