import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateOnly, money } from "@/lib/format";
import { PageHeader, StatusBadge } from "@/components/ui";
import type { OrderStatus } from "@prisma/client";

// Рабочее место мастера: заказы, назначенные данному исполнителю.
export default async function MasterPage() {
  const user = await requireRole("MASTER");
  const orders = await prisma.order.findMany({
    where: { masterId: user.id },
    orderBy: { createdAt: "desc" },
    include: { client: true, category: true },
  });

  const active = orders.filter((o) => !["ISSUED", "CANCELED"].includes(o.status));
  const done = orders.filter((o) => ["ISSUED", "CANCELED"].includes(o.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Заказы в работе"
        subtitle={`Назначено заказов: ${orders.length}, активных: ${active.length}`}
      />

      <Section title="Активные заказы" orders={active} empty="Активных заказов нет." />
      <div className="mt-8">
        <Section title="Завершённые" orders={done} empty="Завершённых заказов нет." />
      </div>
    </div>
  );
}

function Section({
  title,
  orders,
  empty,
}: {
  title: string;
  orders: {
    id: number;
    number: string;
    deviceType: string;
    deviceBrand: string | null;
    status: OrderStatus;
    totalCost: number;
    createdAt: Date;
    client: { fullName: string };
    category: { name: string } | null;
  }[];
  empty: string;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {orders.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-500">{empty}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>№</th>
                <th>Клиент</th>
                <th>Устройство</th>
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
                    <div className="text-xs text-slate-500">{o.deviceBrand}</div>
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="text-slate-600">{dateOnly(o.createdAt)}</td>
                  <td className="text-right font-medium">
                    {o.totalCost > 0 ? money(o.totalCost) : "—"}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/master/orders/${o.id}`}
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
      )}
    </div>
  );
}
