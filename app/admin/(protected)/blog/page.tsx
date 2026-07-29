import { AdminPlaceholder } from "@/components/admin/AdminPlaceholder";

export default function AdminBlogPage() {
  return (
    <AdminPlaceholder
      title="Blog"
      description="Painel editorial para artigos, categorias, SEO, publicaÃ§Ã£o e calendÃ¡rio de conteÃºdo do RC Vend."
      entityLabel="artigo"
      actionHref="/admin/blog/novo"
    />
  );
}
