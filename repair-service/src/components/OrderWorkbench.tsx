import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { dateOnly, money, NEXT_STATUSES, STATUS_LABELS } from "@/lib/format";
import { StatusBadge, StatusProgress } from "@/components/ui";
import { CommentsList, HistoryTimeline } from "@/components/order";
import {
  addCommentAction,
  addPartAction,
  addServiceAction,
  assignMasterAction,
  changeStatusAction,
  removePartAction,
  removeServiceAction,
  saveDiagnosisAction,
} from "@/actions/work";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function OrderWorkbench({
  order,
  services,
  parts,
  masters,
  isAdmin,
  backHref,
}: {
  order: any;
  services: { id: number; name: string; price: number }[];
  parts: { id: number; name: string; price: number; stock: number }[];
  masters: { id: number; fullName: string }[];
  isAdmin: boolean;
  backHref: string;
}) {
  const allowed: OrderStatus[] = NEXT_STATUSES[order.status as OrderStatus];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Заказ № {order.number}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Клиент: {order.client.fullName} · {order.client.phone ?? "телефон не указан"} ·
            создан {dateOnly(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Link href={backHref} className="btn-secondary">
            ← Назад
          </Link>
        </div>
      </div>

      <div className="card mb-6 p-5">
        <StatusProgress status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Левая колонка: устройство и неисправность */}
        <div className="space-y-6 lg:col-span-1">
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Устройство</h2>
            <dl className="space-y-1.5 text-sm">
              <Row label="Категория" value={order.category?.name ?? "—"} />
              <Row label="Тип" value={order.deviceType} />
              <Row label="Производитель" value={order.deviceBrand ?? "—"} />
              <Row label="Модель" value={order.deviceModel ?? "—"} />
              <Row label="Серийный №" value={order.serialNumber ?? "—"} />
            </dl>
            <h3 className="mb-1 mt-4 text-sm font-semibold text-slate-900">Неисправность</h3>
            <p className="text-sm text-slate-700">{order.problem}</p>
          </div>

          {isAdmin && (
            <div className="card p-5">
              <h2 className="mb-3 font-semibold text-slate-900">Назначение мастера</h2>
              <form action={assignMasterAction} className="flex gap-2">
                <input type="hidden" name="orderId" value={order.id} />
                <select name="masterId" className="select" defaultValue={order.masterId ?? ""}>
                  <option value="">— не назначен —</option>
                  {masters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
                <button className="btn-primary" type="submit">
                  ОК
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Центральная и правая колонки: управление */}
        <div className="space-y-6 lg:col-span-2">
          {/* Изменение статуса */}
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Изменить статус</h2>
            {allowed.length === 0 ? (
              <p className="text-sm text-slate-500">
                Заказ завершён, изменение статуса недоступно.
              </p>
            ) : (
              <form action={changeStatusAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <input type="hidden" name="orderId" value={order.id} />
                <div className="flex-1">
                  <label className="label">Новый статус</label>
                  <select name="status" className="select" defaultValue={allowed[0]}>
                    {allowed.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label">Комментарий (необязательно)</label>
                  <input name="comment" className="input" placeholder="например, причина отмены" />
                </div>
                <button className="btn-primary" type="submit">
                  Применить
                </button>
              </form>
            )}
          </div>

          {/* Диагностика и оценка */}
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Заключение и предварительная оценка</h2>
            <form action={saveDiagnosisAction} className="space-y-3">
              <input type="hidden" name="orderId" value={order.id} />
              <textarea
                name="diagnosis"
                className="textarea"
                rows={3}
                defaultValue={order.diagnosis ?? ""}
                placeholder="Результат диагностики, рекомендации"
              />
              <div className="flex items-end gap-2">
                <div>
                  <label className="label">Предварительная стоимость, ₽</label>
                  <input
                    name="estimatedCost"
                    type="number"
                    className="input max-w-48"
                    defaultValue={order.estimatedCost ?? ""}
                  />
                </div>
                <button className="btn-secondary" type="submit">
                  Сохранить
                </button>
              </div>
            </form>
          </div>

          {/* Услуги */}
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Услуги</h2>
            <LineItems
              items={order.services.map((s: any) => ({
                id: s.id,
                name: s.service.name,
                qty: s.quantity,
                price: s.price,
              }))}
              removeAction={removeServiceAction}
              orderId={order.id}
            />
            <form action={addServiceAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <div className="flex-1 min-w-48">
                <label className="label">Добавить услугу</label>
                <select name="serviceId" className="select">
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {money(s.price)}
                    </option>
                  ))}
                </select>
              </div>
              <input name="quantity" type="number" min={1} defaultValue={1} className="input w-20" />
              <button className="btn-secondary" type="submit">
                + Добавить
              </button>
            </form>
          </div>

          {/* Запчасти */}
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Запчасти</h2>
            <LineItems
              items={order.parts.map((p: any) => ({
                id: p.id,
                name: p.part.name,
                qty: p.quantity,
                price: p.price,
              }))}
              removeAction={removePartAction}
              orderId={order.id}
            />
            <form action={addPartAction} className="mt-3 flex flex-wrap items-end gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <div className="flex-1 min-w-48">
                <label className="label">Добавить запчасть (со склада)</label>
                <select name="partId" className="select">
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {money(p.price)} (ост. {p.stock})
                    </option>
                  ))}
                </select>
              </div>
              <input name="quantity" type="number" min={1} defaultValue={1} className="input w-20" />
              <button className="btn-secondary" type="submit">
                + Добавить
              </button>
            </form>
          </div>

          <div className="card flex items-center justify-between p-5">
            <span className="font-semibold text-slate-700">Итоговая стоимость заказа</span>
            <span className="text-xl font-bold text-slate-900">{money(order.totalCost)}</span>
          </div>

          {/* Комментарии */}
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Журнал работ и комментарии</h2>
            <CommentsList comments={order.comments} showInternal />
            <form action={addCommentAction} className="mt-3 space-y-2">
              <input type="hidden" name="orderId" value={order.id} />
              <textarea name="text" className="textarea" rows={2} placeholder="Новый комментарий" required />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="isInternal" /> служебный (не виден клиенту)
                </label>
                <button className="btn-secondary" type="submit">
                  Добавить
                </button>
              </div>
            </form>
          </div>

          {/* История */}
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">История заказа</h2>
            <HistoryTimeline history={order.history} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function LineItems({
  items,
  removeAction,
  orderId,
}: {
  items: { id: number; name: string; qty: number; price: number }[];
  removeAction: (formData: FormData) => void;
  orderId: number;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">Пока ничего не добавлено.</p>;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((it) => (
        <li key={it.id} className="flex items-center justify-between gap-2 py-2 text-sm">
          <span className="text-slate-800">
            {it.name} <span className="text-slate-400">× {it.qty}</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="font-medium text-slate-900">{money(it.price * it.qty)}</span>
            <form action={removeAction}>
              <input type="hidden" name="id" value={it.id} />
              <input type="hidden" name="orderId" value={orderId} />
              <button className="text-rose-600 hover:text-rose-800" title="Удалить" type="submit">
                ✕
              </button>
            </form>
          </span>
        </li>
      ))}
    </ul>
  );
}
