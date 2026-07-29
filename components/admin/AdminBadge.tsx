export function AdminBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: string }) {
  const toneClass =
    tone === "brand"
      ? "border-brand/15 bg-brand/8 text-brand"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
        : tone === "warning"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : tone === "danger"
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${toneClass}`}>
      {children}
    </span>
  );
}
