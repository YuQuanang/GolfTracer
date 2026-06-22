import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--ink-3)',
        paddingTop: '3rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div className="container">
        {/* Top row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: '3rem',
          alignItems: 'start',
          marginBottom: '2.5rem',
        }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.75rem' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--cream)', letterSpacing: '-0.01em' }}>Golf</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', fontWeight: 800, color: 'var(--bronze)', letterSpacing: '0.04em' }}>TRACER</span>
            </Link>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: 'var(--mist)', lineHeight: 1.7, maxWidth: 260 }}>
              AI ball-flight tracing, entirely in your browser. No uploads. No servers. No compromise.
            </p>
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.7rem', borderRadius: 'var(--r-full)', background: 'var(--ink-3)', border: '1px solid var(--ink-4)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fairway-lt)', boxShadow: '0 0 5px var(--fairway-lt)', animation: 'float 2.5s ease-in-out infinite', display: 'inline-block' }} />
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.67rem', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ash)' }}>All processing on-device</span>
            </div>
          </div>

          {/* Nav column */}
          <div>
            <p className="t-label" style={{ marginBottom: '1rem', color: 'var(--smoke)' }}>Pages</p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[['/', 'Home'], ['/tracer', 'Tracer Tool'], ['/pricing', 'Pricing'], ['/about', 'About']].map(([path, label]) => (
                <Link key={path} to={path} style={{
                  textDecoration: 'none',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.85rem',
                  color: 'var(--mist)',
                  transition: 'color 200ms',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--mist)'}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Privacy callout */}
          <div style={{
            padding: '1.25rem',
            background: 'var(--ink-2)',
            border: '1px solid var(--ink-4)',
            borderRadius: 'var(--r-md)',
            maxWidth: 220,
          }}>
            <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--bronze)', marginBottom: '0.5rem' }}>
              🔒 Private by Design
            </p>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: 'var(--mist)', lineHeight: 1.65 }}>
              Videos never leave your device. Processing runs locally via WebAssembly.
            </p>
          </div>
        </div>

        {/* Divider */}
        <hr className="rule" style={{ margin: '0 0 1.5rem' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.78rem', color: 'var(--smoke)' }}>
            © {year} GolfTracer. All rights reserved.
          </p>
          <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.72rem', color: 'var(--ink-5)', letterSpacing: '0.06em' }}>
            POWERED BY YOLOV8 · ONNXRUNTIME · FFMPEG.WASM
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          footer > .container > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}