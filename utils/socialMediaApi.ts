// Live social counters — layered architecture per platform:
//   1) /api/social (server-side: Vercel Edge in prod, vite middleware in dev)
//   2) Direct client fetch (CORS-open sources only)
//   3) Neutral fallback until a live number lands
//
// FAHAD handles:
//   TikTok @ifhd89 | X @iiFHD89 | Snapchat @fahad898 | YouTube @fhd-gm

export interface SocialMediaStats {
  tiktok?: number;
  twitter?: number;
  snapchat?: number;
}

/**
 * WhatsApp channels publish no follower count to any public API, and X
 * blocks every endpoint we can reach from a serverless region. Both cards
 * must never render an empty "—", so they fall back to the known figures.
 */
export const WHATSAPP_FOLLOWERS = 10000;
const TWITTER_KNOWN = 19000;

/** Shown only while every live source is still warming up. */
export const FALLBACK: SocialMediaStats = {
  tiktok: 0,
  twitter: TWITTER_KNOWN,
  snapchat: 0,
};

const CACHE_KEY = 'fahad_social_cache_v1';
export const SOCIAL_TTL_MS = 5 * 60 * 1000;

async function fetchJson(url: string, timeoutMs = 9000): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

/** Layer 1 — our server API (works in dev + prod, no CORS issues). */
async function viaServerApi(platform: 'tiktok' | 'twitter' | 'snapchat'): Promise<number | null> {
  try {
    const j = await fetchJson(`/api/social?platform=${platform}`);
    return typeof j?.count === 'number' && j.count > 0 ? j.count : null;
  } catch {
    return null;
  }
}

/** Extract "N followers" from a mirror page — tags stripped, anchored on hearts stat. */
function extractMirrorFollowers(html: string): number | null {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ');
  const m =
    text.match(/hearts\s+([\d.,]+)\s*([KMB])?\s+followers/i) ||
    text.match(/([\d.,]+)\s*([KMB])?\s+followers/i);
  if (!m) return null;
  let v = parseFloat(m[1].replace(/,/g, ''));
  const u = (m[2] || '').toUpperCase();
  if (u === 'K') v *= 1e3;
  else if (u === 'M') v *= 1e6;
  else if (u === 'B') v *= 1e9;
  if (!Number.isFinite(v)) return null;
  const out = Math.round(v);
  return out > 0 ? out : null;
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return Math.round(v);
  if (typeof v === 'string') {
    const n = parseInt(v.replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

export async function getTikTokFollowers(username = 'ifhd89'): Promise<number> {
  const via = await viaServerApi('tiktok');
  if (via && via >= 100) return via;
  // Layer 2 — TikWM (free, no key, CORS-open)
  try {
    const d = await fetchJson(`https://www.tikwm.com/api/user/info?unique_id=${username}`);
    const n = num(d?.data?.follower_count);
    if (n) return n;
  } catch {}
  // Layer 3 — Mixerno TikTok counter (usually CORS-open)
  try {
    const d = await fetchJson(`https://mixerno.space/api/tiktok-user-counter/user/${username}`);
    const entry = Array.isArray(d?.counts) ? d.counts.find((c: any) => /follow/i.test(c?.value || '')) : null;
    const n = num(entry?.count);
    if (n) return n;
  } catch {}
  // Layer 4 — Urlebird mirror page (best-effort, needs CORS)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`https://urlebird.com/user/${username}/`, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const n = extractMirrorFollowers(await res.text());
      if (n) return n;
    }
  } catch {}
  // Layer 5 — Urlebird via public proxy (CORS-open, different egress IP)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://urlebird.com/user/${username}/`)}`, { signal: controller.signal });
    clearTimeout(timer);
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/([\d.,]+)\s*([KMB])?\s*(?:<\/[^>]+>\s*)?followers/i);
      if (m) {
        let v = parseFloat(m[1].replace(/,/g, ''));
        const u = (m[2] || '').toUpperCase();
        if (u === 'K') v *= 1e3; else if (u === 'M') v *= 1e6; else if (u === 'B') v *= 1e9;
        if (Number.isFinite(v) && v > 0) return Math.round(v);
      }
    }
  } catch {}
  return FALLBACK.tiktok ?? 0;
}

export async function getTwitterFollowers(username = 'iiFHD89'): Promise<number> {
  const via = await viaServerApi('twitter');
  if (via) return via;
  // Layer 2 — FixTweet API (usually CORS-open)
  try {
    const d = await fetchJson(`https://api.fxtwitter.com/${username}`);
    const n = num(d?.user?.followers);
    if (n) return n;
  } catch {}
  // X has no reachable public counter from here — show the real figure
  // rather than an empty dash on the card.
  return FALLBACK.twitter ?? TWITTER_KNOWN;
}

export async function getSnapchatFollowers(): Promise<number> {
  // Snapchat has no client-side API (CORS) — server only, 0 when unavailable
  return (await viaServerApi('snapchat')) ?? 0;
}

export async function getAllSocialMediaStats(): Promise<SocialMediaStats> {
  const [tiktok, twitter, snapchat] = await Promise.all([
    getTikTokFollowers(),
    getTwitterFollowers(),
    getSnapchatFollowers(),
  ]);
  const stats: SocialMediaStats = { tiktok, twitter, snapchat };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stats }));
  } catch {}
  return stats;
}

/** Instant paint from cache (if fresh), so numbers show before the live fetch lands. */
export function readSocialCache(): (SocialMediaStats & { _fresh: boolean }) | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { at, stats } = JSON.parse(raw);
    if (!stats) return null;
    return { ...stats, _fresh: Date.now() - at < SOCIAL_TTL_MS };
  } catch {
    return null;
  }
}

export function formatFollowerCount(count: number): string {
  if (!count || count <= 0) return '—';
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M+`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K+`;
  return count.toString();
}

/** The WhatsApp channel has no counter — format its known figure the same way. */
export const whatsappFollowerLabel = (): string => formatFollowerCount(WHATSAPP_FOLLOWERS);

export async function getCachedSocialMediaStats(): Promise<SocialMediaStats> {
  return getAllSocialMediaStats();
}
