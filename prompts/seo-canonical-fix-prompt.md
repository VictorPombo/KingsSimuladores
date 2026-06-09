Vou precisar que você atue como Tech Lead e aplique um hotfix crítico de SEO no Next.js App Router.

Identificamos que o tráfego pago do Google Ads/Shopping está sendo redirecionado da página do produto para a Home do site. A causa raiz foi descoberta: o layout raiz do Next.js está forçando uma tag canonical global para a home, o que faz os bots do Google atualizarem o link de destino do anúncio.

Sua missão:

1. Modificar o arquivo `apps/site/src/app/layout.tsx`:
   - Procure a constante `metadata` exportada no arquivo.
   - Remova o bloco `alternates: { canonical: '/' }` de dentro dessa constante. Isso vai impedir que o Next.js force todas as páginas a dizerem que a Home é a página canônica.

2. Modificar o arquivo `apps/site/src/app/(store)/produtos/[id]/page.tsx`:
   - Encontre a função assíncrona `generateMetadata`.
   - Dentro do objeto de retorno dessa função (que já possui as tags OpenGraph etc.), adicione a propriedade `alternates` com o `canonical` apontando exatamente para a URL do produto. 
   - A sintaxe deve ficar assim:
     ```typescript
     alternates: {
       canonical: \`\${BASE_URL}/produtos/\${product.slug}\`,
     },
     ```

Essas duas alterações resolverão de vez o redirecionamento indevido do Google Ads.

Após aplicar, verifique com `npx tsc --noEmit` se não há erros de tipagem. Se tudo estiver ok, pode fazer o commit da alteração com a mensagem `fix(seo): remove global canonical and set specific product canonical URL`.
