import Link from "next/link";
import { CheckCircle2, Plus, Search } from "lucide-react";

type AdminPlaceholderProps = {
  title: string;
  description: string;
  entityLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  fields?: string[];
};

export function AdminPlaceholder({ title, description, entityLabel = "cadastro", actionHref, actionLabel, fields = [] }: AdminPlaceholderProps) {
  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-brand-strong p-6 text-white shadow-sm md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Gestão e aprovação</p>
          <h2 className="mt-2 text-3xl font-black">{title}</h2>
          <p className="mt-2 max-w-2xl text-white/70">{description}</p>
        </div>
        {actionHref ? (
          <Link href={actionHref} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-black text-brand-strong">
            <Plus className="h-5 w-5" />
            {actionLabel ?? `Novo ${entityLabel}`}
          </Link>
        ) : (
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-black text-brand-strong">
            <Plus className="h-5 w-5" /> Novo {entityLabel}
          </button>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-white p-4 shadow-sm">
        <label className="flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3">
          <Search className="h-5 w-5 text-brand" />
          <input aria-label={`Buscar ${title.toLowerCase()}`} placeholder="Buscar por nome, cidade ou contato" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
      </section>

      <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
        <div className="grid gap-3 border-b border-line bg-background px-6 py-4 text-xs font-black uppercase tracking-wide text-muted md:grid-cols-[1.2fr_1fr_1fr_140px]">
          {(fields.length ? fields.slice(0, 3) : ["Nome", "Contato", "Cidade"]).map((field) => <span key={field}>{field}</span>)}
          <span>Status</span>
        </div>
        <div className="px-6 py-14 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-brand/45" />
          <h3 className="mt-4 text-xl font-black">Nenhum cadastro por aqui ainda</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">Os novos registros aparecerão nesta lista com status Pendente, Aprovado ou Bloqueado.</p>
          {fields.length ? (
            <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
              {fields.map((field) => <span key={field} className="rounded-full border border-line bg-background px-3 py-2 text-xs font-bold text-muted">{field}</span>)}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
