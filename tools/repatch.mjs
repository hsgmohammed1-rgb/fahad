/**
 * Safe re-patch of the files that were reverted after a PowerShell encoding
 * mishap. Node reads/writes UTF-8 verbatim, so quotes survive.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'C:/Users/MOH/Documents/GG/fahad/fahad';

const FILES = {
    'components/Chat.tsx': [
        ["chatService.connect('xtroet')", "chatService.connect('fahad')"],
    ],
    'components/StatsSection.tsx': [
        ["const channelSlug = 'xtroet';", "const channelSlug = 'fahad';"],
    ],
    'api/leaderboard.ts': [
        ["|| 'xtroet'", "|| 'fahad'"],
        ['(xtroet)', '(fahad)'],
    ],
    'api/kick-callback.ts': [
        ["      'xtroet'", "      'fahad'"],
    ],
    'index.tsx': [
        ["'xtroet-boot'", "'fahad-boot'"],
        ["'[xtroet] render failed'", "'[fahad] render failed'"],
    ],
    'metadata.json': [
        ['FAHAD (Nasser Alanazi)', 'FAHAD'],
        ['The official Stream Hub for FAHAD', 'The official Hub for FAHAD'],
    ],
    'components/LatestYoutube.tsx': [
        ['Nasser', 'FAHAD'],
        ['nasser', 'fahad'],
    ],
    'components/CommunityWidgets.tsx': [
        ['FAHAD EMPIRE (Nasser official)', 'FAHAD EMPIRE (official)'],
        ['FAHAD (Nasser official)', 'FAHAD (official)'],
        ["'Nasser official channel'", "'FAHAD official channel'"],
    ],
    'components/ChallengeTab.tsx': [
        ["'Nasser won!'", "'Fahad won!'"],
        ["'If Nasser wins'", "'If Fahad wins'"],
        ["'Nasser won'", "'Fahad won'"],
        ["'Result: Nasser won'", "'Result: Fahad won'"],
    ],
};

for (const [rel, rules] of Object.entries(FILES)) {
    const file = join(ROOT, rel);
    let src;
    try { src = readFileSync(file, 'utf8'); } catch { console.log('  skip (missing)', rel); continue; }
    const before = src;
    for (const [from, to] of rules) src = src.split(from).join(to);
    if (src !== before) {
        writeFileSync(file, src, 'utf8');
        console.log('  patched', rel);
    } else {
        console.log('  no change', rel);
    }
}
console.log('\ndone');
