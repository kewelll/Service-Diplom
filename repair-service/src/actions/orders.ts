"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

// Генерация человекочитаемого номера заказа вида 2026-000042.
async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.order.count();
  return `${year}-${String(count + 1).padStart(6, "0")}`;
}

// Создание новой заявки на ремонт клиентом.
export async function createOrderAction(formData: FormData) {
  const user = await requireRole("CLIENT");

  const deviceType = String(formData.get("deviceType") ?? "").trim();
  const problem = String(formData.get("problem") ?? "").trim();
  const categoryId = Number(formData.get("categoryId")) || null;
  const deviceBrand = String(formData.get("deviceBrand") ?? "").trim() || null;
  const deviceModel = String(formData.get("deviceModel") ?? "").trim() || null;
  const serialNumber = String(formData.get("serialNumber") ?? "").trim() || null;

  if (deviceType.length < 2 || problem.length < 5) {
    redirect("/orders/new?error=1");
  }

  const order = await prisma.order.create({
    data: {
      number: await nextOrderNumber(),
      clientId: user.id,
      categoryId,
      deviceType,
      deviceBrand,
      deviceModel,
      serialNumber,
      problem,
      status: "NEW",
      history: {
        create: { status: "NEW", changedById: user.id, comment: "Заявка создана клиентом" },
      },
    },
  });

  // Уведомления администраторам о новой заявке.
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        text: `Новая заявка № ${order.number} (${deviceType})`,
        link: `/admin/orders/${order.id}`,
      })),
    });
  }

  redirect(`/orders/${order.id}`);
}

// Добавление отзыва клиентом по выданному заказу.
export async function addReviewAction(formData: FormData) {
  const user = await requireRole("CLIENT");
  const orderId = Number(formData.get("orderId"));
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating")) || 5));
  const text = String(formData.get("text") ?? "").trim() || null;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.clientId !== user.id || order.status !== "ISSUED") return;

  const existing = await prisma.review.findUnique({ where: { orderId } });
  if (existing) return;

  await prisma.review.create({ data: { orderId, clientId: user.id, rating, text } });
  if (order.masterId) {
    await prisma.notification.create({
      data: {
        userId: order.masterId,
        text: `Получен отзыв (${rating}/5) по заказу № ${order.number}`,
        link: `/master/orders/${order.id}`,
      },
    });
  }
  revalidatePath(`/orders/${orderId}`);
}
