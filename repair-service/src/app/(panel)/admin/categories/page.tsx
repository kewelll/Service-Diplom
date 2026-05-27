import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategoryAction } from "@/actions/admin";
import { PageHeader } from "@/components/ui";

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { services: true, orders: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Категории техники" subtitle={`Всего категорий: ${categories.length}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Описание</th>
                  <th className="text-right">Услуг</th>
                  <th className="text-right">Заказов</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-slate-900">{c.name}</td>
                    <td className="text-slate-600">{c.description ?? "—"}</td>
                    <td className="text-right text-slate-600">{c._count.services}</td>
                    <td className="text-right text-slate-600">{c._count.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Добавить категорию</h2>
            <form action={createCategoryAction} className="space-y-3">
              <div>
                <label className="label">Название</label>
                <input name="name" className="input" required />
              </div>
              <div>
                <label className="label">Описание</label>
                <textarea name="description" className="textarea" rows={2} />
              </div>
              <button className="btn-primary w-full" type="submit">
                Добавить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
