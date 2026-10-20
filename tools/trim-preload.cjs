/* One-off: drop the share-banner preloads. A 961 KB social banner
   was being preloaded on EVERY visit, for a page that never shows it.
   Social crawlers read the og:image URL directly — no preload needed. */
const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'index.html');
let html = fs.readFileSync(p, 'utf8');
const before = html.length;
html = html
    .replace(/[ \t]*<link rel="preload" as="image" href="\/87653467890\.png"[^>]*>\r?\n/g, '')
    .replace(/[ \t]*<link rel="preload" as="image" href="\/og-banner\.jpg"[^>]*>\r?\n/g, '');
fs.writeFileSync(p, html, 'utf8');
console.log(`index.html ${before} -> ${html.length} bytes`);
console.log('preloads left:', (html.match(/rel="preload"/g) || []).length);
console.log([...html.matchAll(/rel="preload" as="image" href="([^"]+)"/g)].map(m => m[1]).join(', '));
