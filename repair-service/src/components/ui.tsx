import type { OrderStatus } from "@prisma/client";
import { STATUS_FLOW, STATUS_LABELS, STATUS_STYLES } from "@/lib/format";

// Цветной бейдж статуса заказа.
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`badge ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
  );
}

// Горизонтальная шкала прохождения заявки по статусам.
export function StatusProgress({ status }: { status: OrderStatus }) {
  if (status === "CANCELED") {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
        Заказ отменён
      </div>
    );
  }
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className="flex flex-wrap items-center gap-1">
      {STATUS_FLOW.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${
                done
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  done ? "bg-accent text-slate-950" : "bg-slate-200 text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              {STATUS_LABELS[s]}
            </div>
            {i < STATUS_FLOW.length - 1 && (
              <span className={done ? "text-slate-400" : "text-slate-200"}>—</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// Отображение рейтинга звёздами (1..5).
export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" title={`Оценка: ${rating} из 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i <= rating ? "#f59e0b" : "none"}
          stroke={i <= rating ? "#f59e0b" : "#cbd5e1"}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

// Заголовок страницы с необязательным описанием и действиями.
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
