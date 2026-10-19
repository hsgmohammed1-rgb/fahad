/** Final brand sweep — asset paths, channel slug, community copy, sitemap. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'C:/Users/MOH/Documents/GG/fahad/fahad';

const FILES = {
    'index.tsx': [
        ["'XTROET.'", "'FAHAD.'"],
    ],
    'index.html': [
        ['"FAHAD Stream Hub"', '"FAHAD Hub"'],
    ],
    'components/Chat.tsx': [
        ['// 4. Connect to XTROET channel', '// 4. Connect to the FAHAD channel'],
    ],
    'components/StatsSection.tsx': [
        ['/xtroet-logo.webp', '/fahad-logo.png'],
        ['kick.com/xtroet', 'kick.com/fahad'],
    ],
    'components/CommunityWidgets.tsx': [
        // asset paths
        ['/xtroet-logo.webp', '/fahad-logo.png'],
        ['/xtroet-discord.jpg', '/fahad-bg.png'],
        ['/xtroet-banner.jpg', '/fahad-bg.png'],
        // brand copy
        ["'XTROET EMPIRE'", "'FAHAD KINGDOM'"],
        ['alt="XTROET community banner"', 'alt="FAHAD community banner"'],
        ['alt="XTROET Discord server"', 'alt="FAHAD Discord server"'],
        ["'XTROET official community'", "'FAHAD official community'"],
        ['alt="XTROET official banner - emerald and bronze"', 'alt="FAHAD official banner - radiant gold"'],
        ['alt="XTROET logo"', 'alt="FAHAD logo"'],
        ['alt="XTROET emblem"', 'alt="FAHAD emblem"'],
        ["'XTROET - OFFICIAL VIDEOS'", "'FAHAD - OFFICIAL VIDEOS'"],
        ["date: 'XTROET'", "date: 'FAHAD'"],
        ['>XTROET<', '>FAHAD<'],
        ['>XTROET  OFFICIAL<', '>FAHAD OFFICIAL<'],
        ["'XTROET ERA - Emerald Empire'", "'FAHAD ERA - Golden Kingdom'"],
        ['XTROET OFFICIAL', 'FAHAD OFFICIAL'],
        ["'XTROET - OFFICIAL VIDEOS'", "'FAHAD - OFFICIAL VIDEOS'"],
        // live handle
        ['https://www.youtube.com/@XTROET', 'https://www.youtube.com/@fhd-gm'],
        // comments
        ['DISCORD - XTROET EMPIRE (Nasser official)', 'DISCORD - FAHAD KINGDOM (official)'],
        ['YOUTUBE - XTROET (Nasser official)', 'YOUTUBE - FAHAD (official)'],
        ['XTROET emerald-bronze identity', 'FAHAD obsidian-gold identity'],
        ['// XTROET channel uses handle @XTROET', '// FAHAD channel uses handle @fhd-gm'],
        ['XTROET channel uses handle', 'FAHAD channel uses handle'],
        ['banner - XTROET official,', 'banner - FAHAD official,'],
        ['empire ribbon - XTROET official', 'empire ribbon - FAHAD official'],
        ['emerald ribbon - XTROET official', 'gold ribbon - FAHAD official'],
    ],
    'api/kick-callback.ts': [
        ['//  XTROET Bot', '//  FAHAD Bot'],
    ],
    'public/sitemap.xml': [
        ['https://ixtroet.vercel.app/', 'https://fahad.vercel.app/'],
        ['https://ixtroet.vercel.app/', 'https://fahad.vercel.app/'],
        ['ixtroet.vercel.app', 'fahad.vercel.app'],
        ['xtroet-banner.jpg', 'fahad-bg.png'],
        ['xtroet-logo.webp', 'fahad-logo.png'],
        ['XTROET', 'FAHAD'],
        ['ناصر العنزي', 'فهد'],
    ],
};

for (const [rel, rules] of Object.entries(FILES)) {
    const file = join(ROOT, rel);
    let src;
    try { src = readFileSync(file, 'utf8'); } catch { console.log('  skip', rel); continue; }
    const before = src;
    for (const [from, to] of rules) src = src.split(from).join(to);
    if (src !== before) { writeFileSync(file, src, 'utf8'); console.log('  swept', rel); }
    else console.log('  no change', rel);
}
console.log('\ndone');
