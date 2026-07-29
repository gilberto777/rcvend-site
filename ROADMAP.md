# Roadmap RC Vend

## Estado atual

- Home comercial com hero, busca, CTAs, beneficios, destaques, lancamentos, bairros, blog, FAQ e captacao.
- Header e rodape com navegacao institucional e links SEO.
- Listagem de imoveis com filtros, cards profissionais e CTA para detalhe/WhatsApp.
- Detalhe do imovel com galeria, caracteristicas, lead form, WhatsApp e schema.org.
- Blog editorial com artigos estaticos e schema.org de artigo.
- Paginas institucionais: `/sobre`, `/anuncie`, `/contato`, `/politica-de-privacidade`.
- Paginas SEO iniciais por cidade, bairro e lancamento.
- Captura de leads via API local/Supabase.
- Login administrativo e cadastro inicial de imoveis.
- Fundacao Supabase em migration com Auth profiles, organizacoes, imoveis, imagens, features, leads, blog, Storage e RLS.

## Proximas etapas recomendadas

1. Aplicar migrations/seeds no projeto Supabase real e validar as politicas RLS.
2. Criar fluxo de aprovacao de corretores, organizacoes e imoveis.
3. Criar dashboard de leads no admin.
4. Melhorar edicao real de imoveis por `id` usando Supabase.
5. Adicionar multiplas imagens por imovel com ordenacao e capa.
6. Expandir paginas SEO por bairro e finalidade:
   - `/imoveis/sao-paulo/vila-mariana`
   - `/imoveis/sao-paulo/paraiso`
   - `/aluguel/sao-paulo`
   - `/comprar/sao-paulo`
7. Implementar mapa com coordenadas reais.
8. Criar pagina publica de comparacao entre imoveis.
9. Planejar atendimento inteligente com IA baseado em perfil, faixa de preco, regiao e objetivo.
10. Implementar favoritos e conta do usuario.
11. Adicionar auditoria, logs e permissoes por papel.
12. Criar rotina editorial para o Blog RC Vend com artigos de bairros, financiamento, compra, aluguel e lancamentos.
