import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addReviewAction } from "@/actions/orders";
import { dateOnly, money } from "@/lib/format";
import { PageHeader, StatusBadge, StatusProgress, Stars } from "@/components/ui";
import { CommentsList, CostBreakdown, HistoryTimeline } from "@/components/order";

export default async function ClientOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("CLIENT");
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      master: true,
      category: true,
      services: { include: { service: true } },
      parts: { include: { part: true } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      history: { include: { changedBy: true }, orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
  if (!order || order.clientId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={`Заказ № ${order.number}`} subtitle={`Создан ${dateOnly(order.createdAt)}`}>
        <Link href="/orders" className="btn-secondary">
          ← К списку
        </Link>
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={order.status} />
        {order.deadline && order.status !== "ISSUED" && order.status !== "CANCELED" && (
          <span className="text-sm text-slate-500">
            Плановая готовность: {dateOnly(order.deadline)}
          </span>
        )}
      </div>

      <div className="card mb-6 p-5">
        <StatusProgress status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Устройство</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Категория" value={order.category?.name ?? "—"} />
            <Row label="Тип" value={order.deviceType} />
            <Row label="Производитель" value={order.deviceBrand ?? "—"} />
            <Row label="Модель" value={order.deviceModel ?? "—"} />
            <Row label="Серийный номер" value={order.serialNumber ?? "—"} />
            <Row label="Мастер" value={order.master?.fullName ?? "не назначен"} />
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Неисправность</h2>
          <p className="text-sm text-slate-700">{order.problem}</p>
          {order.diagnosis && (
            <>
              <h3 className="mb-1 mt-4 text-sm font-semibold text-slate-900">
                Заключение мастера
              </h3>
              <p className="text-sm text-slate-700">{order.diagnosis}</p>
            </>
          )}
          {order.estimatedCost && order.status === "APPROVAL" && (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
              Предварительная стоимость ремонта: <b>{money(order.estimatedCost)}</b>. Ожидается
              ваше согласование.
            </div>
          )}
        </div>
      </div>

      <div className="card mt-6 p-5">
        <h2 className="mb-3 font-semibold text-slate-900">Смета</h2>
        <CostBreakdown services={order.services} parts={order.parts} total={order.totalCost} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card mt-6 p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Комментарии</h2>
          <CommentsList comments={order.comments} showInternal={false} />
        </div>
        <div className="card mt-6 p-5">
          <h2 className="mb-3 font-semibold text-slate-900">История заказа</h2>
          <HistoryTimeline history={order.history} />
        </div>
      </div>

      {/* Отзыв по выданному заказу */}
      {order.status === "ISSUED" && (
        <div className="card mt-6 p-5">
          <h2 className="mb-3 font-semibold text-slate-900">Отзыв о работе</h2>
          {order.review ? (
            <div>
              <Stars rating={order.review.rating} />
              {order.review.text && (
                <p className="mt-2 text-sm text-slate-700">«{order.review.text}»</p>
              )}
            </div>
          ) : (
            <form action={addReviewAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label className="label" htmlFor="rating">
                  Оценка
                </label>
                <select id="rating" name="rating" className="select max-w-40" defaultValue="5">
                  <option value="5">5 — отлично</option>
                  <option value="4">4 — хорошо</option>
                  <option value="3">3 — нормально</option>
                  <option value="2">2 — плохо</option>
                  <option value="1">1 — очень плохо</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="text">
                  Комментарий
                </label>
                <textarea id="text" name="text" className="textarea" rows={3}
                  placeholder="Поделитесь впечатлением о ремонте" />
              </div>
              <button type="submit" className="btn-primary">
                Оставить отзыв
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}
