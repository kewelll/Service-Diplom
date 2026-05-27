import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPartAction, updateStockAction } from "@/actions/admin";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export default async function AdminPartsPage() {
  await requireRole("ADMIN");
  const parts = await prisma.part.findMany({ orderBy: { name: "asc" } });
  const lowStock = parts.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Склад запчастей"
        subtitle={`Позиций: ${parts.length}${lowStock ? `, заканчивается: ${lowStock}` : ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Артикул</th>
                  <th className="text-right">Цена</th>
                  <th>Остаток</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium text-slate-900">{p.name}</td>
                    <td className="text-slate-500">{p.sku ?? "—"}</td>
                    <td className="text-right font-medium">{money(p.price)}</td>
                    <td>
                      <form action={updateStockAction} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="stock"
                          type="number"
                          min={0}
                          defaultValue={p.stock}
                          className={`input w-20 py-1 ${p.stock <= 5 ? "border-rose-300 text-rose-700" : ""}`}
                        />
                        <button className="btn-secondary px-2 py-1 text-xs" type="submit">
                          ✓
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
            <h2 className="mb-3 font-semibold text-slate-900">Добавить запчасть</h2>
            <form action={createPartAction} className="space-y-3">
              <div>
                <label className="label">Наименование</label>
                <input name="name" className="input" required />
              </div>
              <div>
                <label className="label">Артикул</label>
                <input name="sku" className="input" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label">Цена, ₽</label>
                  <input name="price" type="number" className="input" defaultValue={0} />
                </div>
                <div>
                  <label className="label">Остаток</label>
                  <input name="stock" type="number" className="input" defaultValue={0} />
                </div>
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
