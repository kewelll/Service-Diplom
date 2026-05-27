"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import type { Role } from "@prisma/client";

// --- Управление пользователями ------------------------------------------
export async function setUserRoleAction(formData: FormData) {
  const admin = await requireRole("ADMIN");
  const userId = Number(formData.get("userId"));
  const role = String(formData.get("role")) as Role;
  if (userId === admin.id) return; // нельзя понизить самого себя
  if (!["ADMIN", "MASTER", "CLIENT"].includes(role)) return;
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

// --- Справочник услуг ----------------------------------------------------
export async function createServiceAction(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price")) || 0;
  const durationH = Number(formData.get("durationH")) || 1;
  const categoryId = Number(formData.get("categoryId")) || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  if (name.length < 2) return;
  await prisma.service.create({ data: { name, price, durationH, categoryId, description } });
  revalidatePath("/admin/services");
}

export async function toggleServiceAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  const s = await prisma.service.findUnique({ where: { id } });
  if (s) await prisma.service.update({ where: { id }, data: { isActive: !s.isActive } });
  revalidatePath("/admin/services");
}

// --- Склад запчастей -----------------------------------------------------
export async function createPartAction(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const price = Number(formData.get("price")) || 0;
  const stock = Number(formData.get("stock")) || 0;
  if (name.length < 2) return;
  await prisma.part.create({ data: { name, sku, price, stock } });
  revalidatePath("/admin/parts");
}

export async function updateStockAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = Number(formData.get("id"));
  const stock = Math.max(0, Number(formData.get("stock")) || 0);
  await prisma.part.update({ where: { id }, data: { stock } });
  revalidatePath("/admin/parts");
}

// --- Категории техники ---------------------------------------------------
export async function createCategoryAction(formData: FormData) {
  await requireRole("ADMIN");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (name.length < 2) return;
  const exists = await prisma.category.findUnique({ where: { name } });
  if (exists) return;
  await prisma.category.create({ data: { name, description } });
  revalidatePath("/admin/categories");
}
