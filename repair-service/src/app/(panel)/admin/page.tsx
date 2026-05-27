import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateOnly, money, STATUS_LABELS } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";
import type { OrderStatus } from "@prisma/client";

export default async function AdminDashboard() {
  await requireRole("ADMIN");

  const [totalOrders, clients, mastersList, grouped, revenueAgg, ratingAgg, recent] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.findMany({ where: { role: "MASTER" }, orderBy: { fullName: "asc" } }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.order.aggregate({ _sum: { totalCost: true }, where: { status: "ISSUED" } }),
      prisma.review.aggregate({ _avg: { rating: true }, _count: { _all: true } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { client: true, master: true },
      }),
    ]);

  const activeByMaster = await prisma.order.groupBy({
    by: ["masterId"],
    where: { status: { notIn: ["ISSUED", "CANCELED"] }, masterId: { not: null } },
    _count: { _all: true },
  });
  const workload = new Map<number, number>();
  for (const row of activeByMaster) if (row.masterId != null) workload.set(row.masterId, row._count._all);

  const countByStatus = (st: OrderStatus) =>
    grouped.find((g) => g.status === st)?._count._all ?? 0;
  const active = grouped
    .filter((g) => !["ISSUED", "CANCELED"].includes(g.status))
    .reduce((s, g) => s + g._count._all, 0);

  const statuses: OrderStatus[] = [
    "NEW", "DIAGNOSTICS", "APPROVAL", "IN_PROGRESS", "READY", "ISSUED", "CANCELED",
  ];
  // Явные классы цвета полос (Tailwind не видит классы, собранные в рантайме).
  const BAR: Record<OrderStatus, string> = {
    NEW: "bg-slate-400",
    DIAGNOSTICS: "bg-amber-500",
    APPROVAL: "bg-orange-500",
    IN_PROGRESS: "bg-sky-500",
    READY: "bg-emerald-500",
    ISSUED: "bg-green-600",
    CANCELED: "bg-rose-500",
  };

  const kpis: [string, string, string, string][] = [
    ["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2", String(totalOrders), "Всего заказов", "indigo"],
    ["M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", String(active), "В работе", "amber"],
    ["M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", money(revenueAgg._sum.totalCost ?? 0), "Выручка (выдано)", "emerald"],
    ["M12 2 15.09 8.26 22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z", `${(ratingAgg._avg.rating ?? 0).toFixed(1)}`, `Средняя оценка · ${ratingAgg._count._all} отзывов`, "violet"],
  ];
  const tone: Record<string, string> = {
    indigo: "bg-slate-100 text-slate-900",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Обзор" subtitle="Сводная статистика сервисного центра" />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(([icon, value, label, t]) => (
          <div key={label} className="card p-5">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone[t]}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={icon} />
              </svg>
            </span>
            <div className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{value}</div>
            <div className="mt-1 text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Заказы по статусам */}
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-slate-900">Заказы по статусам</h2>
          <div className="space-y-3">
            {statuses.map((st) => {
              const c = countByStatus(st);
              const pct = totalOrders ? Math.round((c / totalOrders) * 100) : 0;
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-sm text-slate-600">{STATUS_LABELS[st]}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${BAR[st]}`}
                      style={{ width: `${Math.max(pct, c ? 8 : 0)}%` }}
                    />
                  </div>
                  <span className="w-7 text-right text-sm font-semibold text-slate-700">{c}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Загрузка мастеров */}
        <div className="card p-6">
          <h2 className="mb-4 font-bold text-slate-900">Загрузка мастеров</h2>
          <div className="space-y-3">
            {mastersList.map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {m.fullName.charAt(0)}
                  </span>
                  <span className="text-sm text-slate-700">{m.fullName}</span>
                </div>
                <span className="badge border-slate-300 bg-slate-100 text-slate-900">
                  {workload.get(m.id) ?? 0} активных
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
              <span className="text-slate-500">Клиентов в системе</span>
              <span className="font-bold text-slate-800">{clients}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Последние заказы */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="font-bold text-slate-900">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-slate-900 hover:text-slate-900">
            Все заказы →
          </Link>
        </div>
        <table className="table-base mt-3">
          <thead>
            <tr>
              <th>№</th>
              <th>Клиент</th>
              <th>Устройство</th>
              <th>Мастер</th>
              <th>Статус</th>
              <th>Создан</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id}>
                <td className="font-semibold text-slate-900">{o.number}</td>
                <td className="text-slate-700">{o.client.fullName}</td>
                <td className="text-slate-700">{o.deviceType}</td>
                <td className="text-slate-600">{o.master?.fullName ?? "—"}</td>
                <td><StatusBadge status={o.status} /></td>
                <td className="text-slate-600">{dateOnly(o.createdAt)}</td>
                <td className="text-right">
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold text-slate-900 hover:text-slate-900">
                    Открыть
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
