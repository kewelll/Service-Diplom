import type { OrderStatus } from "@prisma/client";
import { dateTime, money, STATUS_LABELS } from "@/lib/format";

type ServiceLine = { id: number; quantity: number; price: number; service: { name: string } };
type PartLine = { id: number; quantity: number; price: number; part: { name: string } };

// Смета по заказу: оказанные услуги и использованные запчасти.
export function CostBreakdown({
  services,
  parts,
  total,
}: {
  services: ServiceLine[];
  parts: PartLine[];
  total: number;
}) {
  if (services.length === 0 && parts.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Услуги и запчасти будут добавлены после диагностики.
      </p>
    );
  }
  return (
    <table className="table-base">
      <thead>
        <tr>
          <th>Наименование</th>
          <th className="text-right">Кол-во</th>
          <th className="text-right">Цена</th>
          <th className="text-right">Сумма</th>
        </tr>
      </thead>
      <tbody>
        {services.map((s) => (
          <tr key={`s${s.id}`}>
            <td>
              <span className="badge mr-2 border-slate-300 bg-slate-100 text-slate-900">услуга</span>
              {s.service.name}
            </td>
            <td className="text-right">{s.quantity}</td>
            <td className="text-right">{money(s.price)}</td>
            <td className="text-right font-medium">{money(s.price * s.quantity)}</td>
          </tr>
        ))}
        {parts.map((p) => (
          <tr key={`p${p.id}`}>
            <td>
              <span className="badge mr-2 border-amber-200 bg-amber-50 text-amber-700">запчасть</span>
              {p.part.name}
            </td>
            <td className="text-right">{p.quantity}</td>
            <td className="text-right">{money(p.price)}</td>
            <td className="text-right font-medium">{money(p.price * p.quantity)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right font-semibold text-slate-700">
            Итого:
          </td>
          <td className="text-right text-lg font-bold text-slate-900">{money(total)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

type HistoryItem = {
  id: number;
  status: OrderStatus;
  comment: string | null;
  createdAt: Date;
  changedBy: { fullName: string } | null;
};

// Лента истории изменения статусов заказа.
export function HistoryTimeline({ history }: { history: HistoryItem[] }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {history.map((h) => (
        <li key={h.id} className="relative">
          <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-900" />
          <div className="text-sm font-medium text-slate-900">{STATUS_LABELS[h.status]}</div>
          <div className="text-xs text-slate-500">
            {dateTime(h.createdAt)}
            {h.changedBy ? ` · ${h.changedBy.fullName}` : ""}
          </div>
          {h.comment && <div className="mt-0.5 text-sm text-slate-600">{h.comment}</div>}
        </li>
      ))}
    </ol>
  );
}

type CommentItem = {
  id: number;
  text: string;
  isInternal: boolean;
  createdAt: Date;
  author: { fullName: string };
};

// Список комментариев (журнал работ) по заказу.
export function CommentsList({
  comments,
  showInternal,
}: {
  comments: CommentItem[];
  showInternal: boolean;
}) {
  const visible = comments.filter((c) => showInternal || !c.isInternal);
  if (visible.length === 0) {
    return <p className="text-sm text-slate-500">Комментариев пока нет.</p>;
  }
  return (
    <div className="space-y-3">
      {visible.map((c) => (
        <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">{c.author.fullName}</span>
            <span className="text-xs text-slate-400">{dateTime(c.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700">{c.text}</p>
          {c.isInternal && (
            <span className="badge mt-2 border-slate-300 bg-white text-slate-500">
              служебный комментарий
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
