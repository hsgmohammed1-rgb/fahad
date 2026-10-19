import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Language } from '../types';
import { ALBUM3_FILES } from './album3Images';

/* ============================================================
   STORY — سيرة فهد المطيري. صفحة سينمائية مستقلة تملأ الشاشة.
   الصور من فولدر album3 (التصاميم الجديدة)، تسعة فصول وفق scénario
   الذي طلبه فهد. تُصل إليها عبر #story وتعود للموقع عند الخروج.
   ============================================================ */

/* Every chapter holds for 9 seconds — a steady, cinematic pace for
   the whole story regardless of how much text a scene carries. */
const BASE_CHAPTER_MS = 9000;

const chapterMs = (c: Chapter) => BASE_CHAPTER_MS;

const pad = (n: number) => String(n).padStart(2, '0');
const ext = (n: number) => (ALBUM3_FILES[n - 1]?.endsWith('.png') ? 'png' : 'jpg');

interface Chapter {
    photo: number;
    img: string;
    kickerAr: string; kickerEn: string;
    headAr: string; headEn: string;
    textAr: string; textEn: string;
    pos?: string;
    /** where the Ken Burns zoom pivots — keeps the focal corner pinned */
    origin?: string;
    /** Ken Burns end-zoom */
    zoom?: number;
    /** render with blurred edges for vertical art */
    vertical?: boolean;
}

const END_IMG = `/album3/20.png`;

const CHAPTERS: Chapter[] = [
    {
        photo: 8,
        img: '/album3/08.png',
        kickerAr: 'الفصل 1', kickerEn: 'Chapter 1',
        headAr: 'شَرارَةُ الطُّموح',
        headEn: 'The spark of ambition',
        textAr: 'لم تكن النجوم على كتفه هبةً من أحد. بدأ مسيرته بعرق الجبين، عسكريٌ يربط ليله بنهاره، مؤمناً بأن الاجتهاد هو السبيل الوحيد لفرض النظام وكتابة التاريخ.',
        textEn: 'The stars on his shoulder were no gift from anyone. He began his career with sweat and discipline, a soldier who ties his nights to his days, believing hard work is the only path to impose order and write history.',
        pos: 'center 30%',
        zoom: 1.12,
    },
    {
        photo: 11,
        img: '/album3/11.png',
        kickerAr: 'الفصل 2', kickerEn: 'Chapter 2',
        headAr: 'حَارِسُ لَيَالي المَدينَة',
        headEn: 'Guardian of the city nights',
        textAr: 'جاب شوارع المدينة المظلمة حتى تربع على قيادة قطاع الشيرف. لم تغيره المناصب، بل زادته صرامة ورغبة جامحة في تطهير القطاع من كل متخاذل.',
        textEn: 'He rode the dark streets of the city until he took command of the sheriff sector. Posts never changed him — they only sharpened him, and fed his fierce will to cleanse the sector of every slacker.',
        pos: 'center 100%',
        zoom: 1.12,
    },
    {
        photo: 12,
        img: '/album3/12.png',
        kickerAr: 'الفصل 3', kickerEn: 'Chapter 3',
        headAr: 'هَيبَةُ القِيَادَة',
        headEn: 'The authority of command',
        textAr: 'فرض شخصيته القيادية بقوة لا تقبل المساومة. كان يرى في الانضباط درعاً للمدينة، ولم يكن في قاموسه مكان لمن يختلق الأعذار أو يتقاعس عن واجبه.',
        textEn: 'He imposed his commanding presence with a force that accepted no compromise. He saw discipline as the city\'s shield, and his vocabulary held no room for those who invent excuses or shirk their duty.',
        pos: 'center 25%',
        zoom: 1.12,
    },
    {
        photo: 24,
        img: '/album3/24.png',
        kickerAr: 'الفصل 4', kickerEn: 'Chapter 4',
        headAr: 'شَرَارَةُ العَدَاوَة',
        headEn: 'The spark of enmity',
        textAr: 'في واقعة بنك ساندي، اصطدمت صرامة فهد بتراخي "عبدالصمد" العائد من إجازته. فأصدر القائد قراراً حازماً بإعادة تأهيله لعدم كفاءته، لتشتعل شرارة الحقد.',
        textEn: 'At the Sandy bank incident, Fahad\'s sternness collided with the negligence of "Abdulsamad", back from leave. The commander issued a firm order sending him back for rehabilitation — and the spark of hatred lit.',
        pos: 'center 30%',
        zoom: 1.1,
    },
    {
        photo: 26,
        img: '/album3/26.png',
        kickerAr: 'الفصل 5', kickerEn: 'Chapter 5',
        headAr: 'تَحالُفُ الأَقوِيَاء',
        headEn: 'Alliance of the strong',
        textAr: 'تحول قرار التأهيل إلى عداوة وتأسيس لفرقة متمردة. لم يقف فهد مكتوف الأيدي، بل وحّد صفوفه مع كبار قادة المدينة لردع هذا التمرد الناشئ في مهده.',
        textEn: 'The rehabilitation order turned into enmity and the seed of a rebel squad. Fahad did not stand idle — he united his ranks with the city\'s senior commanders to deter the rebellion in its cradle.',
        pos: 'center 30%',
        zoom: 1.1,
    },
    {
        photo: 17,
        img: '/album3/17.jpg',
        kickerAr: 'الفصل 6', kickerEn: 'Chapter 6',
        headAr: 'دِرعُ الشِّيرِف',
        headEn: 'The sheriff\'s shield',
        textAr: 'استند القائد المحنك إلى رجال يثق بهم، مثل الشريف "بكر باكور" والقائد "كيلر تشاندلر". ظن أن قوة التحالفات ستكون كافية لتحطيم موجة الغدر قبل أن تكبر.',
        textEn: 'The seasoned commander leaned on men he trusted, like Sheriff "Bakr Bakur" and Commander "Killer Chandler". He believed the strength of the alliances would crush the wave of betrayal before it grew.',
        pos: 'center 30%',
        zoom: 1.12,
    },
    {
        photo: 23,
        img: '/album3/23.jpg',
        kickerAr: 'الفصل 7', kickerEn: 'Chapter 7',
        headAr: 'خَنَاجِرُ الكَوَالِيس',
        headEn: 'Backstage daggers',
        textAr: 'انتقلت الحرب من الميدان إلى الغرف المغلقة. كثرت الشكاوى الكيدية وتصيد الأخطاء، وتحولت الزمالة العسكرية إلى ساحة دنيئة لتصفية الحسابات الشخصية.',
        textEn: 'The war moved from the field into closed rooms. Malicious complaints and fault-finding multiplied, and military fellowship turned into a dirty arena for settling personal scores.',
        pos: 'center 30%',
        zoom: 1.1,
    },
    {
        photo: 22,
        img: '/album3/22.jpg',
        kickerAr: 'الفصل 8', kickerEn: 'Chapter 8',
        headAr: 'عُزلَةُ الجَبَل',
        headEn: 'The mountain\'s isolation',
        textAr: 'مهما كان الجبل شامخاً، فإن رياح الغدر تنحت فيه. وجد القائد نفسه يصارع نظاماً تم اختراقه، ليُترك وحيداً في مكتبه يواجه مؤامرة حُيكت في الظلام.',
        textEn: 'However lofty the mountain, the winds of betrayal carve into it. The commander found himself fighting a system that had been infiltrated, left alone in his office against a plot woven in the dark.',
        pos: 'center 30%',
        zoom: 1.06,
    },
    {
        photo: 10,
        img: '/album3/10.png',
        kickerAr: 'الفصل 9', kickerEn: 'Chapter 9',
        headAr: 'فَخُّ الذِّئَاب',
        headEn: 'The wolves\' trap',
        textAr: 'اكتملت فصول المؤامرة وسقطت الأقنعة. حُوصر القائد بخيانة من أقسموا على حماية الشعار ذاته، ليدرك أن أقسى طعنة هي تلك التي تأتيك من سلاح زميلك.',
        textEn: 'The chapters of the plot were complete and the masks fell. The commander was surrounded by the betrayal of those who swore to protect the very same banner — learning that the cruelest blow is the one dealt by a comrade\'s blade.',
        pos: 'center 30%',
        zoom: 1.1,
    },
    {
        photo: 21,
        img: '/album3/21.png',
        kickerAr: 'الفصل 10', kickerEn: 'Chapter 10',
        headAr: 'مِيزَانُ الظُّلم',
        headEn: 'The scale of injustice',
        textAr: 'سِيق القائد إلى قاعة المحكمة بتهم ملفقة وظلم قاهر. غابت الحقيقة وحضرت المصالح الشخصية، لتُذبح العدالة على طاولة القضاء قبل أن يُذبح فهد.',
        textEn: 'The commander was dragged into the courtroom on fabricated charges and flagrant injustice. Truth vanished and personal interests took its place, so justice was slaughtered on the bench before Fahad was.',
        pos: 'center 30%',
        zoom: 1.08,
    },
    {
        photo: 27,
        img: '/album3/27.png',
        kickerAr: 'الفصل 11', kickerEn: 'Chapter 11',
        headAr: 'اغتِيَالُ العَدالَة',
        headEn: 'The murder of justice',
        textAr: 'بدم بارد وأمام أعين "شبيب" و"عبدالله المهنا"، نُفذ حكم الإعدام الجائر. سقط جسد القائد فهد المطيري، لتسقط معه هيبة القانون وشرف العسكرية.',
        textEn: 'With cold blood and before the eyes of "Shuaib" and "Abdullah Al-Muhanna", the unjust execution sentence was carried out. Commander Fahad Al-Mutairi\'s body fell — and with it, the authority of law and military honor.',
        pos: 'center 30%',
        zoom: 1.1,
    },
    {
        photo: 15,
        img: '/album3/15.jpg',
        kickerAr: 'الفصل 12', kickerEn: 'Chapter 12',
        headAr: 'خُلُودُ الأَسَاطِير',
        headEn: 'The immortality of legends',
        textAr: 'رحل القائد وترك إرثاً لا يُمحى. ظنوا أن رصاصهم سينهي قصته، لكن دماءه كتبت تاريخاً جديداً، ليصبح اسمه أسطورة تطارد قاتليه إلى الأبد.',
        textEn: 'The commander departed leaving a legacy no one can erase. They thought their bullets would end his story, but his blood wrote a new history — and his name became a legend that will hunt his killers forever.',
        pos: 'left top',
        origin: 'left top',
        zoom: 1.04,
    },
];

/* scattered polaroid prints for the intro collage */
const POLAROIDS = [
    { src: '/album3/08.png', rot: -9, x: '6%', y: '12%', s: 1 },
    { src: '/album3/26.png', rot: 7, x: '82%', y: '10%', s: 0.92 },
    { src: '/album3/12.png', rot: -6, x: '12%', y: '66%', s: 0.95 },
    { src: '/album3/27.png', rot: 8, x: '76%', y: '64%', s: 1.05 },
    { src: '/album3/24.png', rot: -4, x: '46%', y: '78%', s: 0.8 },
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
    /* seconds left in the current chapter — drives the visible countdown */
    const [left, setLeft] = useState(0);
    /* black wipe that covers the cut between two chapters */
    const [wipe, setWipe] = useState(0);
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

    /* --- black wipe between chapters -------------------------------
       phase 0 = clear, 1 = fading to black, 2 = black then back.
       The chapter only swaps while the screen is fully black, so the
       viewer never sees a hard cut.                                    */
    const wipeTimer = useRef<number | null>(null);
    const wipeRef = useRef(0);
    const chRef = useRef(0);
    const endedRef = useRef(false);
    useEffect(() => { chRef.current = ch; }, [ch]);
    useEffect(() => { endedRef.current = ended; }, [ended]);

    const swap = useCallback((delta: number) => {
        if (wipeRef.current) return;              // a wipe is already running
        wipeRef.current = 1;
        setWipe(1);
        wipeTimer.current = window.setTimeout(() => {
            wipeRef.current = 2;
            setWipe(2);
            const cur = chRef.current;
            const wasEnded = endedRef.current;
            if (wasEnded) {
                setEnded(false);
                setCh(delta > 0 ? 0 : total - 1);
            } else if (delta < 0) {
                setCh((p) => (p - 1 + total) % total);
            } else if (cur >= total - 1) {
                setEnded(true);
            } else {
                setCh(cur + 1);
            }
            wipeTimer.current = window.setTimeout(() => {
                wipeRef.current = 0;
                setWipe(0);
            }, 60);
        }, 420);
    }, [total]);
    useEffect(() => () => { if (wipeTimer.current) window.clearTimeout(wipeTimer.current); }, []);

    const next = useCallback(() => { swap(1); }, [swap]);
    const prev = useCallback(() => { swap(-1); }, [swap]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    /* per-chapter runtime — the longer the text, the longer the scene holds */
    const sceneMs = chapterMs(CHAPTERS[ch]);

    useEffect(() => {
        if (!started || ended || !playing) return;
        const id = window.setTimeout(() => swap(1), sceneMs);
        return () => window.clearTimeout(id);
    }, [started, ended, playing, ch, sceneMs, swap]);

    /* visible countdown — ticks every second, resets on every chapter change */
    useEffect(() => {
        if (!started || ended || !playing) return;
        setLeft(Math.round(sceneMs / 1000));
        const id = window.setInterval(() => {
            setLeft((s) => (s <= 1 ? 0 : s - 1));
        }, 1000);
        return () => window.clearInterval(id);
    }, [started, ended, playing, ch, sceneMs]);

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
            style={{ ['--chapms' as string]: `${sceneMs}ms` }}
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
                animation:st-kb var(--chapms,9s) ease-out forwards,st-photo-in .7s ease-out both;
                will-change:transform;filter:saturate(1.05) contrast(1.03)}
            @keyframes st-photo-in{from{opacity:0}to{opacity:1}}
            @keyframes st-kb{from{transform:scale(1)}to{transform:scale(var(--kb,1.14))}}
            .st-scrim{position:absolute;inset:0;pointer-events:none;
                background:linear-gradient(180deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.22) 26%,rgba(0,0,0,.16) 52%,rgba(0,0,0,.66) 76%,rgba(0,0,0,.96) 100%)}
            .st-grain{position:absolute;inset:0;pointer-events:none;opacity:.14;mix-blend-mode:overlay;
                background-image:radial-gradient(rgba(255,255,255,.55) 1px, transparent 1px);background-size:3px 3px;
                animation:st-gr 1.2s steps(3) infinite}
            @keyframes st-gr{0%{transform:translate(0,0)}33%{transform:translate(-1.5%,1%)}66%{transform:translate(1%, -1.5%)}100%{transform:translate(0,0)}}
            .st-scan{position:absolute;inset:0;pointer-events:none;opacity:.2;background:repeating-linear-gradient(180deg, rgba(255,255,255,.035) 0 1px, transparent 1px 4px);mix-blend-mode:overlay}
            .st-rain{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;mix-blend-mode:screen;z-index:5}
            /* black wipe between chapters */
            .st-wipe{position:absolute;inset:0;z-index:11;pointer-events:none;background:#000;opacity:0;
                transition:opacity .42s cubic-bezier(.4,0,.2,1)}
            .st-wipe.on{opacity:1}
            .st-wipe.peak{opacity:1;transition:opacity .06s linear}
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
            .st-timer{margin-inline-start:.35rem;display:inline-flex;align-items:center;gap:.3rem;
                font-size:11px;font-weight:900;letter-spacing:.12em;color:rgba(247,227,176,.75);
                background:rgba(242,179,61,.1);border:1px solid rgba(242,179,61,.28);
                border-radius:999px;padding:.3rem .6rem;font-variant-numeric:tabular-nums}
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
                background:linear-gradient(90deg,#F2CE7C,${CREAM} 55%,${GOLD});box-shadow:0 0 12px rgba(247,227,176,.8);
                animation:st-fill var(--chapms,9s) linear forwards}
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
            .st-end-scrim{position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(140% 100% at 50% 100%, rgba(0,0,0,.06), rgba(0,0,0,.30) 50%, rgba(0,0,0,.5) 82%, rgba(0,0,0,.62) 100%)}
            /* soft local shade right behind the words — keeps them readable
               without dimming the whole frame */
            .st-end-halo{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                width:min(1200px,95vw);height:min(66vh,620px);pointer-events:none;z-index:1;
                background:radial-gradient(closest-side,rgba(0,0,0,.6),rgba(0,0,0,.34) 52%,transparent 100%);
                filter:blur(18px)}
            .st-end-quote{position:relative;z-index:2;font-size:clamp(1.5rem,5vw,2.6rem);line-height:1.8;font-weight:900;max-width:34ch;color:#fff;text-shadow:0 4px 20px rgba(0,0,0,.9),0 0 60px rgba(0,0,0,.7);margin-top:4rem}
            [dir="rtl"] .st-end-quote{letter-spacing:0!important}
            .st-end-meta{position:relative;z-index:2;margin-top:1.4rem;display:flex;align-items:center;justify-content:center;gap:.8rem;font-size:10.5px;font-weight:900;letter-spacing:.24em;color:rgba(255,255,255,.45);text-transform:uppercase}
            .st-end-meta i{width:5px;height:5px;transform:rotate(45deg);background:rgba(184,134,43,.9);flex:none}
            .st-end-btns{position:relative;z-index:2;margin-top:2.6rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.8rem}
            a:focus-visible,button:focus-visible{outline:2px solid ${GOLD};outline-offset:3px;border-radius:14px}
            /* vertical photo — full art with blurred edges */
            .st-photo-vert{position:absolute;inset:0;overflow:hidden;background:#000;
                animation:st-kb var(--chapms,9s) ease-out forwards,st-photo-in .7s ease-out both;will-change:transform}
            .st-photo-vert-blur{position:absolute;inset:-20%;width:140%;height:140%;background-size:cover;background-position:center;filter:blur(46px) brightness(.55);opacity:.9;transform:scale(var(--kbv,1.1))}
            .st-photo-vert-img{position:absolute;inset:50% 50% 0 0;width:100%;height:100%;object-fit:contain;object-position:center;transform:translate(0,-50%);will-change:transform}
            @media(prefers-reduced-motion:reduce){
                .st-photo,.st-grain,.st-bolt,.st-pol,.st-seg.cur .st-seg-fill,.st-photo-vert,.st-photo-vert-blur,.st-photo-vert-img{animation:none!important}
                .st-rise{opacity:1!important;transform:none!important}.st-rain{display:none}
                .st-wipe{transition:none!important}
            }
            `}</style>

            {started && !ended && c.vertical ? (
                <div key={`vert-${ch}`} className="st-photo-vert" style={{
                    ['--kbv' as string]: c.zoom || 1.06,
                    ['--chapms' as string]: `${sceneMs}ms`,
                    zIndex: 1,
                }} aria-hidden="true">
                    <div className="st-photo-vert-blur" style={{ backgroundImage: `url(${c.img})`, backgroundPosition: c.pos || 'center' }} />
                    <img className="st-photo-vert-img" src={c.img} alt="" decoding="async" loading="lazy" />
                </div>
            ) : (
                <div key={ended ? 'end' : `photo-${ch}`} className="st-photo" style={{
                    backgroundImage: ended ? `url(${END_IMG})` : `url(${started ? c.img : '/album3/' + pad(1) + '.jpg'})`,
                    backgroundPosition: started ? (c.pos || 'center') : 'center',
                    transformOrigin: c.origin || 'center',
                    ['--kb' as string]: started ? (c.zoom || 1.14) : 1.06,
                    ['--chapms' as string]: `${sceneMs}ms`,
                    zIndex: 1,
                }} aria-hidden="true" />
            )}
            <span className="st-scrim" style={{ zIndex: 2 }} aria-hidden="true" />
            <span className="st-grain" style={{ zIndex: 3 }} aria-hidden="true" />
            <span className="st-scan" style={{ zIndex: 4 }} aria-hidden="true" />
            <RainCanvas />
            <span className="st-bolt" aria-hidden="true" />

            <span className="st-bar top" aria-hidden="true" /><span className="st-bar bot" aria-hidden="true" /><span className="st-vig" aria-hidden="true" />

            {/* black wipe — covers the cut between two chapters */}
            <span className={`st-wipe${wipe === 1 ? ' on' : wipe === 2 ? ' peak' : ''}`} aria-hidden="true" />

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
                        <div className="st-meta"><span>{isAr ? 'فهد' : 'FAHAD'}</span><i aria-hidden="true" /><span dir="ltr">FAHAD ERA</span><i aria-hidden="true" />                            <span>{isAr ? '١٢ فصلًا' : '12 chapters'}</span></div>
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
                        <span className="st-timer" dir="ltr" aria-label={isAr ? 'الوقت المتبقي' : 'Time remaining'}>
                            {pad(Math.floor(left / 60))}:{pad(left % 60)}
                        </span>
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
                    <span className="st-end-halo" aria-hidden="true" />
                    <div>
                        <span className="st-eyebrow"><span className="w-1.5 h-1.5 rotate-45 bg-[#F2B33D]" aria-hidden="true" /><span dir="ltr">{isAr ? 'النهاية' : 'THE END'}</span></span>
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
