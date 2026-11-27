# Hospedagem em /skf

Preparado para publicação autorizada pelo cliente. O acesso à conta Cloudflare da zona sueca.com.br é necessário para o deploy.

## Atualizações após commit

Em 27/11/2026, o cliente confirmou a conexão de `harsher-debug/sueca` ao Worker correto, `sueca-skf`, e o ajuste dos comandos de build e deploy. Este registro inicia uma nova execução por push para verificar a integração. Configuração esperada: branch `main`, diretório `/`, build `node --test tests/*.test.* && node scripts/build-worker.mjs` e deploy `npx --yes wrangler@4.168.0 deploy`. O primeiro teste havia sido conectado ao Worker antigo `sueca`, causando conflito de rota; a rota deve permanecer em `sueca-skf`.

O deploy da alteração de mapa e favicon foi confirmado em 27/11/2026. Push no GitHub não era suficiente: a integração de Builds ainda não estava conectada. O servidor já retorna `Cache-Control: public, max-age=0, must-revalidate`, portanto não foi necessário desativar cache ou purgar o institucional.

Fluxo local após cada commit: `powershell -NoProfile -File scripts/publish.ps1`. Interrompe em caso de teste, push ou deploy com erro, e verifica HTTP 200 em produção. A conta Cloudflare está explícita no Wrangler para evitar seleção interativa.

Para automatizar pushes feitos fora deste computador, conectar o Worker `sueca-skf` ao repositório `harsher-debug/sueca`, branch `main`, em Settings > Builds > Connect. Diretório `/`, build `node --test tests/*.test.*`, deploy `npx wrangler@4.168.0 deploy`. Essa conexão exige autorização do GitHub no painel ou token com permissão Workers Builds Configuration Edit, ausente no OAuth atual. Enquanto não for confirmada, não considerar o deploy por push habilitado. A publicação envolve execução e propagação; não há garantia de atualização literalmente instantânea.

`node scripts/build-worker.mjs` prepara somente arquivos públicos em `dist/skf`. A configuração `wrangler.jsonc` serve os recursos via ASSETS, sem fallback de SPA. A entrada canônica é https://sueca.com.br/skf; /skf/ e /skf/index.html redirecionam preservando a query string. CSS, fontes, imagens, favicon e fetch do mapa resolvem sob /skf/. As âncoras apontam para /skf#secao.

A rota sueca.com.br/skf* é necessária para atender /skf com UTMs (o matching das Routes inclui a query). O Worker limita o atendimento a /skf e /skf/: caminhos semelhantes, como /skf-outro, seguem para a origem com a requisição intacta. Não configurar rota /* nem Custom Domain para esta landing page. workers.dev e previews estão desativados.

O formulário continua abrindo o WhatsApp da filial selecionada; não existe API de envio ou armazenamento de leads. UTMs presentes são incluídas no texto desse formulário. Links de lojas e redes sociais continuam externos. Geolocalização depende de HTTPS e consentimento, com seleção manual como alternativa.

SEO: canonical e og:url sem parâmetros, Open Graph e Twitter card com imagem absoluta e sitemap próprio em /skf/sitemap.xml. O robots.txt e sitemap.xml da raiz pertencem ao institucional e não são substituídos. Após autorização, cadastrar o sitemap da LP no Search Console ou adicioná-lo ao índice de sitemaps existente. Confirmar que o robots.txt institucional permite /skf.

Antes de publicar, confirmar acesso à zona sueca.com.br, DNS proxied e eventuais Workers/Redirect Rules existentes. Testar em staging com Wrangler: entrada com UTMs, redirecionamentos, recursos, navegação por âncoras, formulário WhatsApp, mapa e geolocalização. Deploy somente após autorização explícita: `npx wrangler deploy`. Não foi executado. Validar em produção também que /, /sobre, /robots.txt e os recursos do institucional permanecem intactos.

Referências: https://developers.cloudflare.com/workers/configuration/routing/routes/ e https://developers.cloudflare.com/workers/static-assets/binding/
