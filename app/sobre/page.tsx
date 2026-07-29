import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CheckCircle2, MapPinned, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Sobre o RC Vend",
  description: "Conheca o RC Vend, portal imobiliario inteligente para buscar, comparar e encontrar oportunidades com mais clareza.",
  alternates: { canonical: "/sobre" },
};

const pillars = [
  { icon: Building2, title: "Portal imobiliário", text: "Busca, listagem, lançamentos, prontos e conteúdo para apoiar a decisão." },
  { icon: MapPinned, title: "Foco em bairros", text: "Organização por regiões estratégicas para aproximar imóvel, rotina e objetivo." },
  { icon: ShieldCheck, title: "Jornada confiavel", text: "Informacoes claras, atendimento consultivo e canais de contato objetivos." },
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Sobre</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">RC Vend e um portal inteligente para decidir melhor no mercado imobiliario.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Nascemos para organizar a busca por imóveis, aproximando compradores, locatários, investidores e parceiros comerciais em uma experiência clara e moderna.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black">O que queremos construir</h2>
            <p className="mt-4 leading-8 text-muted">
              O RC Vend combina curadoria, tecnologia e atendimento para facilitar a comparacao de oportunidades. A proposta e ser um portal de busca imobiliaria com identidade propria, conteudo util e evolucao futura para recursos inteligentes.
            </p>
            <Link href="/imoveis" className="mt-6 inline-flex rounded-full bg-brand px-6 py-4 font-black text-white transition hover:bg-brand-strong">
              Buscar imóveis
            </Link>
          </div>
          <div className="grid gap-4">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <pillar.icon className="h-8 w-8 text-brand" />
                <h3 className="mt-4 text-xl font-black">{pillar.title}</h3>
                <p className="mt-2 leading-7 text-muted">{pillar.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-3xl bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-black">Principios do portal</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Clareza na informacao", "Busca por regioes relevantes", "Atendimento sem friccao"].map((item) => (
              <p key={item} className="flex items-center gap-2 font-bold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-brand" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
