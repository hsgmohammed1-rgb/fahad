import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Catches a render crash and shows something instead of a black page.
 *
 * Without this, any throw during the first render leaves `<div id="root">`
 * empty and the visitor only sees the black body — with no way to tell what
 * happened. The message is deliberately plain: this is the one screen shown to
 * a visitor who cannot act on a stack trace.
 */
class RootBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error, info: unknown) {
        console.error('[fahad] render failed', error, info);
        // بلّغ السيرفر حتى يُقرأ الخطأ من لوحة التشخيص بدون ما ينسخه المستخدم.
        // fire-and-forget: التبليغ نفسه لا يكسر شيئاً أبداً.
        try {
            const stack = (error as Error)?.stack || '';
            fetch('/api/client-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: String((error as Error)?.message || error).slice(0, 500),
                    stack: String(stack).slice(0, 2000),
                    url: window.location.pathname.slice(0, 200),
                    ua: navigator.userAgent.slice(0, 200),
                }),
            }).catch(() => undefined);
        } catch {
            /* ignore */
        }
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        return (
            <div dir="rtl" style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '1rem',
                padding: '2rem', textAlign: 'center', background: '#08060A', color: '#fff',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
            }}>
                <img src="/fahad-logo.png" alt="" width={72} height={72}
                    style={{ borderRadius: '50%', boxShadow: '0 0 50px rgba(242,179,61,0.6)' }} />
                <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>الموقع ما قدر يشتغل</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '32rem', margin: 0, lineHeight: 1.9 }}>
                    صار خطأ أثناء تحميل الصفحة. جرّب تحديث الصفحة، وإذا تكرر — افتح الموقع من متصفح ثاني.
                </p>
                <code style={{
                    color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', maxWidth: '32rem',
                    wordBreak: 'break-word', direction: 'ltr',
                }}>
                    {error.message}
                </code>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '14px',
                        border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem',
                        background: 'linear-gradient(180deg,#FDEFC9,#F2B33D 55%,#B8862B)', color: '#08060A',
                    }}
                >
                    أعد تحميل الصفحة
                </button>
            </div>
        );
    }
}

/** Shown until React mounts. The body is black, so a plain dark loader. */
function Boot() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '0.9rem',
            alignItems: 'center', justifyContent: 'center',
            background: '#08060A',
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'system-ui, sans-serif', fontSize: '0.85rem', letterSpacing: '0.2em',
        }}>
            <img src="/fahad-logo.png" alt="" width={64} height={64}
                style={{ borderRadius: '50%', boxShadow: '0 0 44px rgba(242,179,61,0.55)' }} />
            <div>FAHAD…</div>
        </div>
    );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

rootElement.innerHTML = '';
const boot = document.createElement('div');
boot.id = 'fahad-boot';
rootElement.appendChild(boot);

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <RootBoundary>
            <React.Suspense fallback={<Boot />}>
                <App />
            </React.Suspense>
        </RootBoundary>
    </React.StrictMode>,
);

// Remove the placeholder once React has painted, whatever it painted.
requestAnimationFrame(() => document.getElementById('fahad-boot')?.remove());