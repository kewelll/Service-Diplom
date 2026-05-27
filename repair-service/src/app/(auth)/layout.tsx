import Link from "next/link";
import Brand from "@/components/Brand";

// Минимальная оболочка для страниц входа и регистрации.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container-page flex h-16 items-center">
        <Brand />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-8">{children}</div>
      <footer className="container-page py-6 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          ← Вернуться на главную
        </Link>
      </footer>
    </div>
  );
}
