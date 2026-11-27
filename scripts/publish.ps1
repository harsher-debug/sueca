$ErrorActionPreference = 'Stop'
Push-Location (Split-Path $PSScriptRoot -Parent)
try {
  if ((git branch --show-current) -ne 'main') { throw 'Publish must run from main.' }
  if (git status --porcelain) { throw 'Commit pending changes before publishing.' }
  node --test tests/campaign-links.test.cjs tests/worker-routing.test.mjs tests/scroll-motion.test.cjs tests/branch-location.test.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Tests failed; publication stopped.' }
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw 'GitHub synchronization failed; publication stopped.' }
  npx --yes wrangler@4.168.0 deploy
  if ($LASTEXITCODE -ne 0) { throw 'Cloudflare publication failed.' }
  $page = Invoke-WebRequest -Uri 'https://sueca.com.br/skf' -UseBasicParsing
  if ($page.StatusCode -ne 200) { throw 'Production did not return HTTP 200.' }
  Write-Output 'GitHub synchronized; Cloudflare deployed; /skf returned HTTP 200.'
} finally {
  Pop-Location
}
