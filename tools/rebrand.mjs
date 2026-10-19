/**
 * Brand-string sweep: XTROET -> FAHAD across the whole site.
 * Handles are NOT touched here (already replaced by hand); this is only the
 * visible brand copy, asset paths, and log/error labels.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'C:/Users/MOH/Documents/GG/fahad/fahad';

const FILES = [
    'App.tsx',
    'index.tsx',
    'metadata.json',
    'components/AdminDashboard.tsx',
    'components/AIChat.tsx',
    'components/AlbumSection.tsx',
    'components/BotrixLeaderboard.tsx',
    'components/ChallengeTab.tsx',
    'components/Chat.tsx',
    'components/CommunityWidgets.tsx',
    'components/LatestYoutube.tsx',
    'components/PublicWidgets.tsx',
    'components/SiteHeader.tsx',
    'components/StatsSection.tsx',
    'components/StoryPage.tsx',
    'components/StreamPlayer.tsx',
    'components/TeamsTab.tsx',
    'utils/kickApi.ts',
    'utils/supportersApi.ts',
    'api/kick.ts',
    'api/kick-status.ts',
    'api/kick-callback.ts',
    'api/kick-login.ts',
    'api/leaderboard.ts',
    'api/admin.ts',
    'api/groq.ts',
];

/* [pattern, replacement] — applied in order, longest/most specific first. */
const RULES = [
    // asset paths
    ['/xtroet-logo.webp', '/fahad-logo.png'],
    ['/og-xtroet.webp', '/fahad-logo.png'],
    ['/xtroet-banner.jpg', '/fahad-banner.jpg'],
    ['/bg-xtroet.png', '/fahad-bg.png'],
    ['/xtroet-discord.jpg', '/fahad-discord.jpg'],
    ['/channels4_banner.jpg', '/fahad-banner.jpg'],

    // live handles / links
    ['kick.com/xtroet', 'kick.com/fahad'],
    ['@xtroet', '@fahad'],
    ['x.com/xtroet', 'x.com/iiFHD89'],
    ['twitter.com/xtroet', 'twitter.com/iiFHD89'],
    ['tiktok.com/@ixtroet', 'tiktok.com/@ifhd89'],
    ['@ixtroet', '@ifhd89'],
    ['youtube.com/@XTROET', 'youtube.com/@fhd-gm'],
    ['snapchat.com/@xtroet', 'snapchat.com/@fahad898'],
    ['instagram.com/xtroet/', ''],
    ['discord.gg/bYPKxMp4h', 'discord.com/invite/HYByGx8mQA'],
    ['bYPKxMp4h', 'HYByGx8mQA'],
    ['tip.dokan.sa/xtroet', 'creators.sa/fahad89'],
    ['user=xtroet', 'user=fahad'],

    // visible brand copy (EN)
    ['XTROET STREAM HUB', 'FAHAD HUB'],
    ['XTROET Stream Hub', 'FAHAD Hub'],
    ['XTROET ERA', 'FAHAD ERA'],
    ['XTROET Official', 'FAHAD Official'],
    ['XTROET Hub', 'FAHAD Hub'],
    ['XTROET.AI', 'FAHAD.AI'],
    ['XTROET AI', 'FAHAD AI'],
    ['XTROET Empire', 'FAHAD Kingdom'],
    ['XTROET Album', 'FAHAD Album'],
    ['XTROET —', 'FAHAD —'],
    ['XTROET-', 'FAHAD-'],
    ['XTROET', 'FAHAD'],
    ['xtroet_social_cache', 'fahad_social_cache'],
    ['[xtroet]', '[fahad]'],
    ["'[xtroet]'", "'[fahad]'"],

    // visible brand copy (AR)
    ['إمبراطورية XTROET', 'مملكة فهد'],
    ['XTROET', 'FAHAD'],
    ['ناصر العنزي', 'فهد'],
    ['مساعد ناصر العنزي', 'مساعد فهد'],
    ['إمبراطورية الزمرد', 'مملكة الذهب'],
    ['عصر الزمرد', 'عصر الذهب'],
    ['زمردي × برونزي', 'ذهبي × أسود'],
    ['ألبوم ناصر العنزي', 'ألبوم فهد'],
    ['سيرة ناصر', 'سيرة فهد'],
    ['سيرة ناصر العنزي', 'سيرة فهد'],
    ['ناصر.personally', 'فهد'],
    ['مساعد ناصر', 'مساعد فهد'],
    ['تحديات ناصر', 'تحديات فهد'],
    ['كلان لفل ون (Level One)', ''],
];

let changed = 0;
for (const rel of FILES) {
    let src;
    try { src = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    const before = src;
    for (const [from, to] of RULES) src = src.split(from).join(to);
    if (src !== before) {
        writeFileSync(join(ROOT, rel), src, 'utf8');
        changed++;
        console.log('  rebranded', rel);
    }
}
console.log(`\nrebranded ${changed} file(s)`);
