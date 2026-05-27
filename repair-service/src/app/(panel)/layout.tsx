import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PanelShell from "@/components/PanelShell";

// Оболочка личного кабинета (боковое меню + топбар). Требует авторизации.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const unread = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return (
    <PanelShell
      user={{ fullName: user.fullName, role: user.role, email: user.email }}
      unread={unread}
    >
      {children}
    </PanelShell>
  );
}
