import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const SESSION_COOKIE = "rs_session";
const SECRET = process.env.SESSION_SECRET ?? "dev-secret";

// --- Хеширование паролей -------------------------------------------------
// Пароли никогда не хранятся в открытом виде. Используется алгоритм scrypt
// со случайной солью; в базе данных сохраняется строка вида "соль:хеш".
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  // Сравнение в постоянном времени для защиты от атак по времени.
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(candidate, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// --- Сессии --------------------------------------------------------------
// Идентификатор сессии хранится в подписанной HttpOnly-cookie в формате
// "userId.подпись", где подпись = HMAC-SHA256(userId, SESSION_SECRET).
function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export async function createSession(userId: number): Promise<void> {
  const value = String(userId);
  const token = `${value}.${sign(value)}`;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 дней
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export type SessionUser = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phone: string | null;
};

// Возвращает текущего аутентифицированного пользователя или null.
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [value, signature] = token.split(".");
  if (!value || !signature) return null;
  if (sign(value) !== signature) return null; // подпись не совпала
  const id = Number(value);
  if (!Number.isInteger(id)) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, role: true, phone: true },
  });
  return user;
}

// Требует аутентификации; иначе перенаправляет на страницу входа.
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Требует наличия одной из перечисленных ролей (проверка полномочий).
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}
