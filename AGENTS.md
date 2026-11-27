# Publicação da landing page

- Produção: https://sueca.com.br/skf, Cloudflare Worker `sueca-skf`, configuração em `wrangler.jsonc`.
- Ao receber pedido de commit, sincronizar com GitHub e publicar também na Cloudflare, conforme a preferência do usuário por atualizações imediatas. Respeitar qualquer pedido explícito de não publicar.
- Após o commit, executar `powershell -NoProfile -File scripts/publish.ps1`. Esse fluxo testa, faz push, publica e confere HTTP 200. Confirmar ainda o conteúdo alterado em produção.
- Não afirmar que push publica automaticamente até a integração Workers Builds com `harsher-debug/sueca`, branch `main`, estar efetivamente conectada e verificada.
- GitHub e deploy são etapas distintas: se qualquer etapa falhar, informar separadamente qual foi concluída e o bloqueio restante.
- Não alterar as rotas do institucional. Apenas `sueca.com.br/skf*`, com proteção de prefixo no código do Worker.
