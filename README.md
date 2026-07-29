# RC Vend

Portal imobiliario inteligente para buscar, comparar e encontrar oportunidades de compra, locacao e lancamentos em Sao Paulo.

## Visao do produto

O RC Vend e um portal imobiliario com foco em:

- busca de imoveis por finalidade, tipo, bairro e cidade;
- comparacao clara entre oportunidades;
- lancamentos e imoveis prontos;
- captacao de leads por formulario e WhatsApp;
- conteudo editorial para SEO;
- evolucao futura para atendimento inteligente com IA.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase para banco, Auth e Storage
- Deploy preparado para Vercel
- Dominio: `rcvend.com.br`

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Variaveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://www.rcvend.com.br
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=5511970259728
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
```

Sem Supabase configurado, o site usa dados ficticios locais para desenvolvimento.
Sem `OPENAI_API_KEY`, a IA do admin usa uma sugestao local simples para testes.

### Atualizando o catálogo local

O projeto inclui uma cópia local dos imóveis públicos e aprovados do Vision Mobia. Para sincronizar novamente em modo somente leitura:

```bash
npm run sync:visionmobia
```

O comando atualiza `data/properties.json` e não grava no Supabase de origem.

## Rotas principais

- `/`: home comercial do portal
- `/imoveis`: busca geral de imoveis
- `/imoveis/[slug]`: detalhe do imovel
- `/blog`: conteudo editorial
- `/sobre`: institucional
- `/anuncie`: interesse de anunciantes
- `/contato`: contato comercial
- `/politica-de-privacidade`: politica de privacidade
- `/imoveis/sao-paulo`: pagina SEO por cidade
- `/imoveis/sao-paulo/brooklin`: pagina SEO por bairro
- `/imoveis/sao-paulo/moema`: pagina SEO por bairro
- `/lancamentos/sao-paulo`: pagina SEO de lancamentos
- `/lancamentos/sao-paulo/brooklin`: pagina SEO de lancamentos por bairro

## Rotas administrativas

O admin fica em `/admin` e exige usuário autenticado com `profiles.role = 'admin'`.

- `/admin`: dashboard com indicadores, últimos leads e últimos imóveis
- `/admin/imoveis`: gestão de imóveis com filtros, tabela e ações
- `/admin/imoveis/novo`: cadastro profissional de imóvel
- `/admin/imoveis/[id]/editar`: edição de imóvel
- `/admin/leads`: gestão inicial de leads
- `/admin/corretores`: placeholder para gestão de corretores
- `/admin/imobiliarias`: placeholder para imobiliárias
- `/admin/construtoras`: placeholder para construtoras
- `/admin/bairros`: placeholder para bairros e SEO local
- `/admin/blog`: placeholder editorial
- `/admin/configuracoes`: placeholder de configurações

## Supabase

O banco principal esta em `supabase/migrations/202606150001_initial_rcvend_schema.sql`.

Essa migration cria:

- enums de usuarios, imoveis, aprovacao e leads;
- tabelas `profiles`, `organizations`, `organization_members`, `neighborhoods`, `developers`, `properties`, `property_images`, `property_features`, `leads` e `blog_posts`;
- indices para busca, SEO e filtros principais;
- triggers de `updated_at`;
- RLS em todas as tabelas publicas;
- bucket `property-images` no Supabase Storage;
- politicas para leitura publica de imoveis aprovados, insercao publica de leads e administracao por perfis autorizados.

### Aplicando no Supabase

Opcao via CLI:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase db push --include-seed
```

Opcao via SQL Editor:

1. Abra o SQL Editor do Supabase.
2. Execute `supabase/migrations/202606150001_initial_rcvend_schema.sql`.
3. Execute `supabase/seed.sql` para dados demonstrativos.
4. Configure `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Reinicie `npm run dev`.

### Auth e permissoes

- Crie usuarios pelo Supabase Auth.
- Insira ou aprove registros em `profiles` com `role = 'admin'` para administracao total.
- Corretores/agencias devem usar `profiles`, `organizations` e `organization_members`.
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no frontend. Use apenas em rotinas server-side seguras.

### Teste local

```bash
npm run type-check
npm run lint
npm run build
```

Sem variaveis de Supabase, o projeto continua usando `lib/mock-data.ts`.

## Scripts

```bash
npm run dev
npm run lint
npm run type-check
npm run build
npm run import:gilcorretor
```

## Importacao de imoveis do Gil Corretor SP

O script `scripts/import-gilcorretor-properties.ts` importa apenas imoveis ativos do Supabase antigo. Ele nao altera nem migra leads.

O importador:

- preserva o slug antigo, portanto `/imoveis/slug-antigo` passa a existir em `rcvend.com.br`;
- ignora imoveis cujo slug ja existe no RC Vend;
- cria somente a organizacao `gilcorretorsp` e os bairros que ainda nao existem;
- grava fotos em `property_images` e plantas em `property_floor_plans`;
- preserva as URLs do Storage antigo, sem copiar arquivos nesta etapa;
- publica os novos registros com `approval_status = approved`, `status = available` e `is_active = true`;
- usa `properties.source = gilcorretorsp` somente se essa coluna existir; no schema atual, a origem fica registrada em `organization_id`;
- gera um relatorio JSON em `reports/import-gilcorretor-properties-*.json`.

Configure em `.env.local` as credenciais exclusivas da migracao:

```bash
OLD_SUPABASE_URL=
OLD_SUPABASE_SERVICE_ROLE_KEY=
NEW_SUPABASE_URL=
NEW_SUPABASE_SERVICE_ROLE_KEY=
```

As chaves `service_role` sao usadas somente pelo script local e nunca devem receber o prefixo `NEXT_PUBLIC` ou ser importadas pelo frontend. O arquivo `.env.local` permanece ignorado pelo Git.

Primeiro execute a simulacao, que consulta os dois bancos e nao grava dados:

```bash
npm run import:gilcorretor
```

Revise o resumo e o relatorio. Para realizar a importacao:

```bash
npm run import:gilcorretor -- --execute
```

Se houver falha ao gravar imagens ou plantas, o imovel criado naquela tentativa e removido do banco novo. O banco antigo nunca e alterado.

## Estrutura

- `app`: rotas publicas, admin, sitemap e robots
- `components`: blocos reutilizaveis de layout, home, formularios, propriedades e SEO
- `lib`: dados, Supabase, formatadores, blog e consultas
- `types`: contratos TypeScript
- `supabase`: migrations e seeds do banco
- `scripts`: automacoes futuras
