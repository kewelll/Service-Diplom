import Link from "next/link";
import Brand from "./Brand";
import { getCurrentUser } from "@/lib/auth";

// Верхняя панель публичных страниц (лендинг, услуги).
export default async function PublicHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Brand />

        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/" className="text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-slate-950">
            Главная
          </Link>
          <Link href="/services" className="text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-slate-950">
            Услуги и цены
          </Link>
          <Link href="/orders/new" className="text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-slate-950">
            Заявка
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Личный кабинет
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Войти
              </Link>
              <Link href="/register" className="btn-primary">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
