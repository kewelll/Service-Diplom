import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import Brand from "@/components/Brand";

// Оболочка публичной части сайта.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>

      <footer className="bg-slate-950 text-slate-400">
        <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Brand light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Сервисный центр по ремонту компьютеров и оргтехники. Цифровая платформа обслуживания
              с полным контролем заказа.
            </p>
          </div>
          <FooterCol
            title="Сервис"
            links={[
              ["Услуги и цены", "/services"],
              ["Оставить заявку", "/orders/new"],
              ["Личный кабинет", "/login"],
            ]}
          />
          <FooterCol
            title="Компания"
            links={[
              ["О сервисе", "/"],
              ["Гарантия", "/"],
              ["Контакты", "/"],
            ]}
          />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Контакты</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="text-white">+7 (3843) 50-10-00</li>
              <li>info@kompservice.ru</li>
              <li>г. Новокузнецк, ул. Кирова, 1</li>
              <li>Ежедневно 9:00–20:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800">
          <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs sm:flex-row">
            <span>© 2026 Сервисный центр «КомпСервис». Все права защищены.</span>
            <span>Выпускная квалификационная работа</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-white">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
