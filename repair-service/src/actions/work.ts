"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

// Проверка прав на работу с заказом: администратор — с любым,
// мастер — только с назначенным ему.
async function authorizeOrder(orderId: number) {
  const user = await requireRole("MASTER", "ADMIN");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Заказ не найден");
  if (user.role === "MASTER" && order.masterId !== user.id) {
    throw new Error("Недостаточно прав");
  }
  return { user, order };
}

// Пересчёт итоговой стоимости заказа (услуги + запчасти).
async function recalcTotal(orderId: number) {
  const [services, parts] = await Promise.all([
    prisma.orderService.findMany({ where: { orderId } }),
    prisma.orderPart.findMany({ where: { orderId } }),
  ]);
  const total =
    services.reduce((s, x) => s + x.price * x.quantity, 0) +
    parts.reduce((s, x) => s + x.price * x.quantity, 0);
  await prisma.order.update({ where: { id: orderId }, data: { totalCost: total } });
  return total;
}

function basePath(orderId: number) {
  revalidatePath(`/master/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/orders/${orderId}`);
}

// Изменение статуса заказа с записью в историю и уведомлением клиента.
export async function changeStatusAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status")) as OrderStatus;
  const comment = String(formData.get("comment") ?? "").trim() || null;
  const { user, order } = await authorizeOrder(orderId);

  const closedAt = status === "ISSUED" ? new Date() : order.closedAt;
  await prisma.order.update({
    where: { id: orderId },
    data: { status, closedAt },
  });
  await prisma.statusHistory.create({
    data: { orderId, status, changedById: user.id, comment },
  });
  await prisma.notification.create({
    data: {
      userId: order.clientId,
      text: `Статус заказа № ${order.number}: ${STATUS_LABELS[status]}`,
      link: `/orders/${orderId}`,
    },
  });
  basePath(orderId);
}

// Сохранение заключения мастера и предварительной оценки.
export async function saveDiagnosisAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const diagnosis = String(formData.get("diagnosis") ?? "").trim() || null;
  const estimatedCost = Number(formData.get("estimatedCost")) || null;
  await authorizeOrder(orderId);
  await prisma.order.update({ where: { id: orderId }, data: { diagnosis, estimatedCost } });
  basePath(orderId);
}

// Добавление услуги в заказ (с фиксацией текущей цены).
export async function addServiceAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const serviceId = Number(formData.get("serviceId"));
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
  await authorizeOrder(orderId);
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return;
  await prisma.orderService.create({
    data: { orderId, serviceId, quantity, price: service.price },
  });
  await recalcTotal(orderId);
  basePath(orderId);
}

export async function removeServiceAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const orderId = Number(formData.get("orderId"));
  await authorizeOrder(orderId);
  await prisma.orderService.delete({ where: { id } });
  await recalcTotal(orderId);
  basePath(orderId);
}

// Добавление запчасти в заказ (со списанием со склада).
export async function addPartAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const partId = Number(formData.get("partId"));
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
  await authorizeOrder(orderId);
  const part = await prisma.part.findUnique({ where: { id: partId } });
  if (!part) return;
  await prisma.orderPart.create({
    data: { orderId, partId, quantity, price: part.price },
  });
  // Списание со склада (не уходим в минус).
  await prisma.part.update({
    where: { id: partId },
    data: { stock: Math.max(0, part.stock - quantity) },
  });
  await recalcTotal(orderId);
  basePath(orderId);
}

export async function removePartAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const orderId = Number(formData.get("orderId"));
  await authorizeOrder(orderId);
  const item = await prisma.orderPart.findUnique({ where: { id } });
  if (item) {
    // Возврат запчасти на склад.
    await prisma.part.update({
      where: { id: item.partId },
      data: { stock: { increment: item.quantity } },
    });
    await prisma.orderPart.delete({ where: { id } });
  }
  await recalcTotal(orderId);
  basePath(orderId);
}

// Добавление комментария / записи в журнал работ.
export async function addCommentAction(formData: FormData) {
  const orderId = Number(formData.get("orderId"));
  const text = String(formData.get("text") ?? "").trim();
  const isInternal = formData.get("isInternal") === "on";
  const { user, order } = await authorizeOrder(orderId);
  if (!text) return;
  await prisma.comment.create({
    data: { orderId, authorId: user.id, text, isInternal },
  });
  if (!isInternal) {
    await prisma.notification.create({
      data: {
        userId: order.clientId,
        text: `Новый комментарий по заказу № ${order.number}`,
        link: `/orders/${orderId}`,
      },
    });
  }
  basePath(orderId);
}

// Назначение мастера на заказ (только администратор).
export async function assignMasterAction(formData: FormData) {
  await requireRole("ADMIN");
  const orderId = Number(formData.get("orderId"));
  const masterId = Number(formData.get("masterId")) || null;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;
  await prisma.order.update({ where: { id: orderId }, data: { masterId } });
  if (masterId) {
    await prisma.notification.create({
      data: {
        userId: masterId,
        text: `Вам назначен заказ № ${order.number}`,
        link: `/master/orders/${orderId}`,
      },
    });
  }
  basePath(orderId);
}
