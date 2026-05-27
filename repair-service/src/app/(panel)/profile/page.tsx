import { requireUser } from "@/lib/auth";
import { updateProfileAction } from "@/actions/user";
import { ROLE_LABELS } from "@/lib/format";
import { PageHeader } from "@/components/ui";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Профиль" subtitle="Личные данные учётной записи" />

      <div className="card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-900">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-900">{user.fullName}</div>
            <span className="badge border-slate-300 bg-slate-100 text-slate-900">
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>

        <form action={updateProfileAction} className="space-y-4">
          <div>
            <label className="label" htmlFor="fullName">
              ФИО
            </label>
            <input id="fullName" name="fullName" className="input" defaultValue={user.fullName} required />
          </div>
          <div>
            <label className="label">Электронная почта</label>
            <input className="input bg-slate-50" value={user.email} disabled />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Телефон
            </label>
            <input id="phone" name="phone" className="input" defaultValue={user.phone ?? ""} />
          </div>
          <button type="submit" className="btn-primary">
            Сохранить изменения
          </button>
        </form>
      </div>
    </div>
  );
}
