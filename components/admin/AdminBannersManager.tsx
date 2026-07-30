"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, ImagePlus, Loader2, Power, Trash2 } from "lucide-react";
import type { PromotionalBanner } from "@/types/banner";

type BannerResponse = {
  banners?: PromotionalBanner[];
  banner?: PromotionalBanner;
  error?: string;
  message?: string;
};

export function AdminBannersManager() {
  const formRef = useRef<HTMLFormElement>(null);
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBanners() {
    const response = await fetch("/api/admin/banners", { cache: "no-store" });
    const result = (await response.json().catch(() => null)) as BannerResponse | null;
    if (!response.ok || !result?.banners) {
      throw new Error(result?.error ?? "Não foi possível carregar os banners.");
    }
    setBanners(result.banners);
  }

  useEffect(() => {
    let ignore = false;

    fetch("/api/admin/banners", { cache: "no-store" })
      .then(async (response) => {
        const result = (await response.json().catch(() => null)) as BannerResponse | null;
        if (!response.ok || !result?.banners) {
          throw new Error(result?.error ?? "Não foi possível carregar os banners.");
        }
        if (!ignore) setBanners(result.banners);
      })
      .catch((loadError: unknown) => {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os banners.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result = (await response.json().catch(() => null)) as BannerResponse | null;
      if (!response.ok) {
        throw new Error(result?.error ?? "Não foi possível criar o banner.");
      }

      setMessage(result?.message ?? "Banner criado com sucesso.");
      formRef.current?.reset();
      await loadBanners();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível criar o banner.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleBanner(banner: PromotionalBanner) {
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/banners", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: banner.id, is_active: !banner.is_active }),
      });
      const result = (await response.json().catch(() => null)) as BannerResponse | null;
      if (!response.ok) throw new Error(result?.error ?? "Não foi possível alterar o banner.");

      setMessage(banner.is_active ? "Banner desativado." : "Banner ativado.");
      await loadBanners();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Não foi possível alterar o banner.");
    }
  }

  async function deleteBanner(banner: PromotionalBanner) {
    if (!confirm(`Excluir o banner "${banner.title}"?`)) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/admin/banners?id=${encodeURIComponent(banner.id)}`, {
        method: "DELETE",
      });
      const result = (await response.json().catch(() => null)) as BannerResponse | null;
      if (!response.ok) throw new Error(result?.error ?? "Não foi possível excluir o banner.");

      setMessage("Banner excluído.");
      await loadBanners();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Não foi possível excluir o banner.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-5 rounded-3xl bg-brand-strong p-6 text-white shadow-sm md:flex-row md:items-end md:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Comunicação promocional</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Banners</h2>
          <p className="mt-3 max-w-3xl text-white/72">
            Publique campanhas na página inicial, programe o período de exibição e organize a ordem do carrossel.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-5 py-3 font-black text-white transition hover:border-accent hover:text-accent"
        >
          Ver na página inicial
          <ExternalLink className="h-4 w-4" />
        </Link>
      </section>

      {message ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">{message}</p> : null}
      {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800">{error}</p> : null}

      <form ref={formRef} onSubmit={handleSubmit} className="rounded-3xl border border-line bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/8 text-brand">
            <ImagePlus className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-xl font-black">Criar novo banner</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Para melhor resultado, use uma imagem horizontal próxima de 1717×916 px. A versão mobile é opcional.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Título interno" required>
            <input name="title" required placeholder="Ex.: Lançamento exclusivo em São Paulo" className={inputClass} />
          </Field>
          <Field label="Link de destino" required>
            <input name="link_url" required defaultValue="/imoveis?purpose=launch" placeholder="/imoveis/..." className={inputClass} />
          </Field>
          <Field label="Imagem principal" helper="PNG, JPG ou WebP, até 8 MB." required>
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required className={fileClass} />
          </Field>
          <Field label="Imagem para celular" helper="Opcional. Recomendado: formato vertical 4:5.">
            <input name="mobile_image" type="file" accept="image/png,image/jpeg,image/webp" className={fileClass} />
          </Field>
          <Field label="Descrição da imagem" helper="Texto lido por mecanismos de acessibilidade." required span>
            <input name="alt_text" required placeholder="Descreva a promoção de forma objetiva" className={inputClass} />
          </Field>
          <Field label="Início da exibição" helper="Opcional.">
            <input name="starts_at" type="datetime-local" className={inputClass} />
          </Field>
          <Field label="Fim da exibição" helper="Opcional.">
            <input name="ends_at" type="datetime-local" className={inputClass} />
          </Field>
          <Field label="Ordem no carrossel">
            <input name="sort_order" type="number" min="0" defaultValue="0" className={inputClass} />
          </Field>
          <Field label="Situação">
            <select name="is_active" defaultValue="true" className={inputClass}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Field>
        </div>

        <button
          disabled={saving}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 font-black text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {saving ? "Salvando..." : "Criar banner"}
        </button>
      </form>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Campanhas cadastradas</p>
            <h3 className="mt-1 text-2xl font-black">{banners.length} {banners.length === 1 ? "banner" : "banners"}</h3>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-muted">Carregando banners...</p>
        ) : banners.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">Nenhum banner cadastrado.</p>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {banners.map((banner) => (
              <article key={banner.id} className="overflow-hidden rounded-2xl border border-line bg-background">
                <div className="relative aspect-[1717/916] bg-brand-strong">
                  <Image src={banner.image_url} alt={banner.alt_text} fill sizes="(max-width: 1280px) 100vw, 50vw" className="object-contain" />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="font-black">{banner.title}</h4>
                      <p className="mt-1 text-xs text-muted">Ordem {banner.sort_order} · {banner.is_active ? "Ativo" : "Inativo"}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${banner.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                      {banner.is_active ? "Publicado" : "Oculto"}
                    </span>
                  </div>
                  <p className="mt-3 truncate text-xs text-muted" title={banner.link_url}>{banner.link_url}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleBanner(banner)}
                      className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-black text-brand hover:border-brand"
                    >
                      <Power className="h-4 w-4" />
                      {banner.is_active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteBanner(banner)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-black text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const inputClass = "w-full rounded-2xl border border-line bg-background px-4 py-3 outline-none transition focus:border-brand focus:bg-white";
const fileClass = "w-full rounded-2xl border border-dashed border-brand/30 bg-brand/5 px-4 py-3 text-sm file:mr-4 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2 file:font-black file:text-white";

function Field({
  label,
  helper,
  required,
  span,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  span?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-2 ${span ? "md:col-span-2" : ""}`}>
      <span className="text-sm font-black">{label}{required ? " *" : ""}</span>
      {helper ? <span className="text-xs leading-5 text-muted">{helper}</span> : null}
      {children}
    </label>
  );
}
