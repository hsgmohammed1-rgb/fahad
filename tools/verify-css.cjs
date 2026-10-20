/* Verify styles.css still holds every rule that used to live in the
   inline <style> block, and that nothing was lost in the move. */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.resolve(__dirname, '..');

const oldHtml = execSync(`git show HEAD:index.html`, { cwd: root, encoding: 'utf8' });
const s = oldHtml.indexOf('<style>');
const e = oldHtml.indexOf('</style>');
const oldCss = oldHtml.slice(s + 7, e);

const styles = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const newCss = styles.slice(styles.indexOf('@tailwind utilities;') + '@tailwind utilities;'.length);

const norm = (c) => c.replace(/\s+/g, ' ').trim();
console.log('old inline block chars :', oldCss.length);
console.log('new styles.css body    :', newCss.length);
console.log('identical after norm   :', norm(oldCss) === norm(newCss));

// how many selectors survived?
const sel = (c) => (c.match(/[.#][a-zA-Z0-9_\\.\-\[\]\(\),:%#\/]+(?=\s*[,{])/g) || []).length;
console.log('old selectors ~', sel(oldCss), '| new selectors ~', sel(newCss));

// any rule present in the old block but missing now?
const oldSels = new Set((oldCss.match(/[.#][a-zA-Z0-9_\\.\-\[\]\(\),:%#\/]+(?=\s*[,{])/g) || []));
const newSels = new Set((newCss.match(/[.#][a-zA-Z0-9_\\.\-\[\]\(\),:%#\/]+(?=\s*[,{])/g) || []));
const missing = [...oldSels].filter((x) => !newSels.has(x));
console.log('missing selectors:', missing.length ? missing.slice(0, 20) : 'none');
