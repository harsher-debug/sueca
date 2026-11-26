import { mkdir, cp, copyFile } from 'node:fs/promises';
await mkdir('dist/skf', { recursive: true });
for (const file of ['index.html', 'styles.css', 'script.js', 'favicon.ico', 'sitemap.xml']) {
  await copyFile(file, `dist/skf/${file}`);
}
await cp('assets', 'dist/skf/assets', { recursive: true, filter: (path) => !path.endsWith('.md') });
