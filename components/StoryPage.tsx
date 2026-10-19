import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../types';

/* ============================================================
   STORY — a STANDALONE cinematic page about FAHAD.
   It owns the whole screen: letterbox cinema, full-bleed
   chapter photography, rain, lightning, film grain, Ken Burns.
   Reached through #story, exits back to the site.
   ============================================================ */

const CHAPTER_MS = 7000;

interface Chapter {
    photo: number;
    kickerAr: string; kickerEn: string;
    headAr: string; headEn: string;
    textAr: string; textEn: string;
    /** where the camera sits on this photo (portrait art needs the top) */
    pos?: string;
    /** Ken Burns end-zoom — gentler on tall art so nothing gets eaten */
    zoom?: number;
    /** custom full image path — overrides /album/XX.jpg when set */
    img?: string;
}

const END_IMG = '/album/i222mage.png';

const CHAPTERS: Chapter[] = [
    {
        photo: 16,
        kickerAr: 'مملكة الذهب', kickerEn: 'The Golden Kingdom',
        headAr: 'المملكة التي لا تنام', headEn: 'The kingdom that never sleeps',
        textAr: 'مملكة الذهب. شاشات مشتعلة، وليالٍ أطول من النهار، وجمهور ينتظر. وهنا بدأ كل شيء.',
        textEn: 'The Golden Kingdom. Screens ablaze, nights longer than the days, and an audience that waits. Everything began here.',
    },
    {
        photo: 4,
        kickerAr: 'البداية', kickerEn: 'The beginning',
        headAr: 'صوتٌ واحد', headEn: 'One voice',
        textAr: 'بداية بسيطة: كاميرا واحدة، وحلم كبير. لا جمهور ولا نجاحات — فقط إرادة أن يبدأ.',
        textEn: 'A simple start: one camera, one big dream. No audience, no wins — only the will to begin.',
        pos: 'center 20%',
        zoom: 1.07,
    },
    {
        photo: 1,
        kickerAr: 'الميدان', kickerEn: 'The arena',
        headAr: 'رجلٌ لا يتراجع', headEn: 'A man who never steps back',
        textAr: 'لم تكن طريق فهد سهلة. كان البث هو المكان الذي أثبت فيه نفسه — بثٌ بعد بث، وليلةً بعد ليلة.',
        textEn: "FAHAD's road was never easy. The stream was where he proved himself — session after session, night after night.",
    },
    {
        photo: 9,
        kickerAr: 'السلم', kickerEn: 'The ladder',
        headAr: 'رتبةً بعد رتبة', headEn: 'Step after step',
        textAr: 'كل منصة جديدة كانت درجة صعود. من غرفة صغيرة، إلى جمهور ينتظره كل ليلة.',
        textEn: 'Every new platform was a step up. From a small room, to an audience that waits for him every night.',
    },
    {
        photo: 3,
        kickerAr: 'القيادة', kickerEn: 'The command',
        headAr: 'على المسرح الرئيسي', headEn: 'On the main stage',
        textAr: 'حتى وصل إلى كيك — المسرح الرئيسي. وصار الاسم يُقال بثقة.',
        textEn: 'Until he reached Kick — the main stage. And the name was spoken with confidence.',
    },
    {
        photo: 6,
        kickerAr: 'السنوات', kickerEn: 'The years',
        headAr: 'سنواتٌ من التعب', headEn: 'Years of toil',
        textAr: 'مرت السنوات، وبقي فهد حاضرًا. لم يكن يبحث عن الطريق الأسهل، بل عن الطريق الذي يستحق أن يصعده.',
        textEn: "The years passed, and FAHAD stayed present. He never looked for the easier road — only the one worth climbing.",
    },
    {
        photo: 11,
        kickerAr: 'الجمهور', kickerEn: 'The crowd',
        headAr: 'إخوان المشاهدة', headEn: 'Brothers of the stream',
        textAr: 'رجاله معه في كل ليلة. سهر وتعب وضحك — قبل أن يتغير كل شيء.',
        textEn: 'His people beside him every night. Late hours, hard work, laughter — before everything changed.',
    },
    {
        photo: 10,
        kickerAr: 'الثقة', kickerEn: 'The trust',
        headAr: 'حين يصبح الاسم هدفًا', headEn: 'When a name becomes a target',
        textAr: 'كلما كبرت مملكته، كبر معها من عرفوه وقفوا إلى جانبه. لكن المجد له ظلال، واسم الرجل قد يصير عبئًا عليه.',
        textEn: 'As his kingdom grew, so did the circle of those who stood beside him. But fame has shadows, and a man’s name can become a burden.',
    },
    {
        photo: 5,
        kickerAr: 'المنافسة', kickerEn: 'The rivalry',
        headAr: 'ليالٍ لا تُنسى', headEn: 'Nights nobody forgets',
        textAr: 'ليالٍ من التحديات والمواجهات — كل واحدة منها كانت اختبارًا حقيقيًا.',
        textEn: 'Nights of challenges and face-offs — each one a real test.',
        img: '/album/im90879age.png',
        pos: 'center 50%',
        zoom: 1.06,
    },
    {
        photo: 2,
        kickerAr: 'الضباب', kickerEn: 'The fog',
        headAr: 'ليالٍ ثقيلة', headEn: 'Heavy nights',
        textAr: 'ليالٍ ثقيلة على القلب — والمطر كان يهطل على المدينة كل ليلة.',
        textEn: 'Heavy nights on the heart — and the rain kept falling over the city every night.',
        img: '/album/photo-output.png',
        pos: 'center 50%',
        zoom: 1.06,
    },
    {
        photo: 12,
        kickerAr: 'العودة', kickerEn: 'The comeback',
        headAr: 'العودة القوية', headEn: 'The strong return',
        textAr: 'لكنه كان يعود دائمًا. أقوى في كل مرة، كأن المملكة هي التي أعادته.',
        textEn: 'But he always came back. Stronger every time, as if the kingdom itself brought him back.',
    },
    {
        photo: 8,
        kickerAr: 'المجتمع', kickerEn: 'The community',
        headAr: 'المجتمع الذهبي', headEn: 'The Golden community',
        textAr: 'ثم جاء المجتمع — آلاف المتابعين، وجمهور لا ينام، وصار البث بيتًا لا مسرحًا فقط.',
        textEn: 'Then came the community — thousands of followers, an audience that never sleeps, and the stream became a home, not just a stage.',
    },
    {
        photo: 7,
        kickerAr: 'الاسم', kickerEn: 'The name',
        headAr: 'حين يستحق الاسم', headEn: 'When the name is earned',
        textAr: 'بعد كل تلك الليالي، صار الاسم يُقال بثقة. لم يعطِ أحدٌ له هذا الاسم — بل صنعه بنفسه.',
        textEn: "After all those nights, the name was spoken with confidence. Nobody gave it to him — he built it himself.",
    },
    {
        photo: 14,
        kickerAr: 'الذهب', kickerEn: 'The gold',
        headAr: 'المعيار الذهبي', headEn: 'The golden standard',
        textAr: 'ثم وضع معيارًا — مستوى يجعل كل بث جديد أفضل من اللي قبله.',
        textEn: 'Then he set a standard — a level where every new stream beats the one before it.',
    },
    {
        photo: 13,
        kickerAr: 'اليوم', kickerEn: 'Today',
        headAr: 'مملكة الذهب', headEn: 'The Golden Kingdom',
        textAr: 'ضاقت الدائرة حول فهد اليوم — لكنها لم تصغر. حوله اليوم مملكة كاملة تنتظر بثه.',
        textEn: "The circle around FAHAD is tight today — but it never shrank. Around him today, a whole kingdom waits for his stream.",
        pos: 'center 18%',
        zoom: 1.06,
    },
    {
        photo: 15,
        kickerAr: 'FAHAD ERA', kickerEn: 'FAHAD ERA',
        headAr: 'العهد', headEn: 'The covenant',
        textAr: 'هذا هو عهد فهد: كل بث، كل تحدي، وكل جمهور — مملكة الذهب ما تنتهي.',
        textEn: "This is FAHAD's covenant: every stream, every challenge, every fan — the Golden Kingdom never ends.",
    },
];

/* scattered polaroid prints for the intro collage */
const POLAROIDS = [
    { src: '/album/04.jpg', rot: -9, x: '6%', y: '12%', s: 1 },
    { src: '/album/07.jpg', rot: 7, x: '82%', y: '10%', s: 0.92 },
    { src: '/album/10.jpg', rot: -6, x: '12%', y: '66%', s: 0.95 },
    { src: '/album/12.jpg', rot: 8, x: '76%', y: '64%', s: 1.05 },
    { src: '/album/14.jpg', rot: -4, x: '46%', y: '78%', s: 0.8 },
];

const pad = (n: number) => String(n).padStart(2, '0');

/* ---------- rain canvas, alive only while mounted ---------- */
const RainCanvas: React.FC = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let raf = 0;
        let w = 0;
        let h = 0;
        type Drop = { x: number; y: number; len: number; spd: number; o: number };
        let drops: Drop[] = [];

        const build = () => {
            const rect = canvas.getBoundingClientRect();
            w = Math.max(1, Math.round(rect.width));
            h = Math.max(1, Math.round(rect.height));
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const target = Math.round(Math.min(170, (w * h) / 9000));
            drops = Array.from({ length: target }, () => ({
                x: Math.random() * (w + 160) - 80,
                y: Math.random() * h,
                len: 10 + Math.random() * 26,
                spd: 420 + Math.random() * 880,
                o: 0.1 + Math.random() * 0.3,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            ctx.lineCap = 'round';
            ctx.lineWidth = 1;
            for (const d of drops) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(190,225,255,${d.o})`;
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x - d.len * 0.22, d.y + d.len);
                ctx.stroke();
                d.y += d.spd * 0.016;
                d.x -= d.spd * 0.0035;
                if (d.y > h + 30) { d.y = -30 - Math.random() * 60; d.x = Math.random() * (w + 160) - 80; }
                if (d.x < -90) d.x = w + 50;
            }
            raf = requestAnimationFrame(draw);
        };

        const start = () => { if (!raf) raf = requestAnimationFrame(draw); };
        const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

        build();
        start();
        const onResize = () => { stop(); build(); start(); };
        window.addEventListener('resize', onResize);
        const onVis = () => (document.hidden ? stop() : start());
        document.addEventListener('visibilitychange', onVis);
        return () => {
            stop();
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVis);
        };
    }, []);

    return <canvas ref={ref} className="st-rain" aria-hidden="true" />;
};

export const StoryPage: React.FC<{ lang: Language }> = ({ lang }) => {
    const isAr = lang === 'ar';
    const total = CHAPTERS.length;

    const [started, setStarted] = useState(false);
    const [ch, setCh] = useState(0);
    const [ended, setEnded] = useState(false);
    const [playing, setPlaying] = useState<boolean>(
        () => typeof window === 'undefined' ? true : !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
    const touchX = useRef<number | null>(null);

    /* theme music — must stay on: it starts on mount AND retries on every
       tap/key until it is actually playing. Only the mute button can stop it. */
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [musicOn, setMusicOn] = useState(true);
    const musicOnRef = useRef(true);
    useEffect(() => { musicOnRef.current = musicOn; }, [musicOn]);
    useEffect(() => {
        const a = new Audio('/1005.MP3');
        a.loop = true;
        a.volume = 0.75;
        a.preload = 'auto';
        audioRef.current = a;
        const kick = () => {
            if (musicOnRef.current && a.paused) a.play().catch(() => { /* retry on next tap */ });
        };
        kick();
        window.addEventListener('pointerdown', kick);
        window.addEventListener('keydown', kick);
        return () => {
            window.removeEventListener('pointerdown', kick);
            window.removeEventListener('keydown', kick);
            a.pause();
            try { a.removeAttribute('src'); a.load(); } catch { /* noop */ }
            audioRef.current = null;
        };
    }, []);
    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;
        if (musicOn) a.play().catch(() => { /* user will tap; the kick above starts it */ });
        else a.pause();
    }, [musicOn]);

    const exit = useCallback((to = '#top') => {
        if (window.location.hash === to) {
            document.getElementById(to.slice(1))?.scrollIntoView({ behavior: 'smooth' });
            window.scrollTo(0, 0);
        } else {
            window.location.hash = to;
        }
    }, []);

    const next = useCallback(() => {
        if (ended) return;
        if (ch >= total - 1) setEnded(true);
        else setCh((p) => p + 1);
    }, [ch, ended, total]);

    const prev = useCallback(() => {
        if (ended) { setEnded(false); return; }
        setCh((p) => (p - 1 + total) % total);
    }, [ended, total]);

    /* lock the page scroll while the story owns the screen */
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    /* autoplay chapters */
    useEffect(() => {
        if (!started || ended || !playing) return;
        const id = window.setTimeout(next, CHAPTER_MS);
        return () => window.clearTimeout(id);
    }, [started, ended, playing, ch, next]);

    /* keyboard */
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { exit(); return; }
            if (!started || ended) {
                if (e.key === 'Enter' && !started) setStarted(true);
                return;
            }
            if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
            else if (e.key === 'ArrowLeft') (isAr ? next : prev)();
            else if (e.key === 'ArrowRight') (isAr ? prev : next)();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [started, ended, isAr, next, prev, exit]);

    const c = CHAPTERS[ch];

    return (
        <div
            className="st-root"
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                touchX.current = null;
                if (Math.abs(dx) > 52) (dx < 0 ? next : prev)();
            }}
        >
            <style>{`
            .st-root{position:fixed;inset:0;z-index:200;overflow:hidden;background:#000;color:#fff;
                font-family:inherit;animation:st-in .7s ease both}
            @keyframes st-in{from{opacity:0}to{opacity:1}}
            /* cinema frame */
            .st-photo{position:absolute;inset:0;background-size:cover;
                animation:st-kb 9.5s ease-out forwards;will-change:transform}
            @keyframes st-kb{from{transform:scale(1)}to{transform:scale(var(--kb,1.14))}}
            .st-scrim{position:absolute;inset:0;pointer-events:none;
                background:
                    linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.25) 26%,rgba(0,0,0,.18) 52%,rgba(0,0,0,.62) 76%,rgba(0,0,0,.94) 100%),
                    radial-gradient(110% 70% at 50% 108%, rgba(242,179,61,.16), transparent 60%)}
            .st-grain{position:absolute;inset:0;pointer-events:none;opacity:.16;mix-blend-mode:overlay;
                background-image:radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px);
                background-size:3px 3px;animation:st-gr 1.2s steps(3) infinite}
            @keyframes st-gr{0%{transform:translate(0,0)}33%{transform:translate(-1.5%,1%)}66%{transform:translate(1%, -1.5%)}100%{transform:translate(0,0)}}
            .st-scan{position:absolute;inset:0;pointer-events:none;opacity:.22;
                background:repeating-linear-gradient(180deg, rgba(255,255,255,.04) 0 1px, transparent 1px 4px);
                mix-blend-mode:overlay}
            .st-rain{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;z-index:5}
            .st-bolt{position:absolute;inset:0;pointer-events:none;opacity:0;z-index:5;
                background:radial-gradient(70% 40% at 64% 6%, rgba(214,240,255,.32), transparent 66%);
                animation:st-bolt 14s ease-out infinite}
            @keyframes st-bolt{0%,90%{opacity:0}91%{opacity:.8}92%{opacity:.1}93%{opacity:.6}95%,100%{opacity:0}}
            .st-vig{position:absolute;inset:0;pointer-events:none;z-index:6;
                background:radial-gradient(125% 95% at 50% 46%, transparent 44%, rgba(0,0,0,.5) 86%, rgba(0,0,0,.85) 100%)}
            /* letterbox */
            .st-bar{position:absolute;left:0;right:0;height:clamp(38px,7vh,64px);background:#000;z-index:8}
            .st-bar.top{top:0;border-bottom:1px solid rgba(255,255,255,.07)}
            .st-bar.bot{bottom:0;border-top:1px solid rgba(255,255,255,.07)}
            /* chrome */
            .st-top{position:absolute;top:clamp(38px,7vh,64px);left:0;right:0;z-index:10;
                display:flex;align-items:center;gap:.7rem;padding:.85rem 1rem}
            .st-x{width:42px;height:42px;border-radius:14px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;color:rgba(255,255,255,.75);
                background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
                backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:all .3s ease}
            .st-x:hover{color:#08060A;background:#F7E3B0;border-color:transparent;transform:rotate(90deg)}
            .st-replay{width:auto;height:54;padding:0 1.4rem;border-radius:20px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;gap:.6rem;
                font-size:14px;font-weight:900;white-space:nowrap;flex-direction:row;
                color:rgba(255,255,255,.75);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
                backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);transition:background .3s ease,color .3s ease,transform .3s ease}
            .st-replay:hover{color:#08060A;background:#F7E3B0;border-color:transparent;transform:none}
            .st-replay:active{transform:scale(.97)}
            .st-count{margin-inline-start:auto;display:inline-flex;align-items:baseline;gap:.5rem;
                font-size:11px;font-weight:900;letter-spacing:.2em;color:rgba(255,255,255,.75)}
            .st-count b{font-size:20px;color:#fff}
            .st-count span{color:rgba(255,255,255,.35)}
            .st-play{width:42px;height:42px;border-radius:14px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;color:#F7E3B0;
                background:rgba(242,179,61,.12);border:1px solid rgba(242,179,61,.35);transition:all .3s ease}
            .st-play:hover{background:rgba(242,179,61,.25)}
            /* chapter text */
            .st-body{position:absolute;z-index:10;left:0;right:0;bottom:calc(clamp(38px,7vh,64px) + 76px);
                padding:0 clamp(1.1rem,5vw,3.4rem);max-width:900px}
            .st-kick{display:inline-flex;align-items:center;gap:.55rem;font-size:10.5px;font-weight:900;
                letter-spacing:.26em;text-transform:uppercase;color:rgba(247,227,176,.85)}
            .st-kick::before{content:"";width:7px;height:7px;transform:rotate(45deg);background:#B8862B;flex:none;
                box-shadow:0 0 12px rgba(184,134,43,.9)}
            .st-head{margin:.8rem 0 0;font-size:clamp(1.9rem,7vw,3.6rem);line-height:1.08;font-weight:900;
                letter-spacing:-.01em;text-shadow:0 10px 44px rgba(0,0,0,.8)}
            [dir="rtl"] .st-head{letter-spacing:0!important}
            .st-text{margin:.9rem 0 0;font-size:clamp(.95rem,2.4vw,1.12rem);line-height:2;font-weight:500;
                color:rgba(255,255,255,.78);max-width:58ch;text-shadow:0 4px 22px rgba(0,0,0,.9)}
            .st-rise{opacity:0;transform:translateY(26px);animation:st-up 1s cubic-bezier(.16,1,.3,1) forwards;
                animation-delay:calc(var(--i) * 110ms)}
            @keyframes st-up{to{opacity:1;transform:none}}
            /* controls */
            .st-ctl{position:absolute;z-index:10;left:0;right:0;bottom:clamp(38px,7vh,64px);
                padding:.85rem clamp(1.1rem,5vw,3.4rem);display:flex;align-items:center;gap:.8rem;
                background:linear-gradient(180deg,transparent,rgba(0,0,0,.55))}
            .st-arrow{width:46px;height:46px;border-radius:999px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;color:#F7E3B0;
                background:rgba(242,179,61,.1);border:1px solid rgba(242,179,61,.35);
                backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
                transition:all .3s cubic-bezier(.16,1,.3,1)}
            .st-arrow:hover{color:#08060A;background:linear-gradient(180deg,#F7E3B0,#F2B33D 55%,#8A6320);
                border-color:transparent;transform:scale(1.07)}
            .st-arrow:active{transform:scale(.94)}
            .st-segs{flex:1;display:flex;gap:.45rem;min-width:0}
            .st-seg{position:relative;flex:1;height:4px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}
            .st-seg.done{background:linear-gradient(90deg,#B8862B,#F7E3B0 60%,#F2B33D)}
            .st-seg.cur .st-seg-fill{position:absolute;inset-block:0;inset-inline-start:0;border-radius:999px;
                background:linear-gradient(90deg,#F2CE7C,#F7E3B0 55%,#F2B33D);
                box-shadow:0 0 12px rgba(247,227,176,.8);
                animation:st-fill 7s linear forwards}
            @keyframes st-fill{from{width:0%}to{width:100%}}
            .st-hint{display:none;font-size:10px;font-weight:800;letter-spacing:.14em;color:rgba(255,255,255,.35);
                text-transform:uppercase;white-space:nowrap}
            @media(min-width:640px){.st-hint{display:block}}
            /* intro */
            .st-intro{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;
                text-align:center;padding:1.5rem;animation:st-in .8s ease both}
            .st-pol{position:absolute;width:clamp(120px,20vw,200px);aspect-ratio:4/5;border-radius:14px;overflow:hidden;
                border:6px solid rgba(255,255,255,.9);box-shadow:0 30px 70px -20px rgba(0,0,0,.9);
                opacity:.5;filter:saturate(.85) brightness(.85);animation:st-float 9s ease-in-out infinite}
            .st-pol img{width:100%;height:100%;object-fit:cover;display:block}
            @keyframes st-float{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-16px) rotate(var(--r))}}
            .st-eyebrow{display:inline-flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-radius:999px;
                font-size:10.5px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:rgba(247,227,176,.85);
                background:rgba(242,179,61,.09);border:1px solid rgba(242,179,61,.28)}
            .st-title{font-size:clamp(2.6rem,11vw,6rem);line-height:1.02;font-weight:900;margin:1.4rem 0 0;
                background:linear-gradient(178deg,#FFFFFF 0%,#FFFAF0 40%,#F7E3B0 76%,#F5D98C 100%);
                -webkit-background-clip:text;background-clip:text;color:transparent;
                filter:drop-shadow(0 14px 50px rgba(242,179,61,.35))}
            [dir="rtl"] .st-title{letter-spacing:0!important}
            .st-meta{margin:1.1rem 0 0;display:flex;align-items:center;justify-content:center;gap:.8rem;
                font-size:10.5px;font-weight:900;letter-spacing:.24em;color:rgba(255,255,255,.45);text-transform:uppercase}
            .st-meta i{width:5px;height:5px;transform:rotate(45deg);background:rgba(184,134,43,.9);flex:none}
            .st-begin{position:relative;margin-top:2.2rem;display:inline-flex;align-items:center;gap:.85rem;
                padding:1.05rem 2.4rem;border-radius:20px;cursor:pointer;font-family:inherit;
                font-size:15px;font-weight:900;color:#08060A;overflow:hidden;
                background:linear-gradient(180deg,#F7E3B0,#F2B33D 55%,#8A6320);
                box-shadow:0 22px 50px -14px rgba(242,179,61,.9),inset 0 1px 0 rgba(255,255,255,.55);
                transition:transform .35s cubic-bezier(.16,1,.3,1)}
            .st-begin:hover{transform:translateY(-2px) scale(1.02)}
            .st-begin:active{transform:scale(.97)}
            /* end screen */
            .st-end{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;
                text-align:center;padding:1.5rem;animation:st-in .8s ease both}
            .st-end-quote{font-size:clamp(1.3rem,4.4vw,2.2rem);line-height:1.75;font-weight:800;max-width:26ch;
                text-shadow:0 10px 44px rgba(0,0,0,.9)}
            [dir="rtl"] .st-end-quote{letter-spacing:0!important}
            .st-end-meta{margin-top:1.2rem;display:flex;align-items:center;justify-content:center;gap:.8rem;
                font-size:10.5px;font-weight:900;letter-spacing:.24em;color:rgba(255,255,255,.4);text-transform:uppercase}
            .st-end-meta i{width:5px;height:5px;transform:rotate(45deg);background:rgba(184,134,43,.9);flex:none}
            .st-end-btns{margin-top:2.2rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.8rem}
            a:focus-visible,button:focus-visible{outline:2px solid #F2B33D;outline-offset:3px;border-radius:14px}
            @media(prefers-reduced-motion:reduce){
                .st-photo,.st-grain,.st-bolt,.st-pol,.st-seg.cur .st-seg-fill{animation:none!important}
                .st-rise{opacity:1!important;transform:none!important}
                .st-rain{display:none}
            }
            `}</style>

            {/* photo bed */}
            <div
                key={started ? (ended ? 'end' : `ch-${ch}`) : 'intro'}
                className="st-photo"
                style={{
                    backgroundImage: ended
                        ? `url(${END_IMG})`
                        : started
                            ? `url(${CHAPTERS[ch].img || `/album/${pad(CHAPTERS[ch].photo)}.jpg`})`
                            : `url(/album/01.jpg)`,
                    backgroundPosition: started && !ended ? (CHAPTERS[ch].pos || 'center') : 'center',
                    ['--kb' as string]: started && !ended ? (CHAPTERS[ch].zoom || 1.14) : 1.06,
                    zIndex: 1,
                }}
                aria-hidden="true"
            />
            <span className="st-scrim" style={{ zIndex: 2 }} aria-hidden="true" />
            <span className="st-grain" style={{ zIndex: 3 }} aria-hidden="true" />
            <span className="st-scan" style={{ zIndex: 4 }} aria-hidden="true" />
            <RainCanvas />
            <span className="st-bolt" aria-hidden="true" />

            {/* letterbox */}
            <span className="st-bar top" aria-hidden="true" />
            <span className="st-bar bot" aria-hidden="true" />
            <span className="st-vig" aria-hidden="true" />

            {!started && (
                <div className="st-intro">
                    {POLAROIDS.map((p, i) => (
                        <span
                            key={p.src}
                            className="st-pol"
                            style={{ left: p.x, top: p.y, ['--r' as string]: `${p.rot}deg`, transform: `scale(${p.s})`, animationDelay: `${i * -1.7}s`, zIndex: 1 }}
                            aria-hidden="true"
                        >
                            <img src={p.src} alt="" loading="lazy" />
                        </span>
                    ))}
                    <div className="relative" style={{ zIndex: 2 }}>
                        <span className="st-eyebrow">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F2B33D] animate-pulse" aria-hidden="true" />
                            <span dir="ltr">{isAr ? 'فيلم قصير' : 'A short film'}</span>
                        </span>
                        <h1 className={`st-title ${isAr ? 'font-arabic' : ''}`}>
                            {isAr ? 'سيرةٌ تحت المطر' : 'A life under the rain'}
                        </h1>
                        <div className="st-meta">
                            <span>{isAr ? 'فهد' : 'FAHAD'}</span>
                            <i aria-hidden="true" />
                            <span dir="ltr">FAHAD ERA</span>
                            <i aria-hidden="true" />
                            <span>{isAr ? '١٦ فصلًا' : '16 chapters'}</span>
                        </div>
                        <div>
                            <button type="button" className="st-begin" onClick={() => setStarted(true)} autoFocus>
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#08060A] text-[#F2CE7C]" aria-hidden="true">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </span>
                                {isAr ? 'ابدأ السيرة' : 'Begin the story'}
                            </button>
                        </div>
                        <p className="mt-4 text-[10.5px] font-bold tracking-[.2em] text-white/35 uppercase">
                            {isAr ? 'الأفضل مع الصوت مرفوعاً' : 'Best with sound up'}
                        </p>
                    </div>
                </div>
            )}

            {started && !ended && (
                <>
                    <div className="st-top">
                        <button type="button" className="st-x" onClick={() => exit()} aria-label={isAr ? 'خروج' : 'Exit'}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                        </button>
                        <span className="st-count" dir="ltr"><b>{pad(ch + 1)}</b><span>/ {pad(total)}</span></span>
                        <button type="button" className="st-play" onClick={() => setMusicOn((m) => !m)} aria-label={isAr ? (musicOn ? 'كتم الموسيقى' : 'تشغيل الموسيقى') : (musicOn ? 'Mute music' : 'Play music')}>
                            {musicOn ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V6l11-3.5V16" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>
                            ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V6l11-3.5V16" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /><path d="M3 3l18 18" /></svg>
                            )}
                        </button>
                        <button type="button" className="st-play" onClick={() => setPlaying((p) => !p)} aria-label={isAr ? (playing ? 'إيقاف' : 'تشغيل') : (playing ? 'Pause' : 'Play')}>
                            {playing ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="st-body" key={`body-${ch}`}>
                        <span className="st-rise st-kick" style={{ ['--i' as string]: 0 }}>
                            {isAr ? c.kickerAr : c.kickerEn}
                        </span>
                        <h2 className={`st-rise st-head ${isAr ? 'font-arabic' : ''}`} style={{ ['--i' as string]: 1 }}>
                            {isAr ? c.headAr : c.headEn}
                        </h2>
                        <p className="st-rise st-text" style={{ ['--i' as string]: 2 }}>
                            {isAr ? c.textAr : c.textEn}
                        </p>
                    </div>

                    <div className="st-ctl">
                        <button type="button" className="st-arrow" onClick={prev} aria-label={isAr ? 'السابق' : 'Previous'}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={isAr ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} /></svg>
                        </button>
                        <div className="st-segs" role="progressbar" aria-valuenow={ch + 1} aria-valuemin={1} aria-valuemax={total} aria-label={isAr ? 'تقدم السيرة' : 'Story progress'}>
                            {CHAPTERS.map((_, i) => (
                                <span key={i} className={`st-seg${i < ch ? ' done' : i === ch ? ' cur' : ''}`}>
                                    {i === ch && playing && <span key={`fill-${ch}`} className="st-seg-fill" />}
                                </span>
                            ))}
                        </div>
                        <button type="button" className="st-arrow" onClick={next} aria-label={isAr ? 'التالي' : 'Next'}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={isAr ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} /></svg>
                        </button>
                        <span className="st-hint">{isAr ? 'اسحب أو استخدم الأسهم' : 'Swipe or use arrows'}</span>
                    </div>
                </>
            )}

            {started && ended && (
                <div className="st-end">
                    <div>
                        <span className="st-eyebrow">
                            <span className="w-1.5 h-1.5 rotate-45 bg-[#F2B33D]" aria-hidden="true" />
                            <span dir="ltr">FAHAD</span>
                        </span>
                        <p className={`st-end-quote mt-6 ${isAr ? 'font-arabic' : ''}`}>
                            {isAr
                                ? '«الذهب لا يُصنع في الفرن وحده — بل في كل ليلة تُصب على الشاشة.»'
                                : '“Gold is never made in the furnace alone — but in every night thrown on screen.”'}
                        </p>
                        <div className="st-end-meta">
                            <span dir="ltr">GOLDEN KINGDOM</span>
                            <i aria-hidden="true" />
                            <span dir="ltr">FAHAD ERA</span>
                        </div>
                        <div className="st-end-btns">
                            <button type="button" className="st-begin" style={{ marginTop: 0 }} onClick={() => exit('#album')}>
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#08060A] text-[#F2CE7C]" aria-hidden="true">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                                </span>
                                {isAr ? 'ادخل سيرة فهد' : 'Enter FAHAD’s sirah'}
                            </button>
                            <button type="button" className="st-replay" onClick={() => { setCh(0); setEnded(false); }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                {isAr ? 'إعادة' : 'Replay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryPage;
