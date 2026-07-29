"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/formatters";
import { adminCatalogConfigs, type AdminCatalogConfig, type AdminCatalogField, type AdminCatalogKind } from "@/lib/admin/catalog";

type AdminCreateEntityFormProps = {
  kind: AdminCatalogKind;
};

export function AdminCreateEntityForm({ kind }: AdminCreateEntityFormProps) {
  const config = adminCatalogConfigs[kind] as AdminCatalogConfig;
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const payload: Record<string, string> = {};

      formData.forEach((value, key) => {
        payload[key] = typeof value === "string" ? value.trim() : "";
      });

      if (!payload.slug) {
        const source = payload.name || payload.full_name || payload.title || "";
        if (source) {
          payload.slug = slugify(source);
        }
      }

      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind,
          data: payload,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Não foi possível salvar o cadastro.");
      }

      setMessage(result.message ?? config.successMessage);
      formRef.current?.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar o cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-brand-strong p-6 text-white shadow-sm md:p-8">
        <Link href={config.backHref} className="text-sm font-black text-accent hover:text-white">
          {config.backLabel}
        </Link>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-accent">Cadastro administrativo</p>
        <h2 className="mt-2 text-3xl font-black md:text-4xl">{config.title}</h2>
        <p className="mt-3 max-w-3xl text-white/72">{config.description}</p>
        {config.note ? (
          <p className="mt-4 max-w-3xl rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-white/82">
            {config.note}
          </p>
        ) : null}
      </section>

      {message ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <p className="font-black">{message}</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-black">Não foi possível salvar.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : null}

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field: AdminCatalogField) => {
            const spanClass = field.span === 2 ? "md:col-span-2" : "";
            const baseClass = "w-full rounded-2xl border border-line bg-background px-4 py-3 outline-none transition focus:border-brand focus:bg-white";

            return (
              <label key={field.name} className={`flex flex-col gap-2 ${spanClass}`}>
                <span className="text-sm font-black text-foreground">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                {field.helper ? <span className="text-xs leading-5 text-muted">{field.helper}</span> : null}
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    rows={field.rows ?? 4}
                    placeholder={field.placeholder}
                    required={field.required}
                    defaultValue={field.defaultValue}
                    className={`${baseClass} min-h-28 resize-y`}
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    defaultValue={field.defaultValue ?? field.options?.[0]?.value ?? ""}
                    required={field.required}
                    className={baseClass}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    defaultValue={field.defaultValue}
                    className={baseClass}
                  />
                )}
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 font-black text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {config.submitLabel}
          </button>
          <Link href={config.backHref} className="text-sm font-black text-brand hover:text-brand-strong">
            Cancelar e voltar
          </Link>
        </div>
      </form>
    </div>
  );
}
