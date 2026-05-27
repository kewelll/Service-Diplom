"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="container-page flex justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Вход в систему</h1>
        <p className="mt-1 text-sm text-slate-500">
          Войдите, чтобы оставлять заявки и отслеживать ремонт.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Электронная почта
            </label>
            <input id="email" name="email" type="email" className="input" required
              placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Пароль
            </label>
            <input id="password" name="password" type="password" className="input" required
              autoComplete="current-password" />
          </div>

          {state?.error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? "Вход…" : "Войти"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-slate-900 hover:underline">
            Зарегистрироваться
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Демонстрационные учётные записи:</p>
          <p>Администратор — admin@remont.ru / admin123</p>
          <p>Мастер — master@remont.ru / master123</p>
          <p>Клиент — client@remont.ru / client123</p>
        </div>
      </div>
    </div>
  );
}
