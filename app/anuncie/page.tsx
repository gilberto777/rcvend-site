import type { Metadata } from "next";
import { Building2, Home, KeyRound, UsersRound } from "lucide-react";
import { InstitutionalLeadForm } from "@/components/forms/InstitutionalLeadForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Anuncie imóveis grátis no lançamento",
  description: "Anuncie gratuitamente no RC Vend durante a fase de lançamento. Cadastro sujeito à aprovação para corretores, imobiliárias, construtoras e proprietários.",
  alternates: { canonical: "/anuncie" },
};

const audiences = [
  { icon: UsersRound, title: "Corretores", text: "Divulgue oportunidades e receba contatos de interessados com mais contexto." },
  { icon: Building2, title: "Construtoras", text: "Apresente lançamentos, diferenciais, bairros e canais de atendimento." },
  { icon: Home, title: "Proprietários", text: "Divulgue imóveis com boas fotos e informações completas para melhorar o desempenho." },
  { icon: KeyRound, title: "Imobiliárias", text: "Organize sua carteira e receba interessados diretamente pelo WhatsApp." },
];

export default function AdvertisePage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Anuncie</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">Anuncie gratuitamente durante a fase de lançamento do RC Vend.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Gratuito por tempo limitado para corretores, imobiliárias, construtoras e proprietários. Todos os anúncios são revisados e sujeitos à aprovação.
          </p>
        </div>
      </section>

      <section className="container-page grid min-w-0 gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0">
          <div className="grid gap-4 md:grid-cols-2">
            {audiences.map((audience) => (
              <article key={audience.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
                <audience.icon className="h-8 w-8 text-brand" />
                <h2 className="mt-4 text-xl font-black">{audience.title}</h2>
                <p className="mt-2 leading-7 text-muted">{audience.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 rounded-3xl bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black">Como funciona</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-muted sm:grid-cols-2">
              <p className="rounded-2xl bg-background p-4"><strong className="block text-foreground">Gratuito por tempo limitado</strong>Condição especial durante a fase de lançamento.</p>
              <p className="rounded-2xl bg-background p-4"><strong className="block text-foreground">Sujeito à aprovação</strong>Revisamos qualidade, informações e aderência ao portal.</p>
              <p className="rounded-2xl bg-background p-4"><strong className="block text-foreground">Contato pelo WhatsApp</strong>Receba interessados de forma simples e direta.</p>
              <p className="rounded-2xl bg-background p-4"><strong className="block text-foreground">Anúncios mais completos</strong>Boas fotos e dados claros tendem a gerar mais interesse.</p>
            </div>
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <InstitutionalLeadForm
            title="Quero anunciar"
            description="Conte sobre seu perfil e a carteira de imóveis que deseja divulgar."
            submitLabel="Enviar interesse"
            sourceLabel="Página Anuncie"
            defaultMessage="Olá! Tenho interesse em anunciar imóveis no RC Vend."
            showAdvertiseFields
          />
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
