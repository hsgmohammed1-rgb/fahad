import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type Hls from 'hls.js';

/**
 * In-site playback for Kick VODs and clips.
 *
 * Kick hands us a real HLS manifest for both (VODs on `source`, clips on
 * `video_url`), so the video plays on this site through hls.js instead of
 * bouncing the visitor to kick.com. Only when a channel keeps a VOD
 * subscriber-only (no manifest at all) do we fall back to Kick's own
 * player.kick.com iframe — that is the one case Kick will not hand over.
 *
 * The store is module-level on purpose: the play buttons live in App and in
 * StatsSection, and a single mounted player should serve both without
 * threading context through the tree.
 */

const CHANNEL_SLUG = 'fahad';

/* ------------------------------------------------------------------ media */

type KickItem = Record<string, any>;

/** Kick addresses a VOD by UUID; `id` is the livestream id and never works. */
export const kickVideoUuid = (v: KickItem): string | null =>
    v?.video?.uuid || v?.uuid || null;

export const kickWatchUrl = (v: KickItem): string => {
    const uuid = kickVideoUuid(v);
    return uuid ? `https://kick.com/${CHANNEL_SLUG}/videos/${uuid}` : `https://kick.com/${CHANNEL_SLUG}`;
};

/** Direct HLS manifest when Kick exposes one (clips and public VODs). */
export const kickHlsSource = (v: KickItem): string | null =>
    v?.video_url || v?.clip_url || v?.source || null;

export const kickPoster = (v: KickItem): string | null =>
    v?.thumbnail?.src || v?.thumbnail?.url || v?.thumbnail_url || null;

export const kickTitle = (v: KickItem): string =>
    v?.session_title || v?.title || 'FAHAD';

/* ------------------------------------------------------------------ store */

type Request = {
    key: string;
    title: string;
    src: string;
    poster?: string;
    kickUrl: string;
    /** Set when Kick withheld the manifest and we must use their iframe. */
    embedOnly?: boolean;
};

let current: Request | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function playInSite(item: KickItem, lang: 'ar' | 'en' = 'ar') {
    const src = kickHlsSource(item);
    const uuid = kickVideoUuid(item);
    current = {
        key: `${item?.id ?? item?.video?.id ?? uuid ?? 'x'}-${Date.now()}`,
        title: kickTitle(item),
        src: src || (uuid ? `https://player.kick.com/${uuid}` : ''),
        poster: kickPoster(item) || undefined,
        kickUrl: kickWatchUrl(item),
        embedOnly: !src,
    };
    emit();
}

export function closeInSite() {
    if (!current) return;
    current = null;
    emit();
}

const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => { listeners.delete(l); };
};
const snapshot = () => current;

/**
 * Click handler for any card: a plain click plays here, while the anchor
 * still lets ctrl/middle-click fall through to Kick.
 */
export const playOnSite = (item: KickItem, lang: 'ar' | 'en' = 'ar') =>
    (e: React.MouseEvent) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        playInSite(item, lang);
    };

/* ------------------------------------------------------------------ player */

const clock = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return '0:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    return h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
        : `${m}:${String(sec).padStart(2, '0')}`;
};

const IcoPlay = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const IcoPause = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>
);
const IcoSound = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 5V4L8 9H4zm12.5 3a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z" /></svg>
);
const IcoMute = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M4 9v6h4l5 5V4L8 9H4zm15.5 3l2.3-2.3-1.2-1.2-2.3 2.3-2.3-2.3-1.2 1.2 2.3 2.3-2.3 2.3 1.2 1.2 2.3-2.3 2.3 2.3 1.2-1.2-2.3-2.3z" /></svg>
);
const IcoFull = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4" />
    </svg>
);
const IcoClose = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);
const IcoKick = (p: { className?: string }) => (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h11a5 5 0 015 5v8a5 5 0 01-5 5H9l-5 4V3zm6 5v2h4v2h-4v2h4v2h-4v1H8V8h2z" /></svg>
);

const InSitePlayer: React.FC = () => {
    const req = useSyncExternalStore(subscribe, snapshot, snapshot);
    const videoRef = useRef<HTMLVideoElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const hideTimer = useRef<number | undefined>(undefined);
    const hlsRef = useRef<Hls | null>(null);
    const [playing, setPlaying] = useState(false);
    const [started, setStarted] = useState(false);
    const [muted, setMuted] = useState(false);
    const [time, setTime] = useState(0);
    const [dur, setDur] = useState(0);
    const [bars, setBars] = useState(true);
    const [failed, setFailed] = useState(false);

    /* --- teardown + attach, one effect per opened item ---------------- */
    useEffect(() => {
        if (!req) return;
        setPlaying(false); setStarted(false); setMuted(false);
        setTime(0); setDur(0); setBars(true); setFailed(false);

        const video = videoRef.current;
        let cancelled = false;
        if (video && !req.embedOnly) {
            const url = req.src;
            // Safari plays HLS natively; everything else needs hls.js, which is
            // ~170 kB — so it is fetched only once a visitor actually plays.
            if (!url.endsWith('.m3u8') || video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else {
                import('hls.js')
                    .then(({ default: HlsCtor }) => {
                        if (cancelled || !videoRef.current) return;
                        if (!HlsCtor.isSupported()) { setFailed(true); return; }
                        const hls = new HlsCtor({ maxBufferLength: 60, enableWorker: true });
                        hlsRef.current = hls;
                        hls.on(HlsCtor.Events.ERROR, (_e, d) => { if (d.fatal) setFailed(true); });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                    })
                    .catch(() => setFailed(true));
            }
        }

        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeInSite(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
            cancelled = true;
            hlsRef.current?.destroy();
            hlsRef.current = null;
            if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
        };
    }, [req?.key]);

    /* --- reveal the bars after a beat of silence while playing -------- */
    const poke = useCallback(() => {
        setBars(true);
        window.clearTimeout(hideTimer.current);
        if (playing) hideTimer.current = window.setTimeout(() => setBars(false), 2600);
    }, [playing]);

    useEffect(() => { poke(); }, [poke]);

    const toggle = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play().catch(() => undefined); setStarted(true); }
        else v.pause();
    }, []);

    const seek = (v: number) => {
        const el = videoRef.current;
        if (!el || !Number.isFinite(el.duration)) return;
        el.currentTime = (v / 1000) * el.duration;
    };

    if (!req) return null;

    const pct = dur > 0 ? (time / dur) * 100 : 0;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/88 backdrop-blur-md animate-fade-in"
            role="dialog" aria-modal="true" aria-label={req.title}
            onMouseMove={poke}
        >
            <div className="absolute inset-0" onClick={closeInSite} aria-hidden="true" />

            <div className="relative w-full max-w-6xl">
                <div className="absolute -inset-6 rounded-[40px] bg-[#F2B33D]/12 blur-3xl pointer-events-none" aria-hidden="true" />

                <div className="relative rounded-3xl overflow-hidden border border-[#F2B33D]/25 bg-[#08060A] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.95)]">
                    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 h-12 sm:h-14 border-b border-white/[0.07] bg-white/[0.03]">
                        <div className="min-w-0 flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg shrink-0 bg-[#F2B33D]/15 border border-[#F2B33D]/45 flex items-center justify-center">
                                <IcoKick className="w-3.5 h-3.5 text-[#F2CE7C]" />
                            </span>
                            <p className="text-[12px] sm:text-sm font-black text-white truncate" dir="auto">{req.title}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <a href={req.kickUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-lg bg-white/[0.05] border border-white/12 text-white/70 hover:text-white hover:border-[#F2B33D]/50 transition-colors text-[10px] sm:text-[11px] font-black"
                                title="افتح في كيك">
                                <IcoKick className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline" dir="ltr">KICK</span>
                            </a>
                            <button type="button" onClick={closeInSite} aria-label="إغلاق"
                                className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/12 flex items-center justify-center text-white/70 hover:text-white hover:border-red-400/50 transition-colors">
                                <IcoClose className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* stage */}
                    <div ref={shellRef} className="relative bg-black aspect-video">
                        {req.embedOnly ? (
                            <iframe
                                src={`${req.src}?autoplay=true`}
                                title={req.title}
                                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full border-0"
                            />
                        ) : failed ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-6">
                                <p className="text-sm font-black text-white/85">تعذّر تشغيل المقطع هنا</p>
                                <a href={req.kickUrl} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[13px] text-[#08060A]"
                                    style={{ background: 'linear-gradient(180deg,#FDEFC9,#F2B33D 55%,#B8862B)' }}>
                                    <IcoKick className="w-4 h-4" />شاهده على كيك
                                </a>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    playsInline
                                    poster={req.poster}
                                    className="absolute inset-0 w-full h-full bg-black"
                                    onClick={toggle}
                                    onPlay={() => { setPlaying(true); setStarted(true); }}
                                    onPause={() => setPlaying(false)}
                                    onEnded={() => setPlaying(false)}
                                    onVolumeChange={(e) => setMuted((e.target as HTMLVideoElement).muted)}
                                    onTimeUpdate={(e) => setTime((e.target as HTMLVideoElement).currentTime)}
                                    onLoadedMetadata={(e) => setDur((e.target as HTMLVideoElement).duration || 0)}
                                />
                                {/* big centre button until the first play */}
                                {!started && (
                                    <button type="button" onClick={toggle} aria-label="تشغيل"
                                        className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F2B33D]/22 backdrop-blur-md border border-[#F2B33D]/70 flex items-center justify-center shadow-[0_0_50px_rgba(242,179,61,0.55)] hover:scale-110 transition-transform">
                                        <IcoPlay className="w-7 h-7 sm:w-8 sm:h-8 text-white translate-x-[2px]" />
                                    </button>
                                )}
                                {started && !playing && (
                                    <button type="button" onClick={toggle} aria-label="تشغيل"
                                        className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/55 backdrop-blur-md border border-[#F2B33D]/60 flex items-center justify-center hover:scale-110 transition-transform">
                                        <IcoPlay className="w-7 h-7 sm:w-8 sm:h-8 text-white translate-x-[2px]" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* controls */}
                    {!req.embedOnly && !failed && (
                        <div
                            className={`absolute inset-x-0 bottom-0 px-3 sm:px-5 pb-3 pt-10 bg-gradient-to-t from-black via-black/85 to-transparent transition-opacity duration-300 ${bars ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <input
                                type="range" min={0} max={1000} value={dur > 0 ? Math.round(pct * 10) : 0}
                                onChange={(e) => seek(Number(e.target.value))}
                                aria-label="شريط التقدم"
                                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F2CE7C]
                                    [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(242,179,61,0.9)]
                                    [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:border-0
                                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#F2CE7C]"
                                style={{
                                    background: `linear-gradient(90deg,#F2B33D 0%,#F2CE7C ${pct}%, rgba(255,255,255,0.16) ${pct}%, rgba(255,255,255,0.16) 100%)`,
                                }}
                            />
                            <div className="mt-2.5 flex items-center gap-2 sm:gap-3">
                                <button type="button" onClick={toggle} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
                                    className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.07] border border-white/12 flex items-center justify-center text-white hover:border-[#F2B33D]/60 transition-colors">
                                    {playing ? <IcoPause className="w-4 h-4" /> : <IcoPlay className="w-4 h-4 translate-x-[1px]" />}
                                </button>
                                <button type="button" aria-label="الصوت"
                                    onClick={() => { const v = videoRef.current; if (v) { v.muted = !v.muted; setMuted(v.muted); } }}
                                    className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.07] border border-white/12 flex items-center justify-center text-white hover:border-[#F2B33D]/60 transition-colors">
                                    {muted ? <IcoMute className="w-4 h-4" /> : <IcoSound className="w-4 h-4" />}
                                </button>
                                <span className="text-[11px] sm:text-xs font-black text-white/70 tabular-nums shrink-0" dir="ltr">
                                    {clock(time)} <span className="text-white/30">/ {clock(dur)}</span>
                                </span>
                                <button type="button" aria-label="ملء الشاشة"
                                    onClick={() => {
                                        const el = shellRef.current;
                                        if (!el) return;
                                        if (document.fullscreenElement) document.exitFullscreen();
                                        else el.requestFullscreen?.().catch(() => undefined);
                                    }}
                                    className="ms-auto w-9 h-9 shrink-0 rounded-lg bg-white/[0.07] border border-white/12 flex items-center justify-center text-white hover:border-[#F2B33D]/60 transition-colors">
                                    <IcoFull className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-3 text-center text-[11px] text-white/35" dir="auto">
                    {req.embedOnly
                        ? 'هذا البث للمشتركين — التشغيل يتم عبر مشغل كيك الرسمي.'
                        : 'يشتغل داخل الموقع مباشرة بدون تحويل إلى كيك.'}
                </p>
            </div>
        </div>
    );
};

export default InSitePlayer;
