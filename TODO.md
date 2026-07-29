# TODO

## Configuração

- [x] Criar projeto Supabase real.
- [x] Configurar `.env.local`.
- [x] Criar bucket `property-images` via migration.
- [x] Criar primeiro usuário admin em `profiles`.
- [ ] Vincular projeto na Vercel.
- [ ] Apontar domínio `rcvend.com.br` após propagação Cloudflare.

## Admin

- [x] Criar layout administrativo com sidebar, topbar e logout.
- [x] Criar dashboard com indicadores, últimos leads e últimos imóveis.
- [x] Criar tela profissional de gestão de imóveis.
- [x] Criar tela inicial de leads.
- [x] Criar placeholders para corretores, imobiliárias, construtoras, bairros, blog e configurações.
- [ ] Criar edição administrativa protegida por API/server actions com sessão server-side.
- [ ] Implementar galeria completa: múltiplas imagens, ordenação, remover e definir capa.
- [ ] Criar tela de aprovação de imóveis pendentes.
- [ ] Criar CRUD real de bairros, construtoras, imobiliárias e corretores.
- [ ] Criar filtros avançados de leads e alteração de status.

## Produto

- [ ] Validar identidade visual com logo final.
- [ ] Definir tom de comunicação definitivo.
- [ ] Definir regras de publicação de imóveis por corretor, imobiliária e construtora.
- [ ] Criar termos de uso.

## Técnico

- [ ] Adicionar Supabase SSR/cookies para proteção server-side completa do `/admin`.
- [ ] Criar API protegida para gerenciamento administrativo.
- [ ] Adicionar testes de formulários e leads.
- [ ] Criar pipeline de deploy.
- [ ] Adicionar tratamento de erros e monitoramento.
