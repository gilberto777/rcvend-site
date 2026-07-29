"use client";

import { useState } from "react";

type InstitutionalLeadFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  sourceLabel: string;
  defaultMessage?: string;
  showProfile?: boolean;
  showAdvertiseFields?: boolean;
};

export function InstitutionalLeadForm({
  title,
  description,
  submitLabel,
  sourceLabel,
  defaultMessage,
  showProfile = true,
  showAdvertiseFields = false,
}: InstitutionalLeadFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    const form = new FormData(event.currentTarget);
    const profile = String(form.get("profile") ?? "");
    const region = String(form.get("region") ?? "");
    const creci = String(form.get("creci") ?? "");
    const propertyCount = String(form.get("property_count") ?? "");
    const message = String(form.get("message") ?? "");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        message: [
          `Origem: ${sourceLabel}`,
          profile ? `Perfil: ${profile}` : "",
          creci ? `CRECI: ${creci}` : "",
          region ? `Região: ${region}` : "",
          propertyCount ? `Quantidade aproximada de imóveis: ${propertyCount}` : "",
          message ? `Mensagem: ${message}` : "",
        ].filter(Boolean).join("\n"),
      }),
    });

    setStatus(response.ok ? "sent" : "error");
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full min-w-0 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>

      <div className="mt-5 grid min-w-0 gap-3">
        <input name="name" aria-label="Nome" required placeholder="Nome" className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" />
        <input name="phone" aria-label="WhatsApp" required placeholder="WhatsApp" className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" />
        <input name="email" aria-label="E-mail" type="email" placeholder="E-mail" className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" />
        {showProfile && (
          <select name="profile" aria-label="Tipo de perfil" defaultValue="" className="min-w-0 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none focus:border-brand">
            <option value="" disabled>Seu perfil</option>
            <option value="Corretor">Corretor</option>
            <option value="Imobiliária">Imobiliária</option>
            <option value="Construtora ou incorporadora">Construtora ou incorporadora</option>
            <option value="Proprietário">Proprietário</option>
            <option value="Comprador ou locatário">Comprador ou locatário</option>
          </select>
        )}
        {showAdvertiseFields ? <input name="creci" aria-label="CRECI" placeholder="CRECI, se aplicável" className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" /> : null}
        <input name="region" aria-label="Cidade ou região de atuação" placeholder="Cidade ou região de atuação" className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" />
        {showAdvertiseFields ? <input name="property_count" aria-label="Quantidade aproximada de imóveis" type="number" min="1" placeholder="Quantidade aproximada de imóveis" className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand" /> : null}
        <textarea
          name="message"
          aria-label="Mensagem"
          rows={5}
          defaultValue={defaultMessage}
          placeholder="Como podemos ajudar?"
          className="min-w-0 w-full rounded-2xl border border-line px-4 py-3 outline-none focus:border-brand"
        />
        <button disabled={status === "sending"} className="rounded-2xl bg-cta px-5 py-4 font-extrabold text-white shadow-lg shadow-cta/20 transition hover:bg-cta-hover disabled:opacity-60">
          {status === "sending" ? "Enviando..." : submitLabel}
        </button>
        {status === "sent" && <p className="text-sm font-semibold text-brand">Mensagem enviada com sucesso.</p>}
        {status === "error" && <p className="text-sm font-semibold text-red-700">Não foi possível enviar agora.</p>}
      </div>
    </form>
  );
}
