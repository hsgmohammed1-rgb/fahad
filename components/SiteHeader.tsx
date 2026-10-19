import React, { useEffect, useState } from 'react';
import type { Language } from '../types';

interface SiteHeaderProps {
    lang: Language;
    onToggleLang: () => void;
    profileImage: string;
    headerTitle: string;
    isLive: boolean;
    viewers: number;
    statusText: string;
    onRefresh: () => void;
}

/* Every real section on the page — direct navigation in page order */
const NAV_DEFS = [
    {
        href: '#top', id: 'top', ar: 'الرئيسية', en: 'Home',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></svg>,
    },
    {
        href: '#socials', id: 'socials', ar: 'التواصل', en: 'Socials',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.8-3 2.9-4.5 5.5-4.5s4.7 1.5 5.5 4.5" /><circle cx="17" cy="9" r="2.4" /><path d="M16 14.6c2.3.2 3.9 1.6 4.5 4" /></svg>,
    },
    {
        href: '#live', id: 'live', ar: 'البث', en: 'Live',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="13" rx="3" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" /><path d="M8 21h8" /></svg>,
    },
    {
        href: '#community', id: 'community', ar: 'المجتمع', en: 'Community',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" /></svg>,
    },
    {
        href: '#support', id: 'support', ar: 'الدعم', en: 'Support',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10.3C4.5 6.6 6.7 5 8.8 5c1.4 0 2.6.7 3.2 1.8C12.6 5.7 13.8 5 15.2 5c2.1 0 4.3 1.6 4.3 4.7C19.5 15.4 12 20 12 20z" /></svg>,
    },
    {
        href: '#album', id: 'album', ar: 'سيرة', en: 'Sirah',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="10.5" r="1.8" /><path d="M21 15.5l-4.5-4.5L7 19" /></svg>,
    },
    {
        href: '#honor', id: 'honor', ar: 'الشرف', en: 'Honor',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 01-10 0V4z" /><path d="M7 6H4a1 1 0 00-1 1c0 2.5 2 4.5 5 4.5M17 6h3a1 1 0 011 1c0 2.5-2 4.5-5 4.5" /></svg>,
    },
    {
        href: '#archive', id: 'archive', ar: 'الأرشيف', en: 'Archive',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></svg>,
    },
    {
        href: '#story', id: 'story', ar: 'السيرة', en: 'Story',
        icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3.2c-2.6 3.4-4.2 6-4.2 8.4a4.2 4.2 0 008.4 0c0-2.4-1.6-5-4.2-8.4z" /><path d="M5 20h14" /></svg>,
    },
] as const;

/**
 * FAHAD top bar — "Sovereign Dock" edition (obsidian gold rebuild).
 * - No search: every page section is one tap away.
 * - Segmented-control nav with a sliding radiant-gold active pill.
 * - Slim floating dock, radiant hairline, aurora glow, live-first brand.
 */
export const SiteHeader: React.FC<SiteHeaderProps> = ({
    lang, onToggleLang, profileImage, headerTitle, isLive, viewers, statusText, onRefresh,
}) => {
    const [open, setOpen] = useState(false);
    const [compact, setCompact] = useState(false);
    const [hash, setHash] = useState('');

    useEffect(() => {
        const onScroll = () => setCompact(window.scrollY > 32);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const read = () => setHash(window.location.hash);
        read();
        window.addEventListener('hashchange', read);
        return () => window.removeEventListener('hashchange', read);
    }, []);

    /* Active section spy across all five sections */
    useEffect(() => {
        const els = NAV_DEFS
            .map((n) => document.getElementById(n.id))
            .filter(Boolean) as HTMLElement[];
        if (!els.length || typeof IntersectionObserver === 'undefined') return;
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) setHash(`#${e.target.id}`); }),
            { rootMargin: '-30% 0px -60% 0px', threshold: 0.05 }
        );
        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [isLive]);

    /* Escape closes the mobile menu */
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open ]);

    /* Mobile strip shares the same panel state as the tablet burger */
    const isAr = lang === 'ar';
    const activeHash = hash === '' ? '#top' : hash;
    const viewersLabel = viewers > 0 ? viewers.toLocaleString('en-US') : '';
    const activeNav = NAV_DEFS.find((n) => n.href === activeHash) || NAV_DEFS[0];

    const goTo = (id: string) => {
        setOpen(false);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        else window.location.hash = `#${id}`;
        (document.activeElement as HTMLElement | null)?.blur?.();
    };

    return (
        <>
            <style>{`
            .dock{--radiant:#F2B33D;--radiant-lt:#F7E3B0;--radiant-dk:#8A6320;--antique:#B8862B;--antique-lt:#F2CE7C;--pale:#FDEFC9}
            .dock-shell{position:sticky;top:12px;z-index:60;width:min(1240px,calc(100% - 16px));margin:12px auto 0;
                animation:dock-in .9s cubic-bezier(.16,1,.3,1) both}
            @keyframes dock-in{from{opacity:0;transform:translateY(-16px);filter:blur(4px)}to{opacity:1;transform:translateY(0);filter:blur(0)}}
            /* radiant-gold hairline wrapper */
            .dock-frame{border-radius:24px;padding:1px;
                background:linear-gradient(135deg,rgba(247,227,176,.75),rgba(242,179,61,.5) 22%,rgba(184,134,43,.3) 42%,rgba(255,255,255,.08) 52%,rgba(184,134,43,.3) 62%,rgba(242,179,61,.5) 80%,rgba(247,227,176,.75));
                box-shadow:0 24px 60px rgba(0,0,0,.65),0 0 48px -12px rgba(242,179,61,.42)}
            .dock-bar{position:relative;border-radius:23px;overflow:hidden;
                background:linear-gradient(180deg,rgba(24,19,12,.93),rgba(6,5,8,.95));
                backdrop-filter:blur(24px) saturate(1.25);-webkit-backdrop-filter:blur(24px) saturate(1.25)}
            /* aurora wash + top light line */
            .dock-aurora{position:absolute;inset:0;pointer-events:none;
                background:radial-gradient(440px 130px at 12% -20%,rgba(242,179,61,.2),transparent 65%),
                           radial-gradient(440px 130px at 88% -25%,rgba(224,123,18,.14),transparent 65%);
                animation:dock-aurora 18s ease-in-out infinite alternate}
            @keyframes dock-aurora{from{opacity:.7;transform:translateX(-2%)}to{opacity:1;transform:translateX(2%)}}
            .dock-bar::before{content:"";position:absolute;top:0;left:8%;right:8%;height:1px;border-radius:99px;
                background:linear-gradient(90deg,transparent,rgba(253,239,201,.85),rgba(242,179,61,.8),transparent);pointer-events:none}
            .dock-row{display:flex;align-items:center;gap:10px;min-height:68px;padding:8px 12px;transition:min-height .35s ease}
            .dock-shell.is-compact .dock-row{min-height:58px}
            @media(min-width:768px){.dock-row{padding:8px 14px;gap:12px}}
            /* brand */
            .dock-brand{display:flex;align-items:center;gap:11px;text-decoration:none;min-width:0;flex:none}
            .dock-emblem{position:relative;width:48px;height:48px;flex:none;border-radius:16px;overflow:visible;
                border:1px solid rgba(242,179,61,.5);background:#08060A;
                box-shadow:0 10px 26px -10px rgba(242,179,61,.6),inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(184,134,43,.25);
                transition:transform .3s ease,box-shadow .3s ease}
            .dock-shell.is-compact .dock-emblem{width:42px;height:42px}
            .dock-brand:hover .dock-emblem{transform:translateY(-1px);box-shadow:0 14px 30px -10px rgba(242,179,61,.7),inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(184,134,43,.4)}
            .dock-emblem img{width:100%;height:100%;object-fit:cover;border-radius:15px;display:block}
            .dock-emblem::before{content:"";position:absolute;inset:-5px;border-radius:20px;padding:1.5px;
                background:conic-gradient(from 0deg,transparent 0 68%,rgba(242,179,61,.85) 80%,rgba(242,206,124,.95) 88%,transparent 96%);
                -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
                animation:dock-spin 12s linear infinite;pointer-events:none;opacity:.9}
            @keyframes dock-spin{to{transform:rotate(360deg)}}
            .dock-dot{position:absolute;bottom:-4px;inset-inline-end:-4px;width:15px;height:15px;border-radius:99px;
                border:3px solid #08060A;background:#4A4238;z-index:2}
            .dock-dot.on{background:#F2B33D;box-shadow:0 0 0 3px rgba(242,179,61,.2),0 0 14px #F2B33D;animation:dock-pulse 3s ease-in-out infinite}
            @keyframes dock-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.1);opacity:.85}}
            .dock-word{display:flex;flex-direction:column;line-height:1.1;min-width:0}
            .dock-word b{font-size:20px;font-weight:900;letter-spacing:.14em;
                background:linear-gradient(135deg,#FFFDF7 0%,#FDEFC9 40%,#F2B33D 70%,#B8862B 100%);
                -webkit-background-clip:text;background-clip:text;color:transparent;
                filter:drop-shadow(0 2px 12px rgba(242,179,61,.5))}
            .dock-shell.is-compact .dock-word b{font-size:17px}
            .dock-live{display:inline-flex;align-items:center;gap:6px;margin-top:4px;font-size:10px;font-weight:800;white-space:nowrap}
            .dock-live i{width:6px;height:6px;border-radius:99px;background:#6B6255;flex:none}
            .dock-live.on{color:#F5D98C}.dock-live.on i{background:#F2B33D;box-shadow:0 0 8px #F2B33D;animation:dock-pulse 3s ease-in-out infinite}
            .dock-live.off{color:rgba(247,227,176,.85)}
            /* segmented nav — radiant gold core */
            .dock-nav{flex:1;min-width:0;display:none;align-items:center;justify-content:center}
            @media(min-width:1024px){.dock-nav{display:flex}}
            .dock-seg{display:flex;align-items:center;gap:2px;padding:4px;border-radius:99px;max-width:100%;
                background:rgba(242,179,61,.06);border:1px solid rgba(242,179,61,.16);
                box-shadow:inset 0 2px 10px rgba(0,0,0,.5);
                overflow-x:auto;scrollbar-width:none;
                mask-image:linear-gradient(to right,#000 92%,transparent);
                -webkit-mask-image:linear-gradient(to right,#000 92%,transparent)}
            [dir="rtl"] .dock-seg{mask-image:linear-gradient(to left,#000 92%,transparent);-webkit-mask-image:linear-gradient(to left,#000 92%,transparent)}
            .dock-seg::-webkit-scrollbar{display:none}
            .dock-link{display:inline-flex;flex:none;align-items:center;gap:6px;padding:9px 13px;border-radius:99px;
                font-size:12.5px;font-weight:800;color:rgba(255,255,255,.62);text-decoration:none;white-space:nowrap;
                transition:color .3s ease,background .3s ease,transform .3s ease,box-shadow .3s ease}
            .dock-link svg{color:rgba(247,227,176,.6);transition:color .3s ease,transform .3s ease}
            .dock-link:hover{color:#FFFDF7;background:rgba(242,179,61,.12)}
            .dock-link:hover svg{color:#FDEFC9;transform:scale(1.12)}
            .dock-link:active{transform:scale(.97)}
            .dock-link.is-active{color:#08060A;background:linear-gradient(180deg,#FDEFC9,#F2B33D 52%,#B8862B);
                box-shadow:0 6px 18px -6px rgba(242,179,61,.8),inset 0 1px 0 rgba(255,255,255,.6),0 0 0 1px rgba(247,227,176,.35)}
            .dock-link.is-active svg{color:#08060A}
            @media(min-width:1024px) and (max-width:1279px){.dock-link{padding:9px 12px;font-size:12px;gap:5px}}
            /* actions */
            .dock-actions{flex:none;display:flex;align-items:center;gap:8px;margin-inline-start:auto}
            .dock-iconbtn{width:44px;height:44px;flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:14px;
                background:rgba(242,179,61,.07);border:1px solid rgba(242,179,61,.2);color:rgba(255,255,255,.78);
                cursor:pointer;transition:all .3s ease}
            .dock-iconbtn:hover{color:#FDEFC9;border-color:rgba(242,179,61,.55);background:rgba(242,179,61,.14);transform:translateY(-1px)}
            .dock-iconbtn:active{transform:scale(.95)}
            .dock-discord{border-color:rgba(88,101,242,.35);background:rgba(88,101,242,.09);color:#A5ABF5}
            .dock-discord:hover{border-color:rgba(88,101,242,.75);background:rgba(88,101,242,.2);color:#C7CBFB;
                box-shadow:0 0 22px -6px rgba(88,101,242,.7)}
            .dock-support{border-color:rgba(242,179,61,.42);background:rgba(242,179,61,.12);color:#FDEFC9}
            .dock-support:hover{border-color:rgba(247,227,176,.85);background:rgba(242,179,61,.22);color:#FFFDF7;
                box-shadow:0 0 22px -6px rgba(242,179,61,.8)}
            @media(max-width:639px){.dock-discord,.dock-support{display:none}}
            .dock-lang{height:44px;padding:0 14px;border-radius:14px;display:none;align-items:center;gap:7px;
                background:rgba(242,179,61,.07);border:1px solid rgba(242,179,61,.2);color:#FDEFC9;
                font-size:12.5px;font-weight:800;cursor:pointer;transition:all .3s ease;white-space:nowrap;font-family:inherit}
            @media(min-width:1024px){.dock-lang{display:inline-flex}}
            .dock-lang:hover{border-color:rgba(242,179,61,.6);background:rgba(242,179,61,.14);transform:translateY(-1px)}
            .dock-cta{display:none;position:relative;overflow:hidden;align-items:center;gap:9px;height:46px;padding:0 20px 0 12px;border-radius:15px;text-decoration:none;
                background:linear-gradient(180deg,#FDEFC9 0%,#F2B33D 52%,#B8862B 100%);color:#08060A;font-size:13px;font-weight:900;
                box-shadow:0 12px 28px -8px rgba(242,179,61,.72),inset 0 1px 0 rgba(255,255,255,.6),0 0 0 1px rgba(247,227,176,.35);
                transition:filter .3s ease,transform .3s ease,box-shadow .3s ease;white-space:nowrap}
            @media(min-width:768px){.dock-cta{display:inline-flex}}
            .dock-cta:hover{filter:brightness(1.08);transform:translateY(-1px);box-shadow:0 16px 34px -8px rgba(242,179,61,.82),inset 0 1px 0 rgba(255,255,255,.6),0 0 30px -6px rgba(242,179,61,.65)}
            .dock-cta:active{transform:scale(.97)}
            .dock-cta::after{content:"";position:absolute;top:-20%;bottom:-20%;width:38%;left:-60%;z-index:1;pointer-events:none;
                background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-18deg);
                animation:dock-shine 5s ease-in-out infinite}
            @keyframes dock-shine{0%{left:-60%;opacity:0}12%{opacity:1}32%,100%{left:135%;opacity:0}}
            .dock-cta .play{width:26px;height:26px;border-radius:99px;background:#08060A;color:#FDEFC9;
                display:inline-flex;align-items:center;justify-content:center;flex:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
            .dock-burger{display:inline-flex}
            @media(min-width:1024px){.dock-burger{display:none}}
            /* scrollable section strip (tablet + mobile): all sections, no menu needed */
            .dock-strip{display:flex;gap:6px;overflow-x:auto;padding:0 10px 10px;scrollbar-width:none;
                mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent);
                -webkit-mask-image:linear-gradient(to right,transparent,#000 6%,#000 94%,transparent)}
            .dock-strip::-webkit-scrollbar{display:none}
            @media(min-width:1024px){.dock-strip{display:none}}
            .dock-chip{flex:none;display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:99px;
                font-size:12.5px;font-weight:800;color:rgba(255,255,255,.62);text-decoration:none;white-space:nowrap;
                background:rgba(242,179,61,.06);border:1px solid rgba(242,179,61,.16);transition:all .3s ease}
            .dock-chip svg{color:rgba(247,227,176,.6);transition:color .3s ease}
            .dock-chip.is-active{color:#08060A;background:linear-gradient(180deg,#FDEFC9,#F2B33D 52%,#B8862B);border-color:transparent;
                box-shadow:0 6px 16px -6px rgba(242,179,61,.8)}
            .dock-chip.is-active svg{color:#08060A}
            /* mobile menu panel */
            .dock-menu{display:grid;grid-template-rows:0fr;opacity:0;transition:grid-template-rows .4s cubic-bezier(.16,1,.3,1),opacity .3s,margin .35s}
            .dock-menu.open{grid-template-rows:1fr;opacity:1;margin-top:8px}
            .dock-menu-in{overflow:hidden}
            .dock-panel{border-radius:18px;padding:1px;background:linear-gradient(140deg,rgba(242,179,61,.45),rgba(184,134,43,.2) 45%,rgba(242,179,61,.45))}
            .dock-panel-in{border-radius:17px;padding:12px;display:flex;flex-direction:column;gap:8px;
                background:linear-gradient(180deg,rgba(16,13,9,.98),rgba(6,5,8,.98))}
            .dock-mhead{display:flex;align-items:center;gap:12px;padding:4px 6px 10px;border-bottom:1px solid rgba(242,179,61,.12)}
            .dock-mhead img{width:44px;height:44px;border-radius:13px;object-fit:cover;border:1px solid rgba(242,179,61,.45)}
            .dock-mhead b{display:block;font-size:14px;letter-spacing:.14em;color:#fff}
            .dock-mhead small{display:block;font-size:11px;color:rgba(255,255,255,.45);margin-top:3px}
            .dock-mrow{display:flex;align-items:center;gap:12px;width:100%;min-height:50px;padding:12px 15px;font-size:14px;font-weight:800;
                color:rgba(255,255,255,.78);border:1px solid rgba(242,179,61,.12);border-radius:14px;background:rgba(242,179,61,.04);
                text-align:start;text-decoration:none;cursor:pointer;font-family:inherit;transition:all .3s ease}
            .dock-mrow svg{color:rgba(247,227,176,.62);transition:color .3s ease}
            .dock-mrow:hover,.dock-mrow.is-active{color:#FDEFC9;border-color:rgba(242,179,61,.5);background:rgba(242,179,61,.11)}
            .dock-mrow:hover svg,.dock-mrow.is-active svg{color:#FDEFC9}
            .dock-mrow.gold{color:#08060A;background:linear-gradient(180deg,#FDEFC9,#F2B33D 52%,#B8862B);border-color:transparent;font-weight:900}
            .dock-mrow.gold svg{color:#08060A}
            /* ===== PHONE EDITION: slim top strip — only the sections button ===== */
            @media(max-width:767px){.dock-desk{display:none}}
            .dock-mob{position:sticky;top:0;z-index:60;display:block}
            @media(min-width:768px){.dock-mob{display:none}}
            .dock-mob-shell{position:relative;width:100%;
                animation:dock-in .8s cubic-bezier(.16,1,.3,1) both}
            .dock-mob-bar{position:relative}
            .dock-mob-row{position:relative;z-index:1;display:flex;align-items:center;padding:10px 12px}
            /* soft aurora puddle so the pill never floats on dead black */
            .dock-mob-row::before{content:"";position:absolute;inset-inline-start:-14px;top:50%;width:230px;height:86px;
                transform:translateY(-50%);pointer-events:none;
                background:radial-gradient(closest-side,rgba(242,179,61,.26),transparent 72%);
                -webkit-mask-image:radial-gradient(closest-side,#000,transparent 72%);
                mask-image:radial-gradient(closest-side,#000,transparent 72%)}
            /* the one and only phone control */
            .dock-mob-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:10px;
                height:48px;padding:0 15px 0 9px;border-radius:99px;cursor:pointer;font-family:inherit;
                color:#08060A;background:linear-gradient(180deg,#FDEFC9 0%,#F2B33D 52%,#B8862B 100%);
                border:1px solid rgba(247,227,176,.38);
                box-shadow:0 20px 40px -14px rgba(242,179,61,.85),0 12px 28px -16px rgba(0,0,0,.95),
                    inset 0 1px 0 rgba(255,255,255,.6),0 0 34px -10px rgba(242,179,61,.6);
                transition:transform .3s ease,box-shadow .3s ease}
            .dock-mob-btn:active{transform:scale(.97)}
            .dock-mob-btn::after{content:"";position:absolute;top:-40%;bottom:-40%;width:34%;left:-75%;z-index:0;pointer-events:none;
                background:linear-gradient(105deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-18deg);
                animation:mob-shine 5.5s ease-in-out infinite}
            @keyframes mob-shine{0%{left:-75%;opacity:0}14%{opacity:1}36%,100%{left:150%;opacity:0}}
            .dock-mob-btn>*{position:relative;z-index:1}
            .dock-mob-btn-ic{position:relative;width:32px;height:32px;border-radius:11px;flex:none;display:inline-flex;align-items:center;justify-content:center;
                background:#08060A;color:#FDEFC9;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 0 0 1px rgba(247,227,176,.25)}
            .dock-mob-btn-ic::before{content:"";position:absolute;inset:-4px;border-radius:14px;padding:1.5px;
                background:conic-gradient(from 0deg,transparent 0 62%,rgba(242,179,61,.95) 78%,rgba(253,239,201,1) 88%,transparent 96%);
                -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
                animation:dock-spin 12s linear infinite;opacity:.9}
            .dock-mob-btn-tx{display:flex;flex-direction:column;align-items:start;line-height:1.1;gap:1px}
            .dock-mob-btn-tx b{font-size:13.5px;font-weight:900;white-space:nowrap}
            .dock-mob-btn-tx small{font-size:9.5px;font-weight:800;letter-spacing:.06em;opacity:.75;white-space:nowrap;
                max-width:44vw;overflow:hidden;text-overflow:ellipsis}
            .dock-mob-chev{flex:none;display:inline-flex;transition:transform .4s cubic-bezier(.16,1,.3,1)}
            .dock-mob.is-open .dock-mob-chev{transform:rotate(180deg)}
            /* dropdown panel */
            .dock-mob-menu{display:grid;grid-template-rows:0fr;opacity:0;
                transition:grid-template-rows .42s cubic-bezier(.16,1,.3,1),opacity .3s ease}
            .dock-mob.is-open .dock-mob-menu{grid-template-rows:1fr;opacity:1}
            .dock-mob-menu-in{overflow:hidden}
            .dock-mob-panel{margin:8px 12px 12px;border-radius:22px;padding:1px;
                background:linear-gradient(150deg,rgba(247,227,176,.7),rgba(242,179,61,.4) 35%,rgba(184,134,43,.25) 50%,rgba(242,179,61,.4) 68%,rgba(247,227,176,.7));
                box-shadow:0 26px 60px -22px rgba(0,0,0,.95),0 0 40px -18px rgba(242,179,61,.5)}
            .dock-mob-panel-in{border-radius:21px;padding:12px;max-height:min(74vh,560px);overflow-y:auto;overscroll-behavior:contain;
                -webkit-overflow-scrolling:touch;
                background:linear-gradient(180deg,rgba(24,19,12,.99),rgba(6,5,8,.99))}
            .dock-mob-head{display:flex;align-items:center;gap:12px;padding:2px 4px 11px;margin-bottom:11px;border-bottom:1px solid rgba(242,179,61,.15)}
            .dock-mob-head img{width:44px;height:44px;border-radius:14px;object-fit:cover;flex:none;border:1px solid rgba(242,179,61,.5)}
            .dock-mob-head b{display:block;font-size:14px;letter-spacing:.15em;
                background:linear-gradient(135deg,#FFFDF7,#F2B33D);-webkit-background-clip:text;background-clip:text;color:transparent}
            .dock-mob-head small{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(255,255,255,.45);margin-top:4px}
            .dock-mob-head small i{width:6px;height:6px;border-radius:99px;background:#6B6255;flex:none}
            .dock-mob-head small.on{color:#F5D98C}
            .dock-mob-head small.on i{background:#F2B33D;box-shadow:0 0 8px #F2B33D;animation:dock-pulse 3s ease-in-out infinite}
            .dock-mob-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
            .dock-tile{position:relative;display:flex;align-items:center;gap:10px;width:100%;padding:13px 12px;border-radius:18px;
                border:1px solid rgba(242,179,61,.16);background:rgba(242,179,61,.06);color:rgba(255,255,255,.82);
                font-family:inherit;font-size:13.5px;font-weight:800;text-align:start;cursor:pointer;
                transition:transform .3s ease,background .3s ease,border-color .3s ease,color .3s ease,box-shadow .3s ease}
            .dock-tile svg{color:rgba(247,227,176,.65);flex:none;transition:color .3s ease}
            .dock-tile:active{transform:scale(.97)}
            .dock-tile.is-active{color:#08060A;background:linear-gradient(180deg,#FDEFC9,#F2B33D 52%,#B8862B);
                border-color:transparent;box-shadow:0 12px 28px -12px rgba(242,179,61,.9)}
            .dock-tile.is-active svg{color:#08060A}
            .dock-tile-n{position:absolute;top:6px;inset-inline-end:9px;font-size:9px;font-weight:900;letter-spacing:.14em;
                color:rgba(255,255,255,.24)}
            .dock-tile.is-active .dock-tile-n{color:rgba(8,6,10,.45)}
            .dock-mob-cta{position:relative;overflow:hidden;margin-top:11px;display:flex;align-items:center;justify-content:center;gap:9px;
                width:100%;height:52px;border-radius:18px;text-decoration:none;color:#08060A;font-size:14px;font-weight:900;
                background:linear-gradient(180deg,#FDEFC9 0%,#F2B33D 52%,#B8862B 100%);
                box-shadow:0 16px 34px -12px rgba(242,179,61,.85),inset 0 1px 0 rgba(255,255,255,.6)}
            .dock-mob-cta:active{transform:scale(.985)}
            .dock-mob-acts{display:flex;gap:9px;margin-top:9px}
            .dock-mob-act{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;height:46px;border-radius:15px;
                font-family:inherit;font-size:12.5px;font-weight:800;cursor:pointer;color:rgba(255,255,255,.72);
                background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);transition:all .3s ease}
            .dock-mob-act:active{transform:scale(.97);border-color:rgba(242,179,61,.55);color:#FDEFC9}
            @media(prefers-reduced-motion:reduce){.dock-mob-shell{animation:none}.dock-mob-btn::after{animation:none}}
            a:focus-visible,button:focus-visible{outline:2px solid #F2B33D;outline-offset:2px;border-radius:10px}
            @media(prefers-reduced-motion:reduce){.dock-shell,.dock-menu,.dock-aurora{animation:none;transition:none}.dock-dot.on,.dock-live.on i{animation:none}}
            `}</style>

            <header className={`dock dock-shell dock-desk${compact ? ' is-compact' : ''}`}>
                <div className="dock-frame">
                    <div className="dock-bar">
                        <span className="dock-aurora" aria-hidden="true" />
                        <div className="dock-row">
                            {/* Brand + live */}
                            <a href="#top" className="dock-brand" aria-label="FAHAD — home">
                                <span className="dock-emblem">
                                    <img src={profileImage} alt="FAHAD emblem" loading="eager" />
                                    <span className={`dock-dot${isLive ? ' on' : ''}`} aria-hidden="true" />
                                </span>
                                <span className="dock-word" dir="ltr">
                                    <b>FAHAD</b>
                                    <span className={`dock-live${isLive ? ' on' : ' off'}`} role="status" aria-live="polite">
                                        <i aria-hidden="true" />
                                        <span>{isLive ? `${statusText}${viewersLabel ? ` • ${viewersLabel}` : ''}` : statusText}</span>
                                    </span>
                                </span>
                            </a>

                            {/* Full sections — segmented control */}
                            <nav className="dock-nav" aria-label="Primary" dir={isAr ? 'rtl' : 'ltr'}>
                                <div className="dock-seg" role="list">
                                    {NAV_DEFS.map((n) => (
                                        <a
                                            key={n.href}
                                            href={n.href}
                                            aria-current={activeHash === n.href ? 'page' : undefined}
                                            className={`dock-link${activeHash === n.href ? ' is-active' : ''}`}
                                        >
                                            {n.icon}
                                            <span>{isAr ? n.ar : n.en}</span>
                                        </a>
                                    ))}
                                </div>
                            </nav>

                            {/* Actions */}
                            <div className="dock-actions">
                                <button type="button" className="dock-lang" onClick={onToggleLang} aria-label={isAr ? 'Switch to English' : 'التبديل إلى العربية'}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" /></svg>
                                    <span>{isAr ? 'EN' : 'عربي'}</span>
                                </button>

                                <button type="button" className="dock-iconbtn hidden xl:inline-flex" onClick={onRefresh} title={isAr ? 'تحديث الحالة' : 'Refresh status'} aria-label={isAr ? 'تحديث الحالة' : 'Refresh status'}>
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </button>

                                <a href="https://discord.com/invite/HYByGx8mQA" target="_blank" rel="noopener noreferrer" className="dock-iconbtn dock-discord"
                                    title={isAr ? 'ديسكورد فهد' : 'FAHAD Discord'} aria-label={isAr ? 'ديسكورد فهد' : 'FAHAD Discord'}>
                                    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" /></svg>
                                </a>

                                <a href="https://tip.dokan.sa/fahad89" target="_blank" rel="noopener noreferrer" className="dock-iconbtn dock-support"
                                    title={isAr ? 'ادعم فهد' : 'Support FAHAD'} aria-label={isAr ? 'ادعم فهد' : 'Support FAHAD'}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-7.5-10.3C4.5 6.6 6.7 5 8.8 5c1.4 0 2.6.7 3.2 1.8C12.6 5.7 13.8 5 15.2 5c2.1 0 4.3 1.6 4.3 4.7C19.5 15.4 12 20 12 20z" /></svg>
                                </a>

                                <a href="https://kick.com/fahad" target="_blank" rel="noopener noreferrer" className="dock-cta">
                                    <span className="play" aria-hidden="true">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                                    </span>
                                    {isAr ? 'شاهد البث' : 'Watch Live'}
                                </a>

                                <button type="button" className="dock-iconbtn dock-burger" onClick={() => setOpen((v) => !v)} aria-label={isAr ? 'القائمة' : 'Menu'} aria-expanded={open}>
                                    {open ? (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                                    ) : (
                                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Scrollable sections strip — tablet & mobile */}
                        <nav className="dock-strip" aria-label={isAr ? 'الأقسام' : 'Sections'} dir={isAr ? 'rtl' : 'ltr'}>
                            {NAV_DEFS.map((n) => (
                                <a
                                    key={n.href}
                                    href={n.href}
                                    aria-current={activeHash === n.href ? 'page' : undefined}
                                    className={`dock-chip${activeHash === n.href ? ' is-active' : ''}`}
                                >
                                    {n.icon}
                                    <span>{isAr ? n.ar : n.en}</span>
                                </a>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Mobile menu panel — all sections + actions */}
                <div className={`dock-menu${open ? ' open' : ''}`}>
                    <div className="dock-menu-in">
                        <div className="dock-panel">
                            <nav className="dock-panel-in" aria-label="Mobile" dir={isAr ? 'rtl' : 'ltr'}>
                                <div className="dock-mhead" dir={isAr ? 'rtl' : 'ltr'}>
                                    <img src={profileImage} alt="" loading="lazy" />
                                    <span>
                                        <b dir="ltr">FAHAD</b>
                                        <small dir="auto">{headerTitle}</small>
                                    </span>
                                </div>
                                {NAV_DEFS.map((n) => (
                                    <a
                                        key={n.href}
                                        href={n.href}
                                        onClick={() => goTo(n.id)}
                                        aria-current={activeHash === n.href ? 'page' : undefined}
                                        className={`dock-mrow${activeHash === n.href ? ' is-active' : ''}`}
                                    >
                                        {n.icon}
                                        <span>{isAr ? n.ar : n.en}</span>
                                    </a>
                                ))}
                                <a href="https://kick.com/fahad" target="_blank" rel="noopener noreferrer" className="dock-mrow gold" onClick={() => setOpen(false)}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                                    <span>{isAr ? 'شاهد البث المباشر' : 'Watch Live'}</span>
                                </a>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <a href="https://discord.com/invite/HYByGx8mQA" target="_blank" rel="noopener noreferrer" className="dock-mrow" onClick={() => setOpen(false)} style={{ flex: 1 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" /></svg>
                                        <span>Discord</span>
                                    </a>
                                    <a href="https://tip.dokan.sa/fahad89" target="_blank" rel="noopener noreferrer" className="dock-mrow" onClick={() => setOpen(false)} style={{ flex: 1 }}>
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-7.5-10.3C4.5 6.6 6.7 5 8.8 5c1.4 0 2.6.7 3.2 1.8C12.6 5.7 13.8 5 15.2 5c2.1 0 4.3 1.6 4.3 4.7C19.5 15.4 12 20 12 20z" /></svg>
                                        <span>{isAr ? 'الدعم' : 'Support'}</span>
                                    </a>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" onClick={() => { onToggleLang(); setOpen(false); }} className="dock-mrow" style={{ flex: 1 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" /></svg>
                                        <span>{isAr ? 'EN — English' : 'عربي'}</span>
                                    </button>
                                    <button type="button" onClick={() => { onRefresh(); setOpen(false); }} className="dock-mrow" style={{ flex: 1 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        <span>{isAr ? 'تحديث' : 'Refresh'}</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== PHONE EDITION: slim top strip with only the sections button ===== */}
            <div className={`dock-mob${open ? ' is-open' : ''}`}>
                <div className="dock-mob-shell">
                    <div className="dock-mob-bar">
                        <div className="dock-mob-row">
                            <button
                                type="button"
                                className="dock-mob-btn"
                                onClick={() => setOpen((v) => !v)}
                                aria-label={isAr ? 'الأقسام' : 'Sections'}
                                aria-expanded={open}
                                aria-controls="dock-mob-sections"
                            >
                                <span className="dock-mob-btn-ic" aria-hidden="true">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" />
                                        <rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" />
                                    </svg>
                                </span>
                                <span className="dock-mob-btn-tx">
                                    <b>{isAr ? 'الأقسام' : 'Sections'}</b>
                                    <small>{isAr ? activeNav.ar : activeNav.en}</small>
                                </span>
                                <span className="dock-mob-chev" aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                                </span>
                            </button>
                        </div>

                        {/* sections dropdown */}
                        <div className="dock-mob-menu" id="dock-mob-sections">
                            <div className="dock-mob-menu-in">
                                <div className="dock-mob-panel">
                                    <div className="dock-mob-panel-in">
                                        <div className="dock-mob-head" dir={isAr ? 'rtl' : 'ltr'}>
                                            <img src={profileImage} alt="" loading="lazy" />
                                            <span className="min-w-0">
                                                <b dir="ltr">FAHAD</b>
                                                <small className={isLive ? 'on' : ''}>
                                                    <i aria-hidden="true" />
                                                    <span className="truncate">{isLive ? `${statusText}${viewersLabel ? ` • ${viewersLabel}` : ''}` : statusText}</span>
                                                </small>
                                            </span>
                                        </div>

                                        <nav className="dock-mob-grid" aria-label={isAr ? 'الأقسام' : 'Sections'} dir={isAr ? 'rtl' : 'ltr'}>
                                            {NAV_DEFS.map((n, i) => (
                                                <button
                                                    key={n.href}
                                                    type="button"
                                                    onClick={() => goTo(n.id)}
                                                    aria-current={activeHash === n.href ? 'page' : undefined}
                                                    className={`dock-tile${activeHash === n.href ? ' is-active' : ''}`}
                                                >
                                                    {n.icon}
                                                    <span className="truncate">{isAr ? n.ar : n.en}</span>
                                                    <span className="dock-tile-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                                                </button>
                                            ))}
                                        </nav>

                                        <a href="https://kick.com/fahad" target="_blank" rel="noopener noreferrer" className="dock-mob-cta">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                                            {isAr ? 'شاهد البث المباشر' : 'Watch Live'}
                                        </a>

                                        <div className="dock-mob-acts">
                                            <a href="https://discord.com/invite/HYByGx8mQA" target="_blank" rel="noopener noreferrer" className="dock-mob-act">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419z" /></svg>
                                                Discord
                                            </a>
                                            <a href="https://tip.dokan.sa/fahad89" target="_blank" rel="noopener noreferrer" className="dock-mob-act">
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-7.5-10.3C4.5 6.6 6.7 5 8.8 5c1.4 0 2.6.7 3.2 1.8C12.6 5.7 13.8 5 15.2 5c2.1 0 4.3 1.6 4.3 4.7C19.5 15.4 12 20 12 20z" /></svg>
                                                {isAr ? 'الدعم' : 'Support'}
                                            </a>
                                        </div>

                                        <div className="dock-mob-acts">
                                            <button type="button" className="dock-mob-act" onClick={() => onToggleLang()}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" /></svg>
                                                {isAr ? 'English' : 'العربية'}
                                            </button>
                                            <button type="button" className="dock-mob-act" onClick={() => { onRefresh(); setOpen(false); }}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                {isAr ? 'تحديث الحالة' : 'Refresh'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
