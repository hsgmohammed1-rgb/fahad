import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../types';

/* ============================================================
   STORY — سيرة فهد المطيري. صفحة سينمائية مستقلة تملأ الشاشة.
   الصور من فولدر album3 (التصاميم الجديدة)، تسعة فصول وفق scénario
   الذي طلبه فهد. تُصل إليها عبر #story وتعود للموقع عند الخروج.
   ============================================================ */

const CHAPTER_MS = 35000;

const pad = (n: number) => String(n).padStart(2, '0');
const ext = (n: number) => (n >= 8 && n <= 13 ? 'png' : 'jpg');

interface Chapter {
    photo: number;
    img: string;
    kickerAr: string; kickerEn: string;
    headAr: string; headEn: string;
    textAr: string; textEn: string;
    pos?: string;
    /** Ken Burns end-zoom */
    zoom?: number;
    /** render with blurred edges for vertical art */
    vertical?: boolean;
}

const END_IMG = `/album3/${pad(20)}.png`;

const CHAPTERS: Chapter[] = [
    {
        photo: 8,
        img: '/album3/08.png',
        kickerAr: 'الفصل 1', kickerEn: 'Chapter 1',
        headAr: 'شرارة الطموح',
        headEn: 'The spark of ambition',
        textAr: 'لم تكن النجوم على كتفه مجرد صدفة.. بدأ فهد المطيري مسيرته باجتهادات شخصية في أروقة المركز، عسكريٌ صاعد يربط ليله بنهاره.',
        textEn: 'The stars on his shoulder were no coincidence. Fahad Al-Mutairi began his career with personal efforts within the center\'s halls.',
        pos: 'center 25%',
        zoom: 1.12,
    },
    {
        photo: 11,
        img: '/album3/11.png',
        kickerAr: 'الفصل 2', kickerEn: 'Chapter 2',
        headAr: 'حارس ليالي المدينة',
        headEn: 'Guardian of the city nights',
        textAr: 'في الوقت الذي نام فيه الكثيرون، كان فهد يجوب شوارع المدينة المظلمة. صعد السلم خطوة بخطوة حتى تربع على عرش قيادة قطاع الشيرف.',
        textEn: 'While many slept, Fahad patrolled the dark streets of the city. He climbed the ladder step by step until he sat on the throne of the sheriff sector command.',
        pos: 'center 75%',
        zoom: 1.12,
    },
    {
        photo: 12,
        img: '/album3/12.png',
        kickerAr: 'الفصل 3', kickerEn: 'Chapter 3',
        headAr: 'شرارة ساندي شواطئ',
        headEn: 'The Sandy Beaches spark',
        textAr: 'دوى الإنذار معلناً سرقة بنك ساندي، وهناك بدأت القصة التي ستغير كل شيء. اصطدمت صرامة القائد فهد المطيري ببرود العسكري العائد من إجازته الطويلة "عبدالصمد".. وكان لا بد للقائد أن يفرض هيبته.',
        textEn: 'The alarm sounded, announcing the Sandy Bank robbery — and there began the story that would change everything. Commander Fahad Al-Mutairi\'s sternness clashed with the coldness of "Abdulsamad".. and the commander had to impose his authority.',
        pos: 'center 0%',
        zoom: 1.14,
    },
    {
        photo: 11,
        img: '/album3/04.jpg',
        kickerAr: 'الفصل 4', kickerEn: 'Chapter 4',
        headAr: 'كبرياء القائد وتأديب المتخاذل',
        headEn: 'The commander\'s pride and disciplining the slacker',
        textAr: 'بنظرة ثاقبة وحزم عسكري، رفض فهد تهاون عبدالصمد، وأمر بإحالته لإعادة التأهيل لعدم كفاءته. كانت إهانة عسكرية في محلها لضبط القطاع، لكنها في قلب عبدالصمد تحولت إلى حقد أسود وبداية لعداوة لا ترحم.',
        textEn: 'With a piercing look and military firmness, Fahad refused Abdulsamad\'s negligence and ordered his referral to rehabilitation for incompetence. It was a deserved military insult to discipline the sector, but in Abdulsamad\'s heart it turned into black hatred and the beginning of a merciless enmity.',
        pos: 'center 5%',
        zoom: 1.1,
    },
    {
        photo: 18,
        img: '/album3/17.jpg',
        kickerAr: 'الفصل 5', kickerEn: 'Chapter 5',
        headAr: 'تحالف الأقوياء',
        headEn: 'Alliance of the strong',
        textAr: 'بدأ عبدالصمد بتكوين فرقة كاملة هدفها إسقاط فهد. لكن القائد المحنك لم يكن فريسة سهلة؛ أخذ احتياطاته ووحّد الصفوف مع كبار المدينة.',
        textEn: 'Abdulsamad began forming a full squad aiming to topple Fahad. But the seasoned commander was no easy prey; he took precautions and united ranks with the city\'s elders.',
        pos: 'center 0%',
        zoom: 1.1,
    },
    {
        photo: 5,
        img: '/album3/05.jpg',
        kickerAr: 'الفصل 6', kickerEn: 'Chapter 6',
        headAr: 'خناجر الكواليس',
        headEn: 'Backstage daggers',
        textAr: 'كثرت الشكاوى الكيدية وتصيد الأخطاء. لم تكن الحرب في الميدان بل في الغرف المغلقة.',
        textEn: 'Malicious complaints and fault-finding multiplied. The war was no longer on the field but behind closed doors.',
        pos: 'center 45%',
        zoom: 1.12,
    },
    {
        photo: 13,
        img: '/album3/13.png',
        kickerAr: 'الفصل 7', kickerEn: 'Chapter 7',
        headAr: 'عزلة الجبل',
        headEn: 'The mountain\'s isolation',
        textAr: 'مهما كان الجبل قوياً، فإن رياح الغدر تنحت فيه. ترك القائد وحيداً يواجه مصيراً نسجته خيوط الحقد.',
        textEn: 'However strong the mountain, the winds of betrayal carve into it. The commander was left alone to face a fate woven by spite.',
        pos: 'center 20%',
        zoom: 1.04,
    },
    {
        photo: 10,
        img: '/album3/10.png',
        kickerAr: 'الفصل 8', kickerEn: 'Chapter 8',
        headAr: 'ميزان الظلم',
        headEn: 'The scale of injustice',
        textAr: 'سقطت العدالة في قاعة المحكمة قبل أن يسقط القائد. تم القبض على فهد بظلم قاهر وتهم ملفقة.',
        textEn: 'Justice fell in the courtroom before the commander fell. Fahad was arrested with oppressive injustice and fabricated charges.',
        pos: 'center 50%',
        zoom: 1.08,
    },
    {
        photo: 21,
        img: '/album3/21.png',
        kickerAr: 'الفصل 9', kickerEn: 'Chapter 9',
        headAr: 'فصل الغدر',
        headEn: 'The betrayal chapter',
        textAr: 'قبل النهاية جاء الحساب — ما تبقى من قائد وثق بالرجال الخطأ.',
        textEn: 'Before the end came the reckoning — what remained of a commander who trusted the wrong men.',
        pos: 'center 50%',
        zoom: 1.1,
    },
    {
        photo: 15,
        img: '/album3/15.jpg',
        kickerAr: 'الفصل 10', kickerEn: 'Chapter 10',
        headAr: 'خلود الأساطير (النهاية)',
        headEn: 'The immortality of legends (The end)',
        textAr: 'في مشهد تقشعر له الأبدان، نُفذ حكم الإعدام الجائر بحق القائد فهد المطيري ليروي بدمائه قصة غدر لن تنساها المدينة.',
        textEn: 'In a chilling scene, the unjust execution sentence was carried out against Commander Fahad Al-Mutairi, narrating with his blood a story of betrayal the city will never forget.',
        pos: 'center 0%',
        zoom: 1.03,
    },
];

/* scattered polaroid prints for the intro collage */
const POLAROIDS = [
    { src: '/album3/05.jpg', rot: -9, x: '6%', y: '12%', s: 1 },
    { src: '/album3/17.jpg', rot: 7, x: '82%', y: '10%', s: 0.92 },
    { src: '/album3/03.jpg', rot: -6, x: '12%', y: '66%', s: 0.95 },
    { src: '/album3/11.png', rot: 8, x: '76%', y: '64%', s: 1.05 },
    { src: '/album3/14.jpg', rot: -4, x: '46%', y: '78%', s: 0.8 },
];

const RAIN_COLOR = 'rgba(214,240,255,';
const GOLD = '#F2B33D';
const GOLD_DEEP = '#B8862B';
const CREAM = '#F7E3B0';

/* ---------- rain canvas ---------- */
const RainCanvas: React.FC = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let raf = 0; let w = 0; let h = 0;
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
            ctx.lineCap = 'round'; ctx.lineWidth = 1;
            for (const d of drops) {
                ctx.beginPath();
                ctx.strokeStyle = `${RAIN_COLOR}${d.o})`;
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
        build(); start();
        const onResize = () => { stop(); build(); start(); };
        const onVis = () => (document.hidden ? stop() : start());
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVis);
        return () => { stop(); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onVis); };
    }, []);
    return <canvas ref={ref} className="st-rain" aria-hidden="true" />;
};

export const StoryPage: React.FC<{ lang: Language }> = ({ lang }) => {
    const isAr = lang === 'ar';
    const total = CHAPTERS.length;

    const [started, setStarted] = useState(false);
    const [ch, setCh] = useState(0);
    const [ended, setEnded] = useState(false);
    const [playing, setPlaying] = useState<boolean>(() => typeof window === 'undefined' ? true : !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const touchX = useRef<number | null>(null);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [musicOn, setMusicOn] = useState(true);
    const musicOnRef = useRef(true);
    useEffect(() => { musicOnRef.current = musicOn; }, [musicOn]);
    useEffect(() => {
        const a = new Audio('/album3/9e77a4d5096f2bc167d5f9a93115903f_1.mp3');
        a.loop = true; a.volume = 0.75; a.preload = 'auto';
        audioRef.current = a;
        const kick = () => { if (musicOnRef.current && a.paused) a.play().catch(() => { }); };
        kick();
        window.addEventListener('pointerdown', kick);
        window.addEventListener('keydown', kick);
        return () => {
            window.removeEventListener('pointerdown', kick);
            window.removeEventListener('keydown', kick);
            a.pause();
            try { a.removeAttribute('src'); a.load(); } catch { }
            audioRef.current = null;
        };
    }, []);
    useEffect(() => {
        const a = audioRef.current; if (!a) return;
        if (musicOn) a.play().catch(() => { }); else a.pause();
    }, [musicOn]);

    const exit = useCallback((to = '#top') => {
        if (window.location.hash === to) { document.getElementById(to.slice(1))?.scrollIntoView({ behavior: 'smooth' }); window.scrollTo(0, 0); }
        else { window.location.hash = to; }
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

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    useEffect(() => {
        if (!started || ended || !playing) return;
        const id = window.setTimeout(next, CHAPTER_MS);
        return () => window.clearTimeout(id);
    }, [started, ended, playing, ch, next]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { exit(); return; }
            if (!started || ended) { if (e.key === 'Enter' && !started) setStarted(true); return; }
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
            .st-photo{position:absolute;inset:0;background-size:cover;
                animation:st-kb 9.5s ease-out forwards;will-change:transform;filter:saturate(1.05) contrast(1.03)}
            @keyframes st-kb{from{transform:scale(1)}to{transform:scale(var(--kb,1.14))}}
            .st-scrim{position:absolute;inset:0;pointer-events:none;
                background:linear-gradient(180deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.22) 26%,rgba(0,0,0,.16) 52%,rgba(0,0,0,.66) 76%,rgba(0,0,0,.96) 100%)}
            .st-grain{position:absolute;inset:0;pointer-events:none;opacity:.14;mix-blend-mode:overlay;
                background-image:radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px);background-size:3px 3px;
                animation:st-gr 1.2s steps(3) infinite}
            @keyframes st-gr{0%{transform:translate(0,0)}33%{transform:translate(-1.5%,1%)}66%{transform:translate(1%, -1.5%)}100%{transform:translate(0,0)}}
            .st-scan{position:absolute;inset:0;pointer-events:none;opacity:.2;background:repeating-linear-gradient(180deg, rgba(255,255,255,.035) 0 1px, transparent 1px 4px);mix-blend-mode:overlay}
            .st-rain{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;z-index:5}
            .st-bolt{position:absolute;inset:0;pointer-events:none;opacity:0;z-index:5;
                background:radial-gradient(70% 40% at 64% 6%, rgba(214,240,255,.3), transparent 66%);
                animation:st-bolt 14s ease-out infinite}
            @keyframes st-bolt{0%,90%{opacity:0}91%{opacity:.75}92%{opacity:.1}93%{opacity:.55}95%,100%{opacity:0}}
            .st-vig{position:absolute;inset:0;pointer-events:none;z-index:6;
                background:radial-gradient(125% 95% at 50% 46%, transparent 44%, rgba(0,0,0,.5) 86%, rgba(0,0,0,.88) 100%)}
            .st-bar{position:absolute;left:0;right:0;height:clamp(38px,7vh,64px);background:#000;z-index:8}
            .st-bar.top{top:0;border-bottom:1px solid rgba(255,255,255,.07)}
            .st-bar.bot{bottom:0;border-top:1px solid rgba(255,255,255,.07)}
            .st-top{position:absolute;top:clamp(38px,7vh,64px);left:0;right:0;z-index:10;
                display:flex;align-items:center;gap:.7rem;padding:.85rem 1rem}
            .st-x{width:42px;height:42px;border-radius:14px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;color:rgba(255,255,255,.75);
                background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(10px);transition:all .3s ease}
            .st-x:hover{color:#08060A;background:${CREAM};border-color:transparent;transform:rotate(90deg)}
            .st-replay{width:auto;height:54;padding:0 1.4rem;border-radius:20px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;gap:.6rem;font-size:14px;font-weight:900;white-space:nowrap;flex-direction:row;
                color:rgba(255,255,255,.75);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(10px);transition:background .3s ease,color .3s ease,transform .3s ease}
            .st-replay:hover{color:#08060A;background:${CREAM};border-color:transparent;transform:none}
            .st-count{margin-inline-start:auto;display:inline-flex;align-items:baseline;gap:.5rem;font-size:11px;font-weight:900;letter-spacing:.2em;color:rgba(255,255,255,.75)}
            .st-count b{font-size:20px;color:#fff}.st-count span{color:rgba(255,255,255,.35)}
            .st-play{width:42px;height:42px;border-radius:14px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;color:${CREAM};background:rgba(242,179,61,.12);border:1px solid rgba(242,179,61,.35);transition:all .3s ease}
            .st-play:hover{background:rgba(242,179,61,.25)}
            .st-body{position:absolute;z-index:10;left:0;right:0;bottom:calc(clamp(38px,7vh,64px) + 86px);
                padding:0 clamp(1.1rem,5vw,3.4rem);max-width:860px}
            .st-kick{display:inline-flex;align-items:center;gap:.55rem;font-size:10.5px;font-weight:900;letter-spacing:.26em;text-transform:uppercase;color:rgba(247,227,176,.85)}
            .st-kick::before{content:"";width:7px;height:7px;transform:rotate(45deg);background:${GOLD_DEEP};flex:none;box-shadow:0 0 12px rgba(184,134,43,.9)}
            .st-head{margin:.85rem 0 0;font-size:clamp(2rem,7vw,3.8rem);line-height:1.06;font-weight:900;letter-spacing:-.01em;text-shadow:0 10px 44px rgba(0,0,0,.8)}
            [dir="rtl"] .st-head{letter-spacing:0!important}
            .st-text{margin:.95rem 0 0;font-size:clamp(1rem,2.6vw,1.18rem);line-height:2.1;font-weight:500;color:rgba(255,255,255,.82);max-width:60ch;text-shadow:0 4px 22px rgba(0,0,0,.9)}
            .st-rise{opacity:0;transform:translateY(26px);animation:st-up 1s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--i) * 110ms)}
            @keyframes st-up{to{opacity:1;transform:none}}
            .st-ctl{position:absolute;z-index:10;left:0;right:0;bottom:clamp(38px,7vh,64px);padding:.85rem clamp(1.1rem,5vw,3.4rem);display:flex;align-items:center;gap:.8rem;background:linear-gradient(180deg,transparent,rgba(0,0,0,.55))}
            .st-arrow{width:46px;height:46px;border-radius:999px;flex:none;cursor:pointer;font-family:inherit;
                display:inline-flex;align-items:center;justify-content:center;color:${CREAM};background:rgba(242,179,61,.1);border:1px solid rgba(242,179,61,.35);backdrop-filter:blur(10px);transition:all .3s cubic-bezier(.16,1,.3,1)}
            .st-arrow:hover{color:#08060A;background:linear-gradient(180deg,${CREAM},${GOLD} 55%,#8A6320);border-color:transparent;transform:scale(1.07)}
            .st-arrow:active{transform:scale(.94)}
            .st-segs{flex:1;display:flex;gap:.45rem;min-width:0}
            .st-seg{position:relative;flex:1;height:4px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden}
            .st-seg.done{background:linear-gradient(90deg,${GOLD_DEEP},${CREAM} 60%,${GOLD})}
            .st-seg.cur .st-seg-fill{position:absolute;inset-block:0;inset-inline-start:0;border-radius:999px;
                background:linear-gradient(90deg,#F2CE7C,${CREAM} 55%,${GOLD});box-shadow:0 0 12px rgba(247,227,176,.8);animation:st-fill 9s linear forwards}
            @keyframes st-fill{from{width:0%}to{width:100%}}
            .st-hint{display:none;font-size:10px;font-weight:800;letter-spacing:.14em;color:rgba(255,255,255,.35);text-transform:uppercase;white-space:nowrap}
            @media(min-width:640px){.st-hint{display:block}}
            /* intro */
            .st-intro{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;text-align:center;padding:1.5rem;animation:st-in .8s ease both}
            .st-pol{position:absolute;width:clamp(120px,20vw,200px);aspect-ratio:4/5;border-radius:14px;overflow:hidden;
                border:6px solid rgba(255,255,255,.9);box-shadow:0 30px 70px -20px rgba(0,0,0,.9);opacity:.5;filter:saturate(.9) brightness(.9);animation:st-float 9s ease-in-out infinite}
            .st-pol img{width:100%;height:100%;object-fit:cover;display:block}
            @keyframes st-float{0%,100%{transform:translateY(0) rotate(var(--r))}50%{transform:translateY(-16px) rotate(var(--r))}}
            .st-eyebrow{display:inline-flex;align-items:center;gap:.6rem;padding:.55rem 1.05rem;border-radius:999px;font-size:10.5px;font-weight:900;letter-spacing:.24em;text-transform:uppercase;color:rgba(247,227,176,.85);background:rgba(242,179,61,.09);border:1px solid rgba(242,179,61,.28)}
            .st-title{font-size:clamp(2.8rem,11vw,6.2rem);line-height:1.02;font-weight:900;margin:1.4rem 0 0;
                background:linear-gradient(178deg,#FFFFFF 0%,#FFFAF0 40%,${CREAM} 76%,${GOLD} 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 14px 50px rgba(242,179,61,.35))}
            [dir="rtl"] .st-title{letter-spacing:0!important}
            .st-meta{margin:1.1rem 0 0;display:flex;align-items:center;justify-content:center;gap:.8rem;font-size:10.5px;font-weight:900;letter-spacing:.24em;color:rgba(255,255,255,.45);text-transform:uppercase}
            .st-meta i{width:5px;height:5px;transform:rotate(45deg);background:rgba(184,134,43,.9);flex:none}
            .st-begin{position:relative;margin-top:2.2rem;display:inline-flex;align-items:center;gap:.85rem;padding:1.05rem 2.4rem;border-radius:20px;cursor:pointer;font-family:inherit;
                font-size:15px;font-weight:900;color:#08060A;overflow:hidden;background:linear-gradient(180deg,${CREAM},${GOLD} 55%,#8A6320);
                box-shadow:0 22px 50px -14px rgba(242,179,61,.9),inset 0 1px 0 rgba(255,255,255,.55);transition:transform .35s cubic-bezier(.16,1,.3,1)}
            .st-begin:hover{transform:translateY(-2px) scale(1.02)}.st-begin:active{transform:scale(.97)}
            /* end screen — bold quote over the final image */
            .st-end{position:absolute;inset:0;z-index:12;display:flex;align-items:center;justify-content:center;text-align:center;padding:2rem 1.5rem;animation:st-in .8s ease both;background-size:cover;background-position:center}
            .st-end-scrim{position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(110% 70% at 50% 90%, rgba(0,0,0,.55), rgba(0,0,0,.92) 70%, rgba(0,0,0,.99) 100%)}
            .st-end-quote{position:relative;z-index:2;font-size:clamp(1.5rem,5vw,2.6rem);line-height:1.8;font-weight:900;max-width:34ch;color:#fff;text-shadow:0 14px 56px rgba(0,0,0,1);margin-top:4rem}
            [dir="rtl"] .st-end-quote{letter-spacing:0!important}
            .st-end-meta{position:relative;z-index:2;margin-top:1.4rem;display:flex;align-items:center;justify-content:center;gap:.8rem;font-size:10.5px;font-weight:900;letter-spacing:.24em;color:rgba(255,255,255,.45);text-transform:uppercase}
            .st-end-meta i{width:5px;height:5px;transform:rotate(45deg);background:rgba(184,134,43,.9);flex:none}
            .st-end-btns{position:relative;z-index:2;margin-top:2.6rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.8rem}
            a:focus-visible,button:focus-visible{outline:2px solid ${GOLD};outline-offset:3px;border-radius:14px}
            /* vertical photo — full art with blurred edges */
            .st-photo-vert{position:absolute;inset:0;overflow:hidden;background:#000;animation:st-kb 9.5s ease-out forwards;will-change:transform}
            .st-photo-vert-blur{position:absolute;inset:-20%;width:140%;height:140%;background-size:cover;background-position:center;filter:blur(46px) brightness(.55);opacity:.9;transform:scale(var(--kbv,1.1))}
            .st-photo-vert-img{position:absolute;inset:50% 50% 0 0;width:100%;height:100%;object-fit:contain;object-position:center;transform:translate(0,-50%);will-change:transform}
            @media(prefers-reduced-motion:reduce){
                .st-photo,.st-grain,.st-bolt,.st-pol,.st-seg.cur .st-seg-fill,.st-photo-vert,.st-photo-vert-blur,.st-photo-vert-img{animation:none!important}
                .st-rise{opacity:1!important;transform:none!important}.st-rain{display:none}
            }
            `}</style>

            {started && !ended && c.vertical ? (
                <div className="st-photo-vert" style={{
                    ['--kbv' as string]: c.zoom || 1.06,
                    zIndex: 1,
                }} aria-hidden="true">
                    <div className="st-photo-vert-blur" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos || 'center' }} />
                    <img className="st-photo-vert-img" src={c.img} alt="" decoding="async" loading="lazy" />
                </div>
            ) : (
                <div className="st-photo" style={{
                    backgroundImage: ended ? `url(${END_IMG})` : `url(${started ? c.img : '/album3/' + pad(1) + '.jpg'})`,
                    backgroundPosition: started ? (c.pos || 'center') : 'center',
                    ['--kb' as string]: started ? (c.zoom || 1.14) : 1.06,
                    zIndex: 1,
                }} aria-hidden="true" />
            )}
            <span className="st-scrim" style={{ zIndex: 2 }} aria-hidden="true" />
            <span className="st-grain" style={{ zIndex: 3 }} aria-hidden="true" />
            <span className="st-scan" style={{ zIndex: 4 }} aria-hidden="true" />
            <RainCanvas />
            <span className="st-bolt" aria-hidden="true" />

            <span className="st-bar top" aria-hidden="true" /><span className="st-bar bot" aria-hidden="true" /><span className="st-vig" aria-hidden="true" />

            {!started && (
                <div className="st-intro" style={{ backgroundImage: `url(/album3/09.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <span className="absolute inset-0 bg-black/55" aria-hidden="true" />
                    {POLAROIDS.map((p, i) => (
                        <span key={p.src} className="st-pol" style={{ left: p.x, top: p.y, ['--r' as string]: `${p.rot}deg`, transform: `scale(${p.s})`, animationDelay: `${i * -1.7}s`, zIndex: 1 }} aria-hidden="true">
                            <img src={p.src} alt="" loading="lazy" />
                        </span>
                    ))}
                    <div className="relative" style={{ zIndex: 2 }}>
                        <span className="st-eyebrow"><span className="w-1.5 h-1.5 rounded-full bg-[#F2B33D] animate-pulse" aria-hidden="true" /><span dir="ltr">فيلم قصير</span></span>
                        <h1 className={`st-title ${isAr ? 'font-arabic' : ''}`}>{isAr ? 'سيرة فهد المطيري' : 'The saga of Fahad Al-Mutairi'}</h1>
                        <div className="st-meta"><span>{isAr ? 'فهد' : 'FAHAD'}</span><i aria-hidden="true" /><span dir="ltr">FAHAD ERA</span><i aria-hidden="true" />                            <span>{isAr ? '١٠ فصول' : '10 chapters'}</span></div>
                        <div><button type="button" className="st-begin" onClick={() => setStarted(true)} autoFocus>
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#08060A] text-[#F2CE7C]" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
                            {isAr ? 'ابدأ السيرة' : 'Begin the story'}
                        </button></div>
                        <p className="mt-4 text-[10.5px] font-bold tracking-[.2em] text-white/35 uppercase">{isAr ? 'الأفضل مع الصوت مرفوعاً' : 'Best with sound up'}</p>
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
                            {musicOn ? (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V6l11-3.5V16" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>) : (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V6l11-3.5V16" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /><path d="M3 3l18 18" /></svg>)}
                        </button>
                        <button type="button" className="st-play" onClick={() => setPlaying((p) => !p)} aria-label={isAr ? (playing ? 'إيقاف' : 'تشغيل') : (playing ? 'Pause' : 'Play')}>
                            {playing ? (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>) : (<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>)}
                        </button>
                    </div>
                    <div className="st-body" key={`body-${ch}`}>
                        <span className="st-rise st-kick" style={{ ['--i' as string]: 0 }}>{isAr ? c.kickerAr : c.kickerEn}</span>
                        <h2 className={`st-rise st-head ${isAr ? 'font-arabic' : ''}`} style={{ ['--i' as string]: 1 }}>{isAr ? c.headAr : c.headEn}</h2>
                        <p className="st-rise st-text" style={{ ['--i' as string]: 2 }}>{isAr ? c.textAr : c.textEn}</p>
                    </div>
                    <div className="st-ctl">
                        <button type="button" className="st-arrow" onClick={prev} aria-label={isAr ? 'السابق' : 'Previous'}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={isAr ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"} /></svg>
                        </button>
                        <div className="st-segs" role="progressbar" aria-valuenow={ch + 1} aria-valuemin={1} aria-valuemax={total} aria-label={isAr ? 'تقدم السيرة' : 'Story progress'}>
                            {CHAPTERS.map((_, i) => {
                                const done = i < ch;
                                const cur = i === ch;
                                return (
                                    <span key={i} className={`st-seg${done ? ' done' : cur ? ' cur' : ''}`}>
                                        {cur && playing && <span key={`fill-${ch}`} className="st-seg-fill" />}
                                    </span>
                                );
                            })}
                        </div>
                        <button type="button" className="st-arrow" onClick={next} aria-label={isAr ? 'التالي' : 'Next'}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={isAr ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} /></svg>
                        </button>
                        <span className="st-hint">{isAr ? 'اسحب أو استخدم الأسهم' : 'Swipe or use arrows'}</span>
                    </div>
                </>
            )}

            {started && ended && (
                <div className="st-end" style={{ backgroundImage: `url(${END_IMG})` }}>
                    <span className="st-end-scrim" aria-hidden="true" />
                    <div>
                        <span className="st-eyebrow"><span className="w-1.5 h-1.5 rotate-45 bg-[#F2B33D]" aria-hidden="true" /><span dir="ltr">FAHAD</span></span>
                        <p className={`st-end-quote mt-6 ${isAr ? 'font-arabic' : ''}`}>
                            {isAr ? '«قد يغتالون الجسد بحقدهم، لكن التاريخ لا يرحم الخائنين.. لم تسقط هيبة فهد المطيري حين ركع، بل سقط شرف العسكرية في وحل الغدر.»' : '“They may assassinate the body with their hatred, but history does not forgive the traitors.. Fahad Al-Mutairi\'s prestige did not fall when he knelt — military honor fell into the mire of betrayal.”'}
                        </p>
                        <div className="st-end-meta"><span dir="ltr">GOLDEN KINGDOM</span><i aria-hidden="true" /><span dir="ltr">FAHAD ERA</span></div>
                        <div className="st-end-btns">
                            <button type="button" className="st-begin" style={{ marginTop: 0 }} onClick={() => exit('#album')}>
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#08060A] text-[#F2CE7C]" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>
                                {isAr ? 'ارجع إلى سيرة فهد' : 'Return to FAHAD’s sirah'}
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
