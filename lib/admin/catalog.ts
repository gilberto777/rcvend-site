export type AdminCatalogKind = "corretor" | "imobiliaria" | "construtora" | "bairro" | "blog";

export type AdminCatalogFieldType = "text" | "email" | "url" | "textarea" | "select" | "datetime-local";

export type AdminCatalogField = {
  name: string;
  label: string;
  type: AdminCatalogFieldType;
  placeholder?: string;
  helper?: string;
  required?: boolean;
  rows?: number;
  defaultValue?: string;
  span?: 1 | 2;
  options?: Array<{
    label: string;
    value: string;
  }>;
};

export type AdminCatalogConfig = {
  title: string;
  description: string;
  note?: string;
  backHref: string;
  backLabel: string;
  submitLabel: string;
  successMessage: string;
  fields: AdminCatalogField[];
};

export const adminCatalogConfigs = {
  corretor: {
    title: "Cadastrar corretor",
    description: "Envie um convite de acesso e deixe o perfil pronto para aprovação no painel.",
    note: "Esse fluxo cria o acesso do corretor por convite e completa o perfil assim que a conta for ativada.",
    backHref: "/admin/corretores",
    backLabel: "Voltar para corretores",
    submitLabel: "Enviar convite",
    successMessage: "Convite do corretor enviado com sucesso.",
    fields: [
      { name: "full_name", label: "Nome completo", type: "text", required: true, placeholder: "Nome do corretor" },
      { name: "email", label: "E-mail", type: "email", required: true, placeholder: "corretor@exemplo.com" },
      { name: "phone", label: "Telefone", type: "text", placeholder: "(11) 99999-9999" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "(11) 99999-9999" },
      { name: "creci", label: "CRECI", type: "text", placeholder: "123456-F" },
      { name: "city", label: "Cidade", type: "text", defaultValue: "São Paulo", placeholder: "São Paulo" },
    ],
  },
  imobiliaria: {
    title: "Cadastrar imobiliária",
    description: "Registre a empresa para aprovação e publicação futura no portal.",
    note: "O cadastro entra como pendente até a aprovação da administração.",
    backHref: "/admin/imobiliarias",
    backLabel: "Voltar para imobiliárias",
    submitLabel: "Salvar imobiliária",
    successMessage: "Imobiliária cadastrada com sucesso.",
    fields: [
      { name: "name", label: "Razão social", type: "text", required: true, placeholder: "Nome da imobiliária" },
      { name: "slug", label: "Slug", type: "text", placeholder: "imobiliaria-exemplo", helper: "Opcional. Se ficar em branco, será gerado automaticamente." },
      { name: "email", label: "E-mail", type: "email", placeholder: "contato@exemplo.com" },
      { name: "phone", label: "Telefone", type: "text", placeholder: "(11) 3333-3333" },
      { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "(11) 99999-9999" },
      { name: "website", label: "Site", type: "url", placeholder: "https://exemplo.com.br" },
      { name: "city", label: "Cidade", type: "text", defaultValue: "São Paulo", placeholder: "São Paulo" },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: "pending",
        options: [
          { label: "Pendente", value: "pending" },
          { label: "Ativa", value: "active" },
          { label: "Bloqueada", value: "blocked" },
        ],
      },
    ],
  },
  construtora: {
    title: "Cadastrar construtora",
    description: "Cadastre incorporadoras e construtoras para aparecerem no catálogo e nas páginas de lançamento.",
    note: "Esse cadastro alimenta a base pública de construtoras e o relacionamento com lançamentos.",
    backHref: "/admin/construtoras",
    backLabel: "Voltar para construtoras",
    submitLabel: "Salvar construtora",
    successMessage: "Construtora cadastrada com sucesso.",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, placeholder: "Nome da construtora" },
      { name: "slug", label: "Slug", type: "text", placeholder: "construtora-exemplo", helper: "Opcional. Se ficar em branco, será gerado automaticamente." },
      { name: "description", label: "Descrição", type: "textarea", rows: 4, placeholder: "Descreva atuação, posicionamento e diferenciais." },
      { name: "logo_url", label: "Logo", type: "url", placeholder: "https://..." },
      { name: "website", label: "Site", type: "url", placeholder: "https://exemplo.com.br" },
      { name: "phone", label: "Telefone", type: "text", placeholder: "(11) 3333-3333" },
      { name: "email", label: "E-mail", type: "email", placeholder: "contato@exemplo.com" },
      {
        name: "is_active",
        label: "Situação",
        type: "select",
        defaultValue: "true",
        options: [
          { label: "Ativa", value: "true" },
          { label: "Inativa", value: "false" },
        ],
      },
    ],
  },
  bairro: {
    title: "Cadastrar bairro",
    description: "Crie uma página SEO com descrição, imagem e metadados do bairro.",
    note: "Os bairros aparecem como páginas públicas e também alimentam a busca por região.",
    backHref: "/admin/bairros",
    backLabel: "Voltar para bairros",
    submitLabel: "Salvar bairro",
    successMessage: "Bairro cadastrado com sucesso.",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, placeholder: "Brooklin" },
      { name: "slug", label: "Slug", type: "text", placeholder: "brooklin", helper: "Opcional. Se ficar em branco, será gerado automaticamente." },
      { name: "city", label: "Cidade", type: "text", defaultValue: "São Paulo", placeholder: "São Paulo" },
      { name: "state", label: "Estado", type: "text", defaultValue: "SP", placeholder: "SP" },
      { name: "description", label: "Descrição", type: "textarea", rows: 4, placeholder: "Resumo curto para a página do bairro." },
      { name: "image_url", label: "Imagem", type: "url", placeholder: "https://..." },
      { name: "meta_title", label: "Meta title", type: "text", placeholder: "Bairro em São Paulo | RC Vend", span: 2 },
      { name: "meta_description", label: "Meta description", type: "textarea", rows: 3, placeholder: "Descrição de SEO para o bairro.", span: 2 },
      {
        name: "is_active",
        label: "Situação",
        type: "select",
        defaultValue: "true",
        options: [
          { label: "Ativo", value: "true" },
          { label: "Inativo", value: "false" },
        ],
      },
    ],
  },
  blog: {
    title: "Novo artigo",
    description: "Publique rascunhos, artigos prontos e conteúdo editorial do RC Vend.",
    note: "Se o status for publicado, a data de publicação será preenchida automaticamente quando estiver vazia.",
    backHref: "/admin/blog",
    backLabel: "Voltar para blog",
    submitLabel: "Salvar artigo",
    successMessage: "Artigo salvo com sucesso.",
    fields: [
      { name: "title", label: "Título", type: "text", required: true, placeholder: "Título do artigo" },
      { name: "slug", label: "Slug", type: "text", placeholder: "titulo-do-artigo", helper: "Opcional. Se ficar em branco, será gerado automaticamente." },
      { name: "excerpt", label: "Resumo", type: "textarea", rows: 3, placeholder: "Resumo curto para cards e SEO.", span: 2 },
      { name: "content", label: "Conteúdo", type: "textarea", rows: 10, required: true, placeholder: "Conteúdo completo do artigo.", span: 2 },
      { name: "cover_image", label: "Imagem de capa", type: "url", placeholder: "https://...", span: 2 },
      { name: "meta_title", label: "Meta title", type: "text", placeholder: "Título SEO do artigo", span: 2 },
      { name: "meta_description", label: "Meta description", type: "textarea", rows: 3, placeholder: "Descrição SEO do artigo.", span: 2 },
      { name: "published_at", label: "Data de publicação", type: "datetime-local", helper: "Opcional. Use quando for publicar agora ou agendar.", span: 2 },
      {
        name: "status",
        label: "Status",
        type: "select",
        defaultValue: "draft",
        options: [
          { label: "Rascunho", value: "draft" },
          { label: "Publicado", value: "published" },
          { label: "Arquivado", value: "archived" },
        ],
      },
    ],
  },
} satisfies Record<AdminCatalogKind, AdminCatalogConfig>;
