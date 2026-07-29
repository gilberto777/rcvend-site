import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { blogPosts, getBlogPostBySlug } from "@/lib/blog-posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) return { title: "Artigo nao encontrado" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  const relatedPosts = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcvend.com.br";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "RC Vend",
    },
    publisher: {
      "@type": "Organization",
      name: "RC Vend",
      url: siteUrl,
    },
    mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
  };

  return (
    <main>
      <SiteHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <article>
        <section className="bg-brand-strong py-12 text-white">
          <div className="container-page">
            <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o blog
            </Link>
            <div className="mt-8 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-accent">
                  <span>{post.category}</span>
                  <span>/</span>
                  <span>{post.readTime}</span>
                </div>
                <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{post.title}</h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">{post.excerpt}</p>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/12 bg-white/10 shadow-2xl shadow-black/20">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-line bg-white p-7 shadow-sm md:p-10">
            <div className="space-y-6 text-lg leading-9 text-muted">
              {post.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-10 rounded-2xl bg-background p-6">
              <h2 className="text-xl font-black text-foreground">Quer comparar oportunidades?</h2>
              <p className="mt-2 leading-7 text-muted">
                Use a busca do RC Vend para filtrar por bairro, tipo de imóvel, finalidade e faixa de interesse.
              </p>
              <Link href="/imoveis" className="mt-4 inline-flex items-center gap-2 font-black text-brand">
                Buscar imóveis <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-brand">Leia tambem</p>
              <div className="mt-4 grid gap-4">
                {relatedPosts.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="group block border-t border-line pt-4 first:border-t-0 first:pt-0">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{item.category}</p>
                    <h3 className="mt-2 font-black leading-tight group-hover:text-brand">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
