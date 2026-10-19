/**
 * One-shot palette migration: XTROET "Emerald Empire" -> Fahad "Obsidian Gold".
 *
 * Every value below is an EXACT literal found in the old design, so platform
 * brand colours (Kick green, Discord blurple, YouTube/TikTok/Snap red-yellow)
 * and the police-board blues are never touched — they are not in the table.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'C:/Users/MOH/Documents/GG/fahad/fahad';

const FILES = [
    'App.tsx',
    'index.tsx',
    'index.html',
    'components/AdminDashboard.tsx',
    'components/AdminIcons.tsx',
    'components/AIChat.tsx',
    'components/AlbumSection.tsx',
    'components/ArenaStyles.ts',
    'components/BotrixLeaderboard.tsx',
    'components/ChallengeTab.tsx',
    'components/Chat.tsx',
    'components/CommunityWidgets.tsx',
    'components/Icons.tsx',
    'components/LatestYoutube.tsx',
    'components/PoliceRanksBoard.tsx',
    'components/PublicWidgets.tsx',
    'components/SiteHeader.tsx',
    'components/SocialMediaAdmin.tsx',
    'components/SocialMediaManagement.tsx',
    'components/StatsSection.tsx',
    'components/StoryPage.tsx',
    'components/StreamPlayer.tsx',
    'components/TeamsTab.tsx',
    'utils/kickApi.ts',
    'utils/socialMediaApi.ts',
    'utils/supportersApi.ts',
];

/* --- Obsidian Gold tokens -------------------------------------------------
 * radiant gold  #F2B33D   antique gold  #B8862B   pale gold  #F7E3B0
 * deep bronze   #6B4E17   ember         #E07B12   obsidian   #08060A
 * -------------------------------------------------------------------------- */

// [pattern, replacement] — case-insensitive literals
const HEX = [
    // radiant gold (was emerald primary)
    ['#10B981', '#F2B33D'],
    ['#14B8A6', '#C9973F'],
    ['#0F766E', '#8A6320'],
    ['#059669', '#A97C2A'],
    ['#065F46', '#5C4310'],
    ['#047857', '#8A6320'],
    ['#34D399', '#F5D98C'],
    ['#22C55E', '#F2B33D'],
    ['#4ADE80', '#F2CE7C'],
    ['#6EE7B7', '#F2CE7C'],
    ['#A7F3D0', '#F7E3B0'],
    ['#6FF2C4', '#FDEFC9'],
    ['#8CFFD9', '#FDEFC9'],
    ['#B8FFE9', '#FBE2A2'],
    ['#EAFBF3', '#FFF6DE'],
    ['#ECFDF5', '#FFF8E8'],
    ['#E8F5EE', '#FFF8E8'],
    ['#F2F7F3', '#FFF8E8'],
    ['#8CFF5C', '#F5D98C'],
    ['#C6FFAB', '#F7E3B0'],
    ['#8DFF6A', '#F2CE7C'],

    // antique gold (was bronze trim) — keeps the secondary/frame role distinct
    ['#C9A24B', '#B8862B'],
    ['#D4AF37', '#F2B33D'],
    ['#D9C08A', '#E7C888'],
    ['#D9BE82', '#E7C888'],
    ['#F4D98A', '#F2CE7C'],
    ['#216,190,130', '#226,196,140'], // sentinel (never matches) — replaced below
    ['#E8D5A8', '#F7E3B0'],
    ['#F0DDAE', '#F7E3B0'],
    ['#F3E6C3', '#FBEBC4'],
    ['#F8EDD2', '#FFF4DC'],
    ['#FFF6DE', '#FFFAF0'],
    ['#FFF9E8', '#FFFCF5'],
    ['#FFF7D6', '#FFFBEC'],
    ['#FFE0B3', '#FFEBCE'],
    ['#F4E6C3', '#FFF0D2'],
    ['#F4E3B2', '#FBEBC4'],
    ['#FFB86B', '#FFB347'],
    ['#FFB08A', '#FFAE62'],
    ['#F0A35E', '#F5A03F'],
    ['#FFD9AE', '#FFE0A8'],
    ['#FFD166', '#F5C55C'],
    ['#FBBF24', '#F2B33D'],
    ['#8A6A3A', '#6B4E17'],
    ['#8A6D1F', '#6B4E17'],
    ['#9E7C21', '#8A6320'],
    ['#A8823F', '#A9801F'],
    ['#B8935A', '#B08A2E'],
    ['#8F6C2C', '#8F6C10'],
    ['#B97A0B', '#C98A0E'],
    ['#B35A0B', '#C9700F'],
    ['#6E3C10', '#6B3A08'],
    ['#E07B12', '#E07B12'],

    // obsidian ink (was emerald-tinted black)
    ['#04120D', '#08060A'],
    ['#071B14', '#0F0C08'],
    ['#0A2620', '#14100B'],
    ['#123A2E', '#241C11'],
    ['#0A1F18', '#120E09'],
    ['#06231B', '#0C0906'],
    ['#0A1F18', '#120E09'],
    ['#06281F', '#0D0A07'],
    ['#030C09', '#060509'],
    ['#0E7A55', '#B07C1A'],
    ['#08231B', '#100D0A'],
    ['#1C160B', '#191419'],
    ['#1A1409', '#181319'],
    ['#14100A', '#141018'],
    ['#080604', '#08060C'],
    ['#070604', '#07050B'],
    ['#040302', '#040308'],
    ['#050403', '#050408'],
    ['#0A0806', '#0A0810'],
    ['#0B0E0F', '#0C0A0D'],
    ['#0B0B0B', '#0B0A0C'],
    ['#0A0A0A', '#0A090C'],
    ['#0A0A0F', '#0A090F'],
    ['#0A0B16', '#0A0912'],
    ['#080808', '#08070A'],
];

const RGB = [
    ['16, 185, 129', '242, 179, 61'],
    ['16,185,129', '242,179,61'],
    ['20, 184, 166', '201, 151, 63'],
    ['20,184,166', '201,151,63'],
    ['15, 118, 110', '138, 99, 32'],
    ['5, 150, 105', '169, 124, 42'],
    ['6, 95, 70', '92, 67, 16'],
    ['4, 120, 87', '138, 99, 32'],
    ['52, 211, 153', '245, 217, 140'],
    ['110, 231, 183', '242, 206, 124'],
    ['167, 243, 208', '247, 227, 176'],
    ['111, 242, 196', '253, 239, 201'],
    ['140, 255, 217', '253, 239, 201'],
    ['184, 255, 233', '251, 226, 162'],
    ['216, 190, 130', '226, 196, 140'],
    ['212, 175, 55', '242, 179, 61'],
    ['201, 162, 75', '184, 134, 43'],
    ['232, 213, 168', '247, 227, 176'],
    ['244, 217, 138', '242, 206, 124'],
    ['255, 246, 222', '255, 248, 232'],
    ['251, 191, 36', '242, 179, 61'],
    ['255, 215, 106', '245, 197, 92'],
    ['255, 233, 184', '247, 227, 176'],
    ['255, 170, 60', '224, 123, 18'],
    ['255, 184, 107', '255, 179, 71'],
    ['255, 170, 0', '224, 123, 18'],
    ['255, 209, 102', '245, 197, 92'],
    ['251, 242, 231', '255, 246, 232'],
    ['34, 211, 153', '245, 217, 140'],
    ['34,197,94', '242, 179, 61'],
    ['4, 18, 13', '8, 6, 10'],
    ['7, 27, 20', '15, 12, 8'],
    ['10, 38, 32', '20, 16, 11'],
    ['18, 58, 46', '36, 28, 17'],
    ['6, 35, 27', '12, 9, 6'],
    ['13, 35, 27', '16, 13, 9'],
    ['8, 32, 25', '16, 13, 9'],
    ['3, 12, 9', '6, 5, 8'],
    ['3, 11, 8', '6, 5, 8'],
    ['3, 10, 8', '6, 5, 8'],
    ['4, 14, 11', '8, 6, 10'],
    ['4, 12, 10', '8, 6, 10'],
    ['4, 12, 28', '10, 8, 16'],
    ['2, 9, 7', '5, 4, 7'],
    ['2, 6, 16', '6, 5, 10'],
    ['1, 4, 12', '4, 3, 7'],
    ['5, 4, 3', '7, 5, 4'],
    ['9, 36, 28', '19, 15, 10'],
    ['10, 38, 32', '20, 16, 11'],
    ['14, 45, 36', '26, 21, 14'],
    ['16, 52, 39', '30, 24, 16'],
    ['14, 12, 8', '14, 12, 16'],
    ['10, 38, 32', '20, 16, 11'],
    ['5, 6, 8', '7, 6, 8'],
    ['58, 82, 74', '92, 74, 44'],
    ['90, 106, 99', '120, 104, 74'],
    ['4, 14, 11', '8, 6, 10'],
];

const RGB_NO_SPACE = RGB.map(([a, b]) => [a.replace(/ /g, ''), b.replace(/ /g, '')]);

let totalHits = 0;
for (const rel of FILES) {
    const file = join(ROOT, rel);
    let src;
    try { src = readFileSync(file, 'utf8'); } catch { continue; }
    const before = src;

    for (const [from, to] of HEX) src = src.split(from).join(to).split(from.toLowerCase()).join(to);
    for (const [from, to] of RGB) src = src.split(from).join(to);
    for (const [from, to] of RGB_NO_SPACE) src = src.split(from).join(to);

    if (src !== before) {
        writeFileSync(file, src, 'utf8');
        totalHits++;
        console.log('  re-coloured', rel);
    }
}
console.log(`\nrecoloured ${totalHits} file(s)`);
