"use client";

import Link from "next/link";
import { useState } from "react";
import { Send } from "lucide-react";

type LeadFormProps = {
  propertyId: string;
  propertyTitle: string;
};

const quickQuestions = [
  "Este imóvel ainda está disponível?",
  "Posso agendar uma visita?",
  "Qual o valor do condomínio?",
  "Aceita financiamento?",
  "Tem outras unidades parecidas?",
];

export function LeadForm({ propertyId, propertyTitle }: LeadFormProps) {
  const initialMessage = `Olá! Quero receber mais informações sobre ${propertyTitle}.`;
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState(initialMessage);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        property_id: propertyId,
        property_title: propertyTitle,
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        message,
      }),
    });

    setStatus(response.ok ? "sent" : "error");
    if (response.ok) {
      event.currentTarget.reset();
      setMessage(initialMessage);
    }
  }

  return (
    <form id="contato" onSubmit={handleSubmit} className="scroll-mt-28 rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_rgba(10,45,42,0.12)] sm:p-6">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-cta">Atendimento rápido</p>
      <h2 className="mt-2 text-2xl font-extrabold">Tenho interesse</h2>
      <p className="mt-2 text-sm leading-6 text-muted">Envie sua mensagem e receba atendimento sobre este imóvel.</p>

      <div className="mt-5 flex flex-wrap gap-2" aria-label="Perguntas rápidas">
        {quickQuestions.map((question) => (
          <button
            key={question}
            type="button"
            onClick={() => setMessage(question)}
            className="rounded-full border border-cta/45 bg-cta/5 px-3 py-2 text-left text-xs font-bold text-cta-hover transition hover:border-cta hover:bg-cta hover:text-white"
          >
            {question}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="sr-only">E-mail</span>
          <input name="email" type="email" placeholder="E-mail" className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none transition focus:border-brand" />
        </label>
        <label>
          <span className="sr-only">Nome</span>
          <input name="name" required placeholder="Nome" className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none transition focus:border-brand" />
        </label>
        <label>
          <span className="sr-only">WhatsApp</span>
          <input name="phone" required placeholder="WhatsApp" className="w-full rounded-2xl border border-line px-4 py-3.5 outline-none transition focus:border-brand" />
        </label>
        <label className="sm:col-span-2">
          <span className="sr-only">Mensagem</span>
          <textarea
            name="message"
            rows={4}
            maxLength={500}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full resize-none rounded-2xl border border-line px-4 py-3.5 outline-none transition focus:border-brand"
          />
          <span className="mt-1 block text-right text-xs text-muted">{message.length}/500</span>
        </label>
        <button disabled={status === "sending"} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-cta px-5 py-4 font-extrabold text-white shadow-lg shadow-cta/20 transition hover:bg-cta-hover disabled:opacity-60 sm:col-span-2">
          {status === "sending" ? "Enviando..." : "Enviar interesse"}
          <Send className="h-4 w-4" />
        </button>
        <p className="text-xs leading-5 text-muted sm:col-span-2">
          Ao enviar, você concorda com nossa <Link href="/politica-de-privacidade" className="font-bold text-brand underline underline-offset-2">Política de Privacidade</Link>.
        </p>
        {status === "sent" ? <p className="text-sm font-semibold text-brand sm:col-span-2">Interesse enviado com sucesso.</p> : null}
        {status === "error" ? <p className="text-sm font-semibold text-red-700 sm:col-span-2">Não foi possível enviar agora.</p> : null}
      </div>
    </form>
  );
}
