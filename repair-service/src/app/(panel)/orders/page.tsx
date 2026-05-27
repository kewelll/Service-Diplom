import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateOnly, money } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";

// Личный кабинет клиента: список его заказов.
export default async function ClientOrdersPage() {
  const user = await requireRole("CLIENT");
  const orders = await prisma.order.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
    include: { master: true, category: true },
  });

  const active = orders.filter((o) => !["ISSUED", "CANCELED"].includes(o.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Мои заказы" subtitle={`Активных заказов: ${active} из ${orders.length}`}>
        <Link href="/orders/new" className="btn-primary">
          + Новая заявка
        </Link>
      </PageHeader>

      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">У вас пока нет заказов.</p>
          <Link href="/orders/new" className="btn-primary mt-4">
            Оставить первую заявку
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>№ заказа</th>
                <th>Устройство</th>
                <th>Статус</th>
                <th>Мастер</th>
                <th>Создан</th>
                <th className="text-right">Стоимость</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-medium text-slate-900">{o.number}</td>
                  <td>
                    <div className="font-medium text-slate-800">{o.deviceType}</div>
                    <div className="text-xs text-slate-500">
                      {[o.deviceBrand, o.deviceModel].filter(Boolean).join(" ")}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="text-slate-600">{o.master?.fullName ?? "не назначен"}</td>
                  <td className="text-slate-600">{dateOnly(o.createdAt)}</td>
                  <td className="text-right font-semibold">
                    {o.totalCost > 0 ? money(o.totalCost) : "—"}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/orders/${o.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      Подробнее
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
