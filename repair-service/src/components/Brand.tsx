import Link from "next/link";

// Логотип сервисного центра в фирменном стиле (лаймовая метка + жирный вордмарк).
export default function Brand({
  href = "/",
  subtitle = true,
  light = false,
}: {
  href?: string;
  subtitle?: boolean;
  light?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.png"
        alt="КомпСервис"
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-black/10"
      />
      <span className="flex flex-col leading-none">
        <span className={`text-[15px] font-extrabold uppercase tracking-tight ${light ? "text-white" : "text-slate-950"}`}>
          Комп<span className="text-slate-400">Сервис</span>
        </span>
        {subtitle && (
          <span className="mt-1 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Сервисный центр
          </span>
        )}
      </span>
    </Link>
  );
}
