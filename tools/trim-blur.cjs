/* One-off perf pass: trim the expensive backdrop-filter radii.
   UTF-8 safe. */
const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'styles.css');
let css = fs.readFileSync(p, 'utf8');
const before = css.length;
css = css
    .replace(/blur\(16px\)/g, 'blur(10px)')
    .replace(/blur\(18px\)/g, 'blur(12px)')
    .replace(/blur\(14px\)/g, 'blur(9px)')
    .replace(/blur\(12px\)/g, 'blur(8px)');
fs.writeFileSync(p, css, 'utf8');
console.log(`styles.css ${before} -> ${css.length} bytes`);
console.log('remaining blur radii:', [...new Set(css.match(/blur\(\d+px\)/g) || [])].join(' '));
