# Migração local para RC Vend

Esta pasta é uma cópia independente do portal Vision Mobia, criada para iniciar a nova versão RC Vend sem alterar os projetos existentes.

## Preservado

- `C:\Projetos\Visionmobia` permanece como o portal Vision Mobia.
- `C:\Projetos\Rcvend` permanece como o site Vite existente da RC Vend.
- Nenhum domínio, deploy ou recurso externo foi alterado.

## Configurado nesta cópia

- Marca e textos RC Vend.
- Identidade visual azul e logotipos da RC Vend.
- URLs canônicas, sitemap, robots e dados estruturados preparados para `https://www.rcvend.com.br`.
- WhatsApp comercial configurado com o número usado pelo site RC Vend existente.
- Migrations do Supabase mantidas prontas para aplicação em um projeto independente.

## Supabase

Organização informada:

`https://supabase.com/dashboard/org/gveetzwjbrowikavumtc`

O link da organização não contém as credenciais de um projeto. Para conectar esta cópia, ainda serão necessários:

- referência do projeto (`project-ref`);
- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- `SUPABASE_SERVICE_ROLE_KEY`, usada somente no servidor.

Até essas variáveis serem fornecidas, a aplicação usa os dados demonstrativos locais.

## Próximas etapas

1. Criar ou selecionar um projeto Supabase dentro da organização RC Vend.
2. Aplicar as migrations da pasta `supabase/migrations`.
3. Configurar as variáveis em `.env.local`.
4. Definir quais imóveis e conteúdos serão copiados para o novo banco.
5. Validar autenticação, painel administrativo e cadastro de leads.
6. Somente após aprovação, preparar um projeto e domínio de produção separados.
