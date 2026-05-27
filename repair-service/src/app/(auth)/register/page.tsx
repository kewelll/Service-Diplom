"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction } from "@/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <div className="container-page flex justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Регистрация</h1>
        <p className="mt-1 text-sm text-slate-500">
          Создайте личный кабинет клиента сервисного центра.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="fullName">
              ФИО
            </label>
            <input id="fullName" name="fullName" className="input" required
              placeholder="Иванов Иван Иванович" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Электронная почта
            </label>
            <input id="email" name="email" type="email" className="input" required
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Телефон
            </label>
            <input id="phone" name="phone" className="input" placeholder="+7 (___) ___-__-__" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="password">
                Пароль
              </label>
              <input id="password" name="password" type="password" className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="password2">
                Повтор пароля
              </label>
              <input id="password2" name="password2" type="password" className="input" required />
            </div>
          </div>

          {state?.error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={pending}>
            {pending ? "Регистрация…" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
