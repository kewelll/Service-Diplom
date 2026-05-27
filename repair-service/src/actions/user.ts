"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Обновление данных профиля текущего пользователя.
export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (fullName.length < 3) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { fullName, phone: phone || null },
  });
  revalidatePath("/profile");
}

// Отметить все уведомления пользователя как прочитанные.
export async function markNotificationsReadAction() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/notifications");
}
