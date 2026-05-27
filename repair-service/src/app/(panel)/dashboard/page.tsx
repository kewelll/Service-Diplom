import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

// Точка входа после авторизации: перенаправление на рабочее место по роли.
export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "MASTER") redirect("/master");
  redirect("/orders");
}
