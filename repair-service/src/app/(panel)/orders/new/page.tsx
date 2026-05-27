import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOrderAction } from "@/actions/orders";
import { PageHeader } from "@/components/ui";

// Форма создания новой заявки на ремонт.
export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("CLIENT");
  const { error } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Новая заявка на ремонт"
        subtitle="Опишите устройство и неисправность — мастер свяжется с вами после диагностики."
      />

      <form action={createOrderAction} className="card space-y-4 p-6">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Заполните тип устройства и описание неисправности.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="categoryId">
              Категория техники
            </label>
            <select id="categoryId" name="categoryId" className="select" defaultValue="">
              <option value="">— выберите —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="deviceType">
              Тип устройства *
            </label>
            <input id="deviceType" name="deviceType" className="input" required
              placeholder="Ноутбук, ПК, принтер…" />
          </div>
          <div>
            <label className="label" htmlFor="deviceBrand">
              Производитель
            </label>
            <input id="deviceBrand" name="deviceBrand" className="input" placeholder="ASUS, HP…" />
          </div>
          <div>
            <label className="label" htmlFor="deviceModel">
              Модель
            </label>
            <input id="deviceModel" name="deviceModel" className="input" placeholder="VivoBook X512" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="serialNumber">
            Серийный номер
          </label>
          <input id="serialNumber" name="serialNumber" className="input" placeholder="необязательно" />
        </div>

        <div>
          <label className="label" htmlFor="problem">
            Описание неисправности *
          </label>
          <textarea id="problem" name="problem" className="textarea" rows={5} required
            placeholder="Опишите, что случилось с устройством и при каких обстоятельствах." />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Отправить заявку
          </button>
          <a href="/orders" className="btn-secondary">
            Отмена
          </a>
        </div>
      </form>
    </div>
  );
}
