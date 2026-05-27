import type { OrderStatus, Role } from "@prisma/client";

// Форматирование денежной суммы в рублях.
export function money(value: number): string {
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

// Форматирование даты и времени.
export function dateTime(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dateOnly(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// --- Человекочитаемые названия статусов заказа --------------------------
export const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новая заявка",
  DIAGNOSTICS: "Диагностика",
  APPROVAL: "Согласование стоимости",
  IN_PROGRESS: "В работе",
  READY: "Готов к выдаче",
  ISSUED: "Выдан",
  CANCELED: "Отменён",
};

// Цветовые классы для отображения статуса (Tailwind).
export const STATUS_STYLES: Record<OrderStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 border-slate-300",
  DIAGNOSTICS: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVAL: "bg-orange-100 text-orange-800 border-orange-300",
  IN_PROGRESS: "bg-slate-200 text-slate-950 border-slate-400",
  READY: "bg-emerald-100 text-emerald-800 border-emerald-300",
  ISSUED: "bg-green-100 text-green-800 border-green-400",
  CANCELED: "bg-rose-100 text-rose-700 border-rose-300",
};

// Порядок статусов для отображения шкалы прогресса заявки.
export const STATUS_FLOW: OrderStatus[] = [
  "NEW",
  "DIAGNOSTICS",
  "APPROVAL",
  "IN_PROGRESS",
  "READY",
  "ISSUED",
];

// Допустимые переходы статусов (для мастера / администратора).
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  NEW: ["DIAGNOSTICS", "CANCELED"],
  DIAGNOSTICS: ["APPROVAL", "IN_PROGRESS", "CANCELED"],
  APPROVAL: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["READY", "CANCELED"],
  READY: ["ISSUED"],
  ISSUED: [],
  CANCELED: [],
};

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Администратор",
  MASTER: "Мастер",
  CLIENT: "Клиент",
};
