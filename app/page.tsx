import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Building2, CheckCircle2, LineChart, MapPinned, MessageCircle, Search, ShieldCheck, Sparkles } from "lucide-react";
import { AiPreviewSection } from "@/components/home/AiPreviewSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { HeroSearch } from "@/components/home/HeroSearch";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PropertyCard } from "@/components/property/PropertyCard";
import { blogPosts } from "@/lib/blog-posts";
import { getFeaturedProperties, getLaunches } from "@/lib/properties";
import { getWhatsAppUrl } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "RC Vend | Encontre imóveis com uma busca mais inteligente",
  description: "Busque imóveis, compare oportunidades por bairro, veja lançamentos e fale com especialistas pelo RC Vend.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "RC Vend | Encontre imóveis com uma busca mais inteligente",
    description: "Compare imóveis, bairros, lançamentos e oportunidades com atendimento consultivo.",
    url: "/",
  },
};

const trustBlocks = [
  { title: "Imóveis revisados", text: "Anúncios revisados antes da publicação para manter informações claras e comparáveis." },
  { title: "WhatsApp direto", text: "Atendimento direto pelo WhatsApp quando você encontrar uma oportunidade." },
  { title: "Anúncios aprovados", text: "Novos anúncios e parceiros estão sujeitos à aprovação do portal." },
  { title: "Portal em lançamento", text: "Fase de lançamento com evolução contínua da experiência e do catálogo." },
  { title: "Parceiros do mercado", text: "Corretores, imobiliárias e construtoras parceiros em São Paulo." },
];

const reasons = [
  { icon: Search, title: "Busca mais inteligente", text: "Encontre oportunidades por bairro, cidade, tipo de imóvel, finalidade e perfil de moradia." },
  { icon: LineChart, title: "Decisão com contexto", text: "Veja preço, área, características e localização em uma experiência feita para comparação." },
  { icon: Building2, title: "Portal para o mercado real", text: "Conteúdo organizado para compradores, locatários, corretores, construtoras e imobiliárias." },
  { icon: ShieldCheck, title: "Jornada confiável", text: "Informações objetivas, páginas claras e canais de contato desenhados para gerar bons leads." },
];

const popularNeighborhoodGroups = [
  {
    title: "Brooklin",
    description: "Empreendimentos, studios e apartamentos bem localizados perto de eixos corporativos e metrô.",
    links: [
      { label: "Imóveis no Brooklin", href: "/imoveis/sao-paulo/brooklin" },
      { label: "Apartamentos à venda no Brooklin", href: "/imoveis?purpose=sale&q=apartamento%20brooklin" },
      { label: "Studios à venda no Brooklin", href: "/imoveis?purpose=sale&q=studio%20brooklin" },
      { label: "Lançamentos no Brooklin", href: "/lancamentos/sao-paulo/brooklin" },
    ],
  },
  {
    title: "Moema",
    description: "Busca forte por conforto, mobilidade, lazer urbano e apartamentos em ruas valorizadas.",
    links: [
      { label: "Imóveis em Moema", href: "/imoveis/sao-paulo/moema" },
      { label: "Apartamentos à venda em Moema", href: "/imoveis?purpose=sale&q=apartamento%20moema" },
      { label: "Studios à venda em Moema", href: "/imoveis?purpose=sale&q=studio%20moema" },
      { label: "Lançamentos em Moema", href: "/imoveis?purpose=launch&q=moema" },
    ],
  },
  {
    title: "Eixos estratégicos",
    description: "Regiões com boa procura para morar, investir, alugar ou comparar oportunidades compactas.",
    links: [
      { label: "Imóveis na Vila Mariana", href: "/imoveis?purpose=all&q=vila%20mariana" },
      { label: "Imóveis no Paraíso", href: "/imoveis?purpose=all&q=paraiso" },
      { label: "Imóveis em Pinheiros", href: "/imoveis?purpose=all&q=pinheiros" },
      { label: "Imóveis na Chácara Santo Antônio", href: "/imoveis?purpose=all&q=chacara%20santo%20antonio" },
    ],
  },
  {
    title: "Sul e centro expandido",
    description: "Alternativas para quem procura acesso, serviços, transporte e diferentes faixas de metragem.",
    links: [
      { label: "Imóveis no Alto da Boa Vista", href: "/imoveis?purpose=all&q=alto%20da%20boa%20vista" },
      { label: "Imóveis em Santo Amaro", href: "/imoveis?purpose=all&q=santo%20amaro" },
      { label: "Imóveis nos Jardins", href: "/imoveis?purpose=all&q=jardins" },
      { label: "Imóveis próximos ao metrô", href: "/imoveis?purpose=all&q=metro" },
    ],
  },
  {
    title: "Perfis de busca em alta",
    description: "Consultas úteis para quem quer comparar imóvel pronto, lançamento, compacto ou com diferenciais.",
    links: [
      { label: "Studios em São Paulo", href: "/imoveis?purpose=all&q=studio%20sao%20paulo" },
      { label: "Apartamentos com varanda", href: "/imoveis?purpose=all&q=varanda" },
      { label: "Imóveis prontos para morar", href: "/imoveis?purpose=sale&q=pronto%20para%20morar" },
      { label: "Lançamentos em São Paulo", href: "/lancamentos/sao-paulo" },
    ],
  },
  {
    title: "Busca por objetivo",
    description: "Caminhos rápidos para quem está comparando compra, aluguel, investimento ou primeira moradia.",
    links: [
      { label: "Comprar apartamento em São Paulo", href: "/imoveis?purpose=sale&q=apartamento%20sao%20paulo" },
      { label: "Alugar apartamento em São Paulo", href: "/imoveis?purpose=rent&q=apartamento%20sao%20paulo" },
      { label: "Imóveis compactos bem localizados", href: "/imoveis?purpose=all&q=compacto%20bem%20localizado" },
      { label: "Oportunidades para investir", href: "/imoveis?purpose=sale&q=investimento" },
    ],
  },
];

const faqItems = [
  {
    question: "O RC Vend trabalha com compra, aluguel e lançamentos?",
    answer: "Sim. A busca organiza imóveis para compra, locação e lançamentos, facilitando a comparação entre oportunidades.",
  },
  {
    question: "Posso falar com um especialista antes de visitar?",
    answer: "Sim. Você pode enviar interesse pelo WhatsApp ou pelo formulário do imóvel para receber atendimento consultivo.",
  },
  {
    question: "Os bairros em destaque são limitados a São Paulo?",
    answer: "A primeira curadoria está focada em São Paulo, com estrutura para ampliar regiões conforme a base de imóveis crescer.",
  },
  {
    question: "Construtoras e imobiliarias podem anunciar?",
    answer: "Sim. O portal foi pensado para receber imóveis prontos, lançamentos e oportunidades de parceiros comerciais.",
  },
];

export default async function Home() {
  const [featured, launches] = await Promise.all([getFeaturedProperties(), getLaunches()]);
  const hasLaunchGrid = launches.length >= 3;
  const highlightedLaunch = launches[0];

  return (
    <main>
      <SiteHeader />
      <section className="relative overflow-hidden bg-brand-strong text-white">
        <Image
          src="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1800&q=80"
          alt="Arquitetura residencial moderna"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,38,83,0.96)_0%,rgba(0,38,83,0.86)_38%,rgba(0,38,83,0.52)_68%,rgba(0,38,83,0.18)_100%)]" />
        <div className="container-page relative grid min-h-[620px] items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.72fr)_minmax(600px,1.28fr)] xl:gap-14">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-accent/40 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-accent">
              Portal inteligente de imóveis
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl md:text-[3.5rem]">
              Encontre o imóvel ideal com uma busca mais inteligente.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
              Compare oportunidades, descubra bairros estratégicos e fale com especialistas para comprar, alugar ou investir com mais segurança.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/imoveis"
                className="inline-flex items-center gap-2 rounded-full bg-cta px-7 py-4 font-extrabold text-white shadow-lg shadow-cta/20 transition hover:bg-cta-hover"
              >
                Buscar imóvel
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={getWhatsAppUrl("Olá! Vim pelo RC Vend e quero ajuda para encontrar um imóvel.")}
                className="inline-flex items-center gap-2 rounded-full border border-white/28 px-7 py-4 font-black text-white transition hover:border-accent hover:text-accent"
              >
                <MessageCircle className="h-5 w-5" />
                Falar com especialista
              </a>
            </div>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-white/78 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Compra e aluguel</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Lançamentos</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Atendimento direto</span>
            </div>
          </div>
          <div className="w-full lg:self-center">
            <HeroSearch />
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white py-8">
        <div className="container-page grid gap-4 md:grid-cols-5">
          {trustBlocks.map((block) => (
            <div key={block.title} className="border-l-2 border-accent pl-4">
              <p className="font-black text-brand-strong">{block.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted">{block.text}</p>
            </div>
          ))}
        </div>
      </section>

      <BenefitsSection />

      <section className="container-page py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Curadoria comercial</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Imóveis em destaque</h2>
          </div>
          <Link href="/imoveis" className="font-bold text-brand hover:text-brand-strong">Ver todos os imóveis</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featured.slice(0, 4).map((property) => <PropertyCard key={property.id} property={property} />)}
        </div>
      </section>

      {hasLaunchGrid ? (
        <section className="bg-white py-16">
          <div className="container-page">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Novos empreendimentos</p>
                <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Lançamentos para acompanhar</h2>
              </div>
              <Link href="/imoveis?purpose=launch" className="font-bold text-brand hover:text-brand-strong">Explorar lançamentos</Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {launches.slice(0, 3).map((property) => <PropertyCard key={property.id} property={property} />)}
            </div>
          </div>
        </section>
      ) : highlightedLaunch ? (
        <section className="bg-white py-12">
          <div className="container-page">
            <div className="grid gap-6 rounded-3xl border border-line bg-background p-5 shadow-sm md:grid-cols-[0.95fr_1.05fr] md:items-center md:p-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Lançamento em destaque</p>
                <h2 className="mt-2 text-3xl font-black md:text-4xl">Uma oportunidade nova para acompanhar.</h2>
                <p className="mt-4 max-w-xl leading-7 text-muted">
                  Enquanto ampliamos a curadoria de novos empreendimentos, destacamos uma opção para comparar com imóveis prontos e outras oportunidades do portal.
                </p>
                <Link href="/imoveis?purpose=launch" className="mt-6 inline-flex items-center gap-2 font-black text-brand hover:text-brand-strong">
                  Ver lançamentos <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <PropertyCard property={highlightedLaunch} />
            </div>
          </div>
        </section>
      ) : null}

      <section id="bairros" className="container-page py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Busca por região</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Bairros mais buscados em São Paulo</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Caminhos rápidos para encontrar imóveis por bairro, tipo, momento de compra e perfil de busca.
            </p>
          </div>
          <Link href="/imoveis" className="font-bold text-brand hover:text-brand-strong">Buscar por bairro</Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {popularNeighborhoodGroups.map((group) => (
            <article key={group.title} className="rounded-2xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg">
              <MapPinned className="h-7 w-7 text-brand" />
              <h3 className="mt-4 text-xl font-black">{group.title}</h3>
              <p className="mt-2 min-h-18 text-sm leading-6 text-muted">{group.description}</p>
              <div className="mt-5 grid gap-2">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="group/link flex items-center justify-between gap-3 rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold text-foreground transition hover:border-brand/30 hover:bg-white hover:text-brand"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand transition group-hover/link:translate-x-1" />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Por que usar</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Uma busca imobiliaria feita para comparar melhor.</h2>
            <p className="mt-4 leading-7 text-white/70">
              O RC Vend organiza a jornada de descoberta, avaliacao e contato para transformar interesse em lead qualificado.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason.title} className="rounded-2xl border border-white/12 bg-white/8 p-6">
                <reason.icon className="h-8 w-8 text-accent" />
                <h3 className="mt-4 text-lg font-black">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{reason.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Busca inteligente para comprar melhor</p>
            <h2 className="mt-2 text-3xl font-black md:text-4xl">Menos tempo perdido, mais clareza para decidir.</h2>
            <p className="mt-4 max-w-2xl leading-8 text-muted">
              Em vez de navegar por anúncios soltos, o portal ajuda a organizar critérios importantes: localização, faixa de preço, metragem, finalidade e momento do imóvel.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["Compare lançamentos e prontos", "Filtre por perfil de moradia", "Priorize bairros estratégicos", "Acione atendimento no momento certo"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Sparkles className="h-4 w-4 text-gold" />
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-white p-7 shadow-sm">
            <Bot className="h-10 w-10 text-brand" />
            <h3 className="mt-5 text-2xl font-black">Atendimento com potencial para evoluir com IA</h3>
            <p className="mt-3 leading-7 text-muted">
              A experiencia ja nasce com dados organizados, formularios de lead e caminhos de contato que facilitam uma futura jornada assistida por inteligencia artificial.
            </p>
            <Link href="/imoveis" className="mt-6 inline-flex items-center gap-2 font-black text-brand">
              Iniciar busca <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <AiPreviewSection />

      <section id="anuncie" className="bg-white py-16">
        <div className="container-page rounded-3xl bg-brand p-8 text-white md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Capte leads qualificados</p>
              <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Tem um imóvel ou empreendimento para divulgar?</h2>
              <p className="mt-4 max-w-2xl leading-7 text-white/72">
                Cadastre oportunidades, direcione interessados e mantenha uma presença comercial mais profissional para compra, locação e lançamentos.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/anuncie"
                className="inline-flex items-center justify-center rounded-full bg-cta px-7 py-4 font-extrabold text-white shadow-lg shadow-cta/20 transition hover:bg-cta-hover"
              >
                Anunciar gratuitamente
              </Link>
              <a
                href={getWhatsAppUrl("Olá! Quero anunciar imóveis ou empreendimentos no RC Vend.")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 font-extrabold text-brand-strong transition hover:bg-white"
              >
                <MessageCircle className="h-5 w-5" />
                Falar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Blog RC Vend</p>
            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Conteúdo para comprar, alugar e decidir melhor.</h2>
            <p className="mt-4 max-w-2xl leading-7 text-muted">
              Guias curtos sobre bairros, lançamentos, visitas e critérios importantes para comparar oportunidades imobiliárias.
            </p>
          </div>
          <Link href="/blog" className="font-bold text-brand hover:text-brand-strong">Ver todos os artigos</Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-line">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
                    <span>{post.category}</span>
                    <span className="text-muted">/</span>
                    <span className="text-muted">{post.readTime}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 min-h-14 text-lg font-black leading-tight text-foreground">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand">
                    Ler artigo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand">Dúvidas frequentes</p>
          <h2 className="mt-2 text-3xl font-black md:text-4xl">FAQ</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <div key={item.question} className="rounded-2xl border border-line bg-white p-6 shadow-sm">
              <h3 className="font-black">{item.question}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
