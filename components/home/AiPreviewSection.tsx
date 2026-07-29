import Link from "next/link";
import { Bot, CheckCircle2, Sparkles } from "lucide-react";

const aiSignals = ["Perfil do comprador", "Faixa de preço", "Região desejada", "Objetivo de compra"];

export function AiPreviewSection() {
  return (
    <section className="bg-white py-16">
      <div className="container-page grid gap-8 rounded-3xl border border-line bg-background p-8 md:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Atendimento inteligente em breve</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">Uma busca assistida para encontrar imóveis com mais contexto.</h2>
          <p className="mt-4 leading-8 text-muted">
            Futuramente, o RC Vend poderá ajudar o cliente a encontrar oportunidades com base em perfil, faixa de preço, região e objetivo. Ainda não é um chatbot: esta é uma preparação visual para a evolução da experiência.
          </p>
          <Link href="/imoveis" className="mt-6 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-4 font-extrabold text-white transition hover:bg-cta-hover">
            Começar pela busca atual
            <Sparkles className="h-5 w-5" />
          </Link>
        </div>
        <div className="rounded-3xl bg-brand-strong p-6 text-white shadow-xl shadow-brand-strong/10">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-brand-strong">
              <Bot className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-xl font-black">Assistente Vision</h3>
              <p className="text-sm text-white/62">Conceito para etapa futura</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {aiSignals.map((signal) => (
              <p key={signal} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-bold">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                {signal}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
