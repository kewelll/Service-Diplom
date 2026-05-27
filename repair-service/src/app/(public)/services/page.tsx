import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { money } from "@/lib/format";
import { PageHeader } from "@/components/ui";

// Каталог услуг (прайс-лист) с поиском и фильтрацией по категориям.
// Фильтрация по подстроке выполняется в JavaScript, так как LIKE/LOWER в
// SQLite не учитывают регистр кириллических символов.
export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string }>;
}) {
  const { q = "", cat = "" } = await searchParams;
  const [categories, allServices] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const query = q.trim().toLowerCase();
  const services = allServices.filter((s) => {
    if (cat && String(s.categoryId) !== cat) return false;
    if (query) {
      const hay = `${s.name} ${s.description ?? ""} ${s.category?.name ?? ""}`.toLowerCase();
      if (!query.split(/\s+/).every((t) => hay.includes(t))) return false;
    }
    return true;
  });

  return (
    <div className="container-page py-10">
      <PageHeader
        title="Услуги и цены"
        subtitle="Прайс-лист сервисного центра. Точная стоимость определяется после диагностики."
      />

      {/* Поиск */}
      <form className="mb-4 flex gap-2" action="/services">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input
          name="q"
          defaultValue={q}
          className="input"
          placeholder="Поиск услуги: например, «замена матрицы» или «чистка»"
        />
        <button className="btn-primary" type="submit">
          Найти
        </button>
      </form>

      {/* Фильтр по категориям */}
      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip href={q ? `/services?q=${encodeURIComponent(q)}` : "/services"} active={!cat}>
          Все категории
        </FilterChip>
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            href={`/services?cat=${c.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            active={cat === String(c.id)}
          >
            {c.name}
          </FilterChip>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          По вашему запросу услуги не найдены.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table-base">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Категория</th>
                <th className="text-right">Время, ч</th>
                <th className="text-right">Стоимость работ</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="font-medium text-slate-900">{s.name}</div>
                    {s.description && (
                      <div className="text-xs text-slate-500">{s.description}</div>
                    )}
                  </td>
                  <td className="text-slate-600">{s.category?.name ?? "—"}</td>
                  <td className="text-right text-slate-600">{s.durationH}</td>
                  <td className="text-right font-semibold text-slate-900">{money(s.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-300 bg-slate-100 p-5">
        <p className="text-sm text-slate-950">
          Цены указаны за работы без учёта стоимости запчастей. Чтобы заказать ремонт,{" "}
          <Link href="/orders/new" className="font-semibold underline">
            оставьте заявку
          </Link>{" "}
          — мастер проведёт диагностику и согласует итоговую стоимость.
        </p>
      </div>
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`badge ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}
    </Link>
  );
}
