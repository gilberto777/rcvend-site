import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-posts";
import { getProperties } from "@/lib/properties";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcvend.com.br";
  const properties = await getProperties();
  const staticRoutes = [
    { path: "/sobre", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/anuncie", priority: 0.75, changeFrequency: "monthly" as const },
    { path: "/contato", priority: 0.55, changeFrequency: "monthly" as const },
    { path: "/mapa", priority: 0.72, changeFrequency: "weekly" as const },
    { path: "/lancamentos", priority: 0.86, changeFrequency: "weekly" as const },
    { path: "/politica-de-privacidade", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/imoveis/sao-paulo", priority: 0.85, changeFrequency: "weekly" as const },
    { path: "/imoveis/sao-paulo/brooklin", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/imoveis/sao-paulo/moema", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/lancamentos/sao-paulo", priority: 0.82, changeFrequency: "weekly" as const },
    { path: "/lancamentos/sao-paulo/brooklin", priority: 0.78, changeFrequency: "weekly" as const },
  ];

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/imoveis`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...blogPosts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...properties.map((property) => ({
      url: `${siteUrl}/imoveis/${property.slug}`,
      lastModified: new Date(property.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
