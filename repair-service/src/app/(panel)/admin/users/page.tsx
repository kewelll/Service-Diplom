import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setUserRoleAction } from "@/actions/admin";
import { dateOnly, ROLE_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export default async function AdminUsersPage() {
  const me = await requireRole("ADMIN");
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    include: {
      _count: { select: { clientOrders: true, masterOrders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Пользователи" subtitle={`Всего учётных записей: ${users.length}`} />

      <div className="card overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>E-mail</th>
              <th>Телефон</th>
              <th>Заказов</th>
              <th>Зарегистрирован</th>
              <th>Роль</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium text-slate-900">{u.fullName}</td>
                <td className="text-slate-600">{u.email}</td>
                <td className="text-slate-600">{u.phone ?? "—"}</td>
                <td className="text-slate-600">
                  {u.role === "MASTER" ? u._count.masterOrders : u._count.clientOrders}
                </td>
                <td className="text-slate-600">{dateOnly(u.createdAt)}</td>
                <td>
                  {u.id === me.id ? (
                    <span className="badge border-slate-300 bg-slate-100 text-slate-600">
                      {ROLE_LABELS[u.role]} (вы)
                    </span>
                  ) : (
                    <form action={setUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={u.id} />
                      <select name="role" defaultValue={u.role} className="select max-w-40 py-1 text-xs">
                        <option value="CLIENT">Клиент</option>
                        <option value="MASTER">Мастер</option>
                        <option value="ADMIN">Администратор</option>
                      </select>
                      <button className="btn-secondary px-2 py-1 text-xs" type="submit">
                        Сменить
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
