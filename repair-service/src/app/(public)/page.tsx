import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Stars } from "@/components/ui";

export default async function HomePage() {
  const [ordersCount, mastersCount, servicesCount, categories, reviews, avg] =
    await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: "MASTER" } }),
      prisma.service.count({ where: { isActive: true } }),
      prisma.category.findMany({ include: { _count: { select: { services: true } } } }),
      prisma.review.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { client: true, order: true },
      }),
      prisma.review.aggregate({ _avg: { rating: true } }),
    ]);
  const rating = (avg._avg.rating ?? 5).toFixed(1);

  // Проблемы, с которыми сталкивается клиент (иконки-«опасности»).
  const problems: [string, string][] = [
    ["M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01", "Потеря важных данных"],
    ["M12 6v6l4 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "Потеря времени на ремонт"],
    ["M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", "Непредвиденные траты"],
    ["M18 6 6 18M6 6l12 12", "Отсутствие гарантии"],
  ];

  // Преимущества обращения в сервис (иконки-«плюсы»).
  const benefits: [string, string][] = [
    ["M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3", "Профессиональная диагностика на специализированном оборудовании"],
    ["M12 2 4 5v6c0 5 3.4 7.8 8 9 4.6-1.2 8-4 8-9V5l-8-3z", "Официальная гарантия на все виды работ — до 30 дней"],
    ["M20 6 9 17l-5-5", "Прозрачная стоимость: согласование сметы до начала ремонта"],
    ["M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "Уведомления о каждом этапе в личном кабинете"],
    ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "Сохранение истории обслуживания вашей техники"],
    ["M13 2 3 14h9l-1 8 10-12h-9l1-8z", "Срочный ремонт и приоритетная очередь по запросу"],
  ];

  const packages: { name: string; price: string; features: string[]; popular?: boolean }[] = [
    {
      name: "Экспресс-диагностика",
      price: "500 ₽",
      features: ["Выявление неисправности", "Заключение мастера", "Оценка стоимости ремонта", "Срок — 1 рабочий день"],
    },
    {
      name: "Стандартный ремонт",
      price: "от 1 500 ₽",
      popular: true,
      features: ["Комплексная диагностика", "Чистка и профилактика", "Замена комплектующих", "Гарантия 14 дней", "Уведомления о статусе"],
    },
    {
      name: "Премиум-обслуживание",
      price: "от 3 000 ₽",
      features: ["Всё из стандартного пакета", "Приоритетная очередь", "Доставка техники курьером", "Расширенная гарантия 30 дней", "Перенос и резервирование данных"],
    },
  ];

  const steps = [
    "Оставьте заявку на сайте или принесите технику в сервис",
    "Мастер проводит диагностику и фиксирует заключение",
    "Согласуем перечень работ и стоимость до начала ремонта",
    "Выполняем ремонт и информируем о каждом этапе",
    "Уведомляем о готовности — забираете исправную технику",
  ];

  return (
    <div>
      {/* ГЕРОЙ */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-16 text-center md:py-20">
          <span className="eyebrow">
            <span className="h-2 w-2 rounded-full bg-accent" /> Сервисное обслуживание · г. Новокузнецк
          </span>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-slate-950 md:text-6xl">
            Забота о вашей <span className="bg-accent px-2 text-slate-950">технике</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Цифровая платформа сервисного центра по ремонту компьютеров и оргтехники: онлайн-заявки,
            прозрачное отслеживание ремонта и согласование стоимости в личном кабинете.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/orders/new" className="btn-primary px-6 py-3 text-base">
              Оставить заявку
            </Link>
            <Link href="/services" className="btn-dark px-6 py-3 text-base">
              Услуги и цены
            </Link>
          </div>
        </div>

        {/* Превью продукта + проблемы */}
        <div className="container-page grid items-center gap-8 pb-16 md:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow !text-slate-400">Заказ</div>
                <div className="text-lg font-extrabold text-slate-950">№ 2026-000005</div>
              </div>
              <span className="badge border-emerald-300 bg-emerald-100 text-emerald-800">Готов к выдаче</span>
            </div>
            <div className="mt-5 flex items-center gap-1.5">
              {["Заявка", "Диагностика", "Ремонт", "Готов"].map((s) => (
                <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="h-1.5 w-full rounded-full bg-accent" />
                  <span className="text-[10px] font-medium text-slate-400">{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              {[["Замена аккумулятора", "1 000 ₽"], ["Диагностика", "500 ₽"], ["Аккумулятор ноутбука", "3 200 ₽"]].map(([n, p]) => (
                <div key={n} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-700">{n}</span>
                  <span className="font-bold text-slate-900">{p}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">Итого</span>
              <span className="text-2xl font-extrabold text-slate-950">4 700 ₽</span>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-slate-950">
              Что грозит технике без сервиса
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {problems.map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
                  </span>
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ПОЧЕМУ МЫ */}
      <section className="container-page py-16 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Преимущества</span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase leading-tight tracking-tight text-slate-950 md:text-4xl">
              Почему доверяют ремонт нам
            </h2>
            <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
              {benefits.map(([icon, text]) => (
                <div key={text} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-slate-950">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
                  </span>
                  <span className="text-sm leading-relaxed text-slate-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-hover overflow-hidden p-0">
            <div className="bg-slate-950 px-6 py-5">
              <div className="eyebrow !text-slate-500">Личный кабинет</div>
              <div className="mt-1 text-xl font-extrabold text-white">Полный контроль ремонта</div>
            </div>
            <div className="space-y-3 p-6">
              {[
                ["Онлайн-заявки", "без звонков и очередей"],
                ["Статус в реальном времени", "от приёмки до выдачи"],
                ["Согласование сметы", "до начала работ"],
                ["История обслуживания", "по каждому устройству"],
              ].map(([t, d]) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-slate-950">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  <span className="text-sm">
                    <span className="font-bold text-slate-900">{t}</span>{" "}
                    <span className="text-slate-500">— {d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ПАКЕТЫ */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Тарифы</span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-slate-950 md:text-4xl">
              Пакеты обслуживания
            </h2>
            <p className="mt-4 text-slate-600">
              Выберите подходящий уровень обслуживания. Точная стоимость определяется после диагностики.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {packages.map((p) => (
              <div
                key={p.name}
                className={`card relative flex flex-col p-7 ${p.popular ? "ring-2 ring-accent" : ""}`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">
                    Популярный
                  </span>
                )}
                <h3 className="text-lg font-extrabold uppercase tracking-tight text-slate-950">{p.name}</h3>
                <div className="mt-3 text-3xl font-extrabold text-slate-950">{p.price}</div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg className="mt-0.5 shrink-0 text-slate-950" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/orders/new" className={`${p.popular ? "btn-primary" : "btn-dark"} mt-7`}>
                  Оставить заявку
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* СТАТИСТИКА (тёмная полоса) */}
      <section className="bg-slate-950 py-14 text-white">
        <div className="container-page grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {[
            [`${ordersCount}+`, "выполнено заказов"],
            [String(mastersCount), "сертифицированных мастеров"],
            [`${rating}★`, "средняя оценка клиентов"],
            ["30 дней", "гарантия на ремонт"],
          ].map(([v, l]) => (
            <div key={l}>
              <div className="text-4xl font-extrabold text-accent md:text-5xl">{v}</div>
              <div className="mt-2 text-sm text-slate-400">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ЭТАПЫ */}
      <section className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Как это работает</span>
          <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-slate-950 md:text-4xl">
            Этапы оформления заявки
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-5">
          {steps.map((text, i) => (
            <div key={i} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl font-extrabold text-slate-950">
                {i + 1}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* КАТЕГОРИИ */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Техника</span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-slate-950 md:text-4xl">
              Что мы обслуживаем
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.id} href="/services" className="card card-hover flex items-center justify-between p-5">
                <div>
                  <h3 className="font-extrabold text-slate-950">{c.name}</h3>
                  <p className="mt-0.5 text-sm text-slate-500">{c.description}</p>
                </div>
                <span className="badge border-slate-300 bg-white text-slate-700">{c._count.services} услуг</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ОТЗЫВЫ */}
      {reviews.length > 0 && (
        <section className="container-page py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Отзывы</span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-slate-950 md:text-4xl">
              Что говорят клиенты
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <div key={r.id} className="card p-6">
                <Stars rating={r.rating} />
                <p className="mt-3 leading-relaxed text-slate-700">«{r.text}»</p>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {r.client.fullName.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{r.client.fullName}</div>
                    <div className="text-xs text-slate-400">заказ № {r.order.number}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-8 py-14 text-center">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold uppercase tracking-tight text-white md:text-4xl">
            Готовы починить технику?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-slate-400">
            Оставьте заявку онлайн — мастер проведёт диагностику и согласует стоимость работ.
          </p>
          <Link href="/orders/new" className="btn-primary relative mt-8 px-7 py-3 text-base">
            Оставить заявку
          </Link>
        </div>
      </section>
    </div>
  );
}
