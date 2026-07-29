import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { blogPosts } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog RC Vend",
  description: "Guias do RC Vend sobre bairros, compra, aluguel, lançamentos e decisão imobiliária.",
};

export default function BlogPage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-brand-strong py-16 text-white">
        <div className="container-page">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-accent">Blog RC Vend</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
            Conteúdo para entender bairros, comparar imóveis e decidir melhor.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">
            Artigos curtos e praticos para quem esta comprando, alugando, investindo ou acompanhando lancamentos.
          </p>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.slug} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg">
              <Link href={`/blog/${post.slug}`} className="block">
                <div className="relative aspect-[16/10] overflow-hidden bg-line">
                  <Image
                    src={post.image}
                    alt={post.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand">
                    <span>{post.category}</span>
                    <span className="text-muted">/</span>
                    <span className="text-muted">{post.readTime}</span>
                  </div>
                  <h2 className="mt-3 text-xl font-black leading-tight">{post.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-brand">
                    Ler artigo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
