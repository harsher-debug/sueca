# Hospedagem em /skf

Preparado para publicação autorizada pelo cliente. O acesso à conta Cloudflare da zona sueca.com.br é necessário para o deploy.

`node scripts/build-worker.mjs` prepara somente arquivos públicos em `dist/skf`. A configuração `wrangler.jsonc` serve os recursos via ASSETS, sem fallback de SPA. A entrada canônica é https://sueca.com.br/skf; /skf/ e /skf/index.html redirecionam preservando a query string. CSS, fontes, imagens, favicon e fetch do mapa resolvem sob /skf/. As âncoras apontam para /skf#secao.

A rota sueca.com.br/skf* é necessária para atender /skf com UTMs (o matching das Routes inclui a query). O Worker limita o atendimento a /skf e /skf/: caminhos semelhantes, como /skf-outro, seguem para a origem com a requisição intacta. Não configurar rota /* nem Custom Domain para esta landing page. workers.dev e previews estão desativados.

O formulário continua abrindo o WhatsApp da filial selecionada; não existe API de envio ou armazenamento de leads. UTMs presentes são incluídas no texto desse formulário. Links de lojas e redes sociais continuam externos. Geolocalização depende de HTTPS e consentimento, com seleção manual como alternativa.

SEO: canonical e og:url sem parâmetros, Open Graph e Twitter card com imagem absoluta e sitemap próprio em /skf/sitemap.xml. O robots.txt e sitemap.xml da raiz pertencem ao institucional e não são substituídos. Após autorização, cadastrar o sitemap da LP no Search Console ou adicioná-lo ao índice de sitemaps existente. Confirmar que o robots.txt institucional permite /skf.

Antes de publicar, confirmar acesso à zona sueca.com.br, DNS proxied e eventuais Workers/Redirect Rules existentes. Testar em staging com Wrangler: entrada com UTMs, redirecionamentos, recursos, navegação por âncoras, formulário WhatsApp, mapa e geolocalização. Deploy somente após autorização explícita: `npx wrangler deploy`. Não foi executado. Validar em produção também que /, /sobre, /robots.txt e os recursos do institucional permanecem intactos.

Referências: https://developers.cloudflare.com/workers/configuration/routing/routes/ e https://developers.cloudflare.com/workers/static-assets/binding/
