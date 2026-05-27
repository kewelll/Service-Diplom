import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markNotificationsReadAction } from "@/actions/user";
import { dateTime } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Уведомления" subtitle="События по вашим заказам">
        {hasUnread && (
          <form action={markNotificationsReadAction}>
            <button className="btn-secondary" type="submit">
              Отметить все прочитанными
            </button>
          </form>
        )}
      </PageHeader>

      {notifications.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">Уведомлений пока нет.</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? "#"}
              className={`card flex items-start gap-3 p-4 hover:border-slate-400 ${
                n.isRead ? "" : "border-slate-300 bg-slate-100/40"
              }`}
            >
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  n.isRead ? "bg-slate-300" : "bg-slate-900"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-slate-800">{n.text}</p>
                <p className="mt-1 text-xs text-slate-400">{dateTime(n.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
