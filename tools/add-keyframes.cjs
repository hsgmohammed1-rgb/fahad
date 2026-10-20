/* One-off: add the keyframes the custom layer references but Tailwind
   only emits when the matching utility class is used. In the CDN setup
   these were always present, so the effects showed; with a local build
   they must be declared explicitly. */
const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'styles.css');
let css = fs.readFileSync(p, 'utf8');

const block = `
/* ============================================================
   Keyframes referenced by the custom layer.
   Tailwind emits a keyframe only when its \`animate-*\` utility is
   used in the scanned source, so the ones below are declared here
   to keep every effect alive regardless of which utility is used.
   ============================================================ */
@keyframes shinePeriodic {
    0%   { transform: translateX(-170%) skewX(-18deg); opacity: 0; }
    8%   { opacity: 0.6; }
    24%  { transform: translateX(170%) skewX(-18deg); opacity: 0; }
    100% { transform: translateX(170%) skewX(-18deg); opacity: 0; }
}
@keyframes glitchFx {
    0%   { transform: translate(0); }
    25%  { transform: translate(-1px, 1px); }
    50%  { transform: translate(1px, -1px); }
    75%  { transform: translate(-1px, -1px); }
    100% { transform: translate(0); }
}
@keyframes floatY {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
}
@keyframes pulseGold {
    0%, 100% { opacity: 1; filter: drop-shadow(0 0 4px rgba(184,134,43,0.7)); }
    50%      { opacity: 0.8; filter: drop-shadow(0 0 14px rgba(184,134,43,0.7)); }
}
@keyframes emberRise {
    0%   { transform: translateY(0); opacity: 0; }
    12%  { opacity: 0.8; }
    100% { transform: translateY(-110vh); opacity: 0; }
}
@keyframes beamDrift {
    0%   { transform: translateX(-2%) rotate(8deg); opacity: 0.5; }
    100% { transform: translateX(2%) rotate(8deg); opacity: 0.9; }
}
`;

if (!css.includes('@keyframes shinePeriodic')) {
    css += block;
    fs.writeFileSync(p, css, 'utf8');
    console.log('keyframes appended');
} else {
    console.log('already present');
}
console.log('styles.css:', Math.round(fs.statSync(p).size / 1024) + ' KB');
