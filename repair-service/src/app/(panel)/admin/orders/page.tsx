import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateOnly, money, STATUS_LABELS } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = [
  "NEW",
  "DIAGNOSTICS",
  "APPROVAL",
  "IN_PROGRESS",
  "READY",
  "ISSUED",
  "CANCELED",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireRole("ADMIN");
  const { status = "", q = "" } = await searchParams;

  const all = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true, master: true, category: true },
  });

  const query = q.trim().toLowerCase();
  const orders = all.filter((o) => {
    if (status && o.status !== status) return false;
    if (query) {
      const hay = `${o.number} ${o.client.fullName} ${o.deviceType} ${o.deviceBrand ?? ""} ${
        o.deviceModel ?? ""
      }`.toLowerCase();
      if (!query.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Заказы" subtitle={`Найдено: ${orders.length} из ${all.length}`} />

      <form className="mb-4 flex flex-wrap gap-2" action="/admin/orders">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} className="input max-w-md"
          placeholder="Поиск: номер, клиент, устройство" />
        <button className="btn-primary" type="submit">
          Найти
        </button>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <Chip href={q ? `/admin/orders?q=${encodeURIComponent(q)}` : "/admin/orders"} active={!status}>
          Все
        </Chip>
        {STATUSES.map((s) => (
          <Chip
            key={s}
            href={`/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={status === s}
          >
            {STATUS_LABELS[s]}
          </Chip>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>№</th>
              <th>Клиент</th>
              <th>Устройство</th>
              <th>Мастер</th>
              <th>Статус</th>
              <th>Создан</th>
              <th className="text-right">Сумма</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="font-medium text-slate-900">{o.number}</td>
                <td className="text-slate-700">{o.client.fullName}</td>
                <td>
                  <div className="text-slate-800">{o.deviceType}</div>
                  <div className="text-xs text-slate-500">
                    {[o.deviceBrand, o.deviceModel].filter(Boolean).join(" ")}
                  </div>
                </td>
                <td className="text-slate-600">{o.master?.fullName ?? "—"}</td>
                <td>
                  <StatusBadge status={o.status} />
                </td>
                <td className="text-slate-600">{dateOnly(o.createdAt)}</td>
                <td className="text-right font-medium">
                  {o.totalCost > 0 ? money(o.totalCost) : "—"}
                </td>
                <td className="text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
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

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`badge ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
