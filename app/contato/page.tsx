import type { Metadata } from "next";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { InstitutionalLeadForm } from "@/components/forms/InstitutionalLeadForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getWhatsAppUrl } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com o RC Vend pelo WhatsApp ou envie uma mensagem para atendimento comercial.",
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Contato</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">Fale com o RC Vend.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Envie sua mensagem para atendimento sobre busca de imóveis, lançamentos, parcerias e divulgação de oportunidades.
          </p>
        </div>
      </section>

      <section className="container-page grid min-w-0 gap-8 py-12 sm:py-16 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid min-w-0 gap-4">
          <a href={getWhatsAppUrl("Ola! Vim pelo RC Vend e gostaria de atendimento.")} className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg">
            <MessageCircle className="h-8 w-8 text-brand" />
            <h2 className="mt-4 text-xl font-black">WhatsApp</h2>
            <p className="mt-2 leading-7 text-muted">Canal rápido para falar com um especialista e tirar dúvidas sobre oportunidades.</p>
          </a>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <Mail className="h-8 w-8 text-brand" />
            <h2 className="mt-4 text-xl font-black">E-mail</h2>
            <p className="mt-2 leading-7 text-muted">ralf.imoveis8@gmail.com</p>
          </div>
          <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
            <MapPin className="h-8 w-8 text-brand" />
            <h2 className="mt-4 text-xl font-black">Atuação</h2>
            <p className="mt-2 leading-7 text-muted">Portal com foco inicial em São Paulo e expansão por bairros estratégicos.</p>
          </div>
        </div>
        <InstitutionalLeadForm
          title="Enviar mensagem"
          description="Preencha os dados para receber retorno pelo canal informado."
          submitLabel="Enviar mensagem"
          sourceLabel="Página Contato"
          showProfile={false}
        />
      </section>
      <SiteFooter />
    </main>
  );
}
