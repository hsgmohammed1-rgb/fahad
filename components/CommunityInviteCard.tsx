import React from 'react';
import { Language } from '../types';
import { KickIcon } from './Icons';

/**
 * The live chat widget used to sit here, but Kick retired the public
 * realtime feed — their own site now talks to a signed, private endpoint
 * that answers 404 to anyone else, so no third-party site can subscribe
 * any more. This card keeps the conversation inside the broadcast: while
 * the stream is up, it hands the viewer straight to Kick to watch and
 * chat in one place.
 */

const KICK_URL = 'https://kick.com/fahad';

const CommunityInviteCard: React.FC<{ lang: Language; viewers?: number }> = ({ lang, viewers = 0 }) => {
    const isAr = lang === 'ar';

    const copy = isAr
        ? {
            title: 'أبث الآن.. حياك بالدردشة!',
            sub: 'البث شغال الان، تعال سولف معنا وشاركنا الحماس على KICK.',
            cta: 'انضم إلى دردشة KICK وأنت معنا',
            get: 'وش بتلقى',
            perks: ['دردشة مباشرة وتفاعل حي مع المجتمع', 'إجابات فورية على أسئلتك وسوالف ممتعة', 'تحديات حماسية وجوائز أسبوعية قيّمة'],
        }
        : {
            title: 'Chat with me while I stream',
            sub: "The stream is on right now — jump into KICK and talk to everyone.",
            cta: 'Enter KICK and join the chat',
            get: 'WHAT YOU GET',
            perks: ['Talk with the crowd in real time', 'React and answer questions', 'Weekly challenges and drops'],
        };

    return (
        <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-[#B8862B]/30 bg-gradient-to-b from-[#16110A] via-[#0B0907] to-[#08060A] flex flex-col">
            {/* living gold glow */}
            <div className="absolute -top-24 start-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#F2B33D]/20 blur-[90px] animate-aurora pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-28 start-1/4 w-64 h-64 rounded-full bg-[#E07B12]/15 blur-[100px] animate-aurora pointer-events-none" style={{ animationDelay: '-9s' }} aria-hidden="true" />

            {/* top hairline + sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#F7E3B0]/80 to-transparent" aria-hidden="true" />
            <div className="card-sheen pointer-events-none" aria-hidden="true" />

            <div className="relative flex flex-col items-center text-center px-5 pt-7 pb-5 shrink-0">
                {/* emblem */}
                <div className="relative">
                    <span className="halo-conic -inset-3" aria-hidden="true" />
                    <span className="relative block w-20 h-20 rounded-full overflow-hidden border-2 border-[#FDEFC9]/80 ring-radiant">
                        <img src="/fahad-logo.png" alt="" className="w-full h-full object-cover" loading="lazy" />
                    </span>
                    <span className="absolute -bottom-0.5 -end-0.5 flex items-center gap-1 rounded-full border border-[#08060A] bg-black px-2 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#53FC18] animate-pulse shadow-[0_0_8px_#53FC18]" />
                        <span className="text-[9px] font-black tracking-[0.18em] text-white/80" dir="ltr">LIVE</span>
                    </span>
                </div>

                <h3 className="mt-5 text-xl sm:text-2xl font-black text-white leading-tight text-balance" dir="auto">
                    {copy.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55 font-medium text-balance" dir="auto">
                    {copy.sub}
                </p>

                {/* the one button */}
                <a href={KICK_URL} target="_blank" rel="noopener noreferrer"
                    className="btn-radiant group mt-6 inline-flex w-full items-center justify-between gap-3 rounded-2xl px-6 py-4 font-black text-[15px] sm:text-base">
                    <span className="inline-flex items-center gap-2.5 min-w-0">
                        <KickIcon className="w-6 h-6 shrink-0" />
                        <span className="truncate">{copy.cta}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 shrink-0">
                        {viewers > 0 && (
                            <span className="text-[13px] tabular-nums opacity-85" dir="ltr">
                                {viewers.toLocaleString('en-US')}
                            </span>
                        )}
                        <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </span>
                </a>
            </div>

            {/* what you get */}
            <div className="relative mt-auto px-5 pb-5 shrink-0">
                <div className="rounded-2xl border border-[#B8862B]/22 bg-white/[0.03] px-4 py-3.5">
                    <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#F2CE7C]/70 mb-2.5" dir={isAr ? 'rtl' : 'ltr'}>
                        {copy.get}
                    </p>
                    <ul className="flex flex-col gap-2">
                        {copy.perks.map((p) => (
                            <li key={p} className="flex items-center gap-2.5 text-[12.5px] font-bold text-white/70" dir="auto">
                                <svg className="w-3.5 h-3.5 shrink-0 text-[#F2B33D]" fill="none" stroke="currentColor" strokeWidth={3.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                {p}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommunityInviteCard;