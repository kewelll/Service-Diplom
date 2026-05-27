"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export type AuthState = { error?: string } | undefined;

// Регистрация нового пользователя (по умолчанию — роль «клиент»).
export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");

  if (fullName.length < 3) return { error: "Укажите фамилию, имя и отчество." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { error: "Некорректный адрес электронной почты." };
  if (password.length < 6)
    return { error: "Пароль должен содержать не менее 6 символов." };
  if (password !== password2) return { error: "Пароли не совпадают." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Пользователь с таким e-mail уже зарегистрирован." };

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone: phone || null,
      passwordHash: hashPassword(password),
      role: "CLIENT",
    },
  });
  await createSession(user.id);
  redirect("/dashboard");
}

// Вход по e-mail и паролю.
export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Неверный e-mail или пароль." };
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
