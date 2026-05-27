import { prisma } from "./prisma";

// Загрузка заказа со всеми связанными данными для рабочего места.
export async function loadOrderDetail(id: number) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      master: true,
      category: true,
      services: { include: { service: true }, orderBy: { id: "asc" } },
      parts: { include: { part: true }, orderBy: { id: "asc" } },
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      history: { include: { changedBy: true }, orderBy: { createdAt: "asc" } },
      review: true,
    },
  });
}

// Справочники для форм рабочего места.
export async function loadCatalogs() {
  const [services, parts, masters] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      select: { id: true, name: true, price: true },
      orderBy: { name: "asc" },
    }),
    prisma.part.findMany({
      select: { id: true, name: true, price: true, stock: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: "MASTER" },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);
  return { services, parts, masters };
}
