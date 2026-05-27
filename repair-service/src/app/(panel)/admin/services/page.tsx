import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createServiceAction, toggleServiceAction } from "@/actions/admin";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export default async function AdminServicesPage() {
  await requireRole("ADMIN");
  const [services, categories] = await Promise.all([
    prisma.service.findMany({ include: { category: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Услуги" subtitle="Прайс-лист сервисного центра" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Категория</th>
                  <th className="text-right">Цена</th>
                  <th className="text-right">Время</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id} className={s.isActive ? "" : "opacity-50"}>
                    <td className="font-medium text-slate-900">{s.name}</td>
                    <td className="text-slate-600">{s.category?.name ?? "—"}</td>
                    <td className="text-right font-medium">{money(s.price)}</td>
                    <td className="text-right text-slate-600">{s.durationH} ч</td>
                    <td className="text-right">
                      <form action={toggleServiceAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <button className="text-xs font-medium text-slate-900 hover:underline" type="submit">
                          {s.isActive ? "Скрыть" : "Включить"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">Добавить услугу</h2>
            <form action={createServiceAction} className="space-y-3">
              <div>
                <label className="label">Название</label>
                <input name="name" className="input" required />
              </div>
              <div>
                <label className="label">Категория</label>
                <select name="categoryId" className="select" defaultValue="">
                  <option value="">— без категории —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Цена, ₽</label>
                  <input name="price" type="number" className="input" defaultValue={0} />
                </div>
                <div>
                  <label className="label">Время, ч</label>
                  <input name="durationH" type="number" className="input" defaultValue={1} />
                </div>
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
