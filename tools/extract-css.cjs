/* One-off: move the inline <style> block + tailwind CDN config out of
   index.html into styles.css / tailwind.config.js. UTF-8 safe. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
const before = Buffer.byteLength(html, 'utf8');

// ---- 1) pull the inline <style> block out -------------------------------
const sIdx = html.indexOf('<style>');
const eIdx = html.indexOf('</style>');
if (sIdx === -1 || eIdx === -1) throw new Error('no <style> block found');
const css = html.slice(sIdx + '<style>'.length, eIdx);
html = html.slice(0, sIdx) + html.slice(eIdx + '</style>'.length);

// ---- 2) pull the tailwind CDN <script> + its config out ----------------
const cfgStart = html.indexOf('  <script>\n    tailwind.config = {');
if (cfgStart !== -1) {
    const cfgEnd = html.indexOf('</script>', cfgStart) + '</script>'.length;
    html = html.slice(0, cfgStart) + html.slice(cfgEnd);
}
const cdnStart = html.indexOf('  <!-- Tailwind is compiled by the CDN at runtime.');
if (cdnStart !== -1) {
    const cdnEnd = html.indexOf('\n', html.indexOf('<script src="https://cdn.tailwindcss.com"></script>')) + 1;
    html = html.slice(0, cdnStart) + html.slice(cdnEnd);
}

// ---- 3) collapse the blank lines left behind ---------------------------
html = html.replace(/(\r?\n){3,}/g, '\n\n');

fs.writeFileSync(htmlPath, html, 'utf8');

// ---- 4) write styles.css with the tailwind directives on top -----------
const header = `/* ============================================================
   FAHAD — global stylesheet.
   Tailwind is compiled ONCE at build time (no CDN runtime engine),
   so the browser no longer downloads and runs a full CSS engine.
   The custom layer below was previously an inline <style> block
   inside index.html — same rules, now cached and minified.
   ============================================================ */

@tailwind base;
@tailwind components;
@tailwind utilities;

`;
const cssPath = path.join(root, 'styles.css');
if (!fs.existsSync(cssPath)) fs.writeFileSync(cssPath, header + css, 'utf8');

const after = Buffer.byteLength(html, 'utf8');
console.log(`index.html: ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB`);
console.log(`styles.css : ${(fs.statSync(cssPath).size / 1024).toFixed(1)} KB`);
console.log('cdn.tailwindcss present:', html.includes('cdn.tailwindcss'));
console.log('inline <style> present :', html.includes('<style>'));
