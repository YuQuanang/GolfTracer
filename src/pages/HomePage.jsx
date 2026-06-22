import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/* ── Animated golf ball canvas ─────────────────────────────────── */
function BallCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const balls = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: canvas.height * (0.6 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 1.4,
      vy: -(Math.random() * 3 + 2),
      trail: [],
      r: Math.random() * 2.5 + 1.5,
      a: Math.random() * 0.4 + 0.25,
      birth: i * -80,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      balls.forEach(b => {
        b.birth++;
        if (b.birth < 0) return;

        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > 50) b.trail.shift();

        b.x += b.vx;
        b.vy += 0.018;
        b.y += b.vy;

        if (b.y > canvas.height + 60 || b.x < -60 || b.x > canvas.width + 60) {
          b.x = canvas.width * (0.2 + Math.random() * 0.6);
          b.y = canvas.height * 0.85;
          b.vx = (Math.random() - 0.5) * 1.8;
          b.vy = -(Math.random() * 3.5 + 2.5);
          b.trail = [];
        }

        // trail
        for (let i = 1; i < b.trail.length; i++) {
          const t = i / b.trail.length;
          ctx.beginPath();
          ctx.moveTo(b.trail[i - 1].x, b.trail[i - 1].y);
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
          ctx.strokeStyle = `rgba(191,155,111,${t * b.a * 0.45})`;
          ctx.lineWidth = t * b.r * 0.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // glow
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 4);
        g.addColorStop(0, `rgba(212,184,150,${b.a})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,184,150,${b.a * 0.9})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
  );
}

/* ── Stat item ─────────────────────────────────────────────────── */
function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', fontWeight: 600, color: 'var(--cream)', lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--mist)' }}>
        {label}
      </span>
    </div>
  );
}

/* ── Feature row ───────────────────────────────────────────────── */
function Feature({ num, title, body }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr',
        gap: '1.5rem',
        padding: '1.75rem 0',
        borderBottom: '1px solid var(--ink-3)',
        alignItems: 'start',
      }}
    >
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '3rem',
        fontWeight: 300,
        fontStyle: 'italic',
        color: 'var(--ink-5)',
        lineHeight: 1,
        paddingTop: '0.1rem',
      }}>
        {num}
      </span>
      <div>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--cream)',
          marginBottom: '0.4rem',
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.875rem',
          color: 'var(--ash)',
          lineHeight: 1.75,
        }}>
          {body}
        </p>
      </div>
    </motion.div>
  );
}

/* ── HomePage ──────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div>
      {/* ── HERO ── */}
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'flex-end',
        paddingBottom: '5rem',
        overflow: 'hidden',
      }}>
        <BallCanvas />

        {/* Horizontal rule lines decoration */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 60%, var(--ink) 100%)',
        }} />

        {/* Subtle vertical line */}
        <div style={{
          position: 'absolute', top: 0, left: '50%',
          width: 1, height: '100%',
          background: 'linear-gradient(180deg, transparent, rgba(42,87,64,0.12), transparent)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="t-label"
            style={{ marginBottom: '1.5rem' }}
          >
            AI Ball-Flight Tracing · US Open Precision
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="t-hero"
            style={{ color: 'var(--cream)', marginBottom: '2rem', maxWidth: '14ch' }}
          >
            See every shot like a broadcast
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--ash)',
              lineHeight: 1.75,
              maxWidth: 480,
              marginBottom: '2.5rem',
            }}
          >
            Upload your golf swing video. Our YOLOv8 model traces the ball's exact path — frame by frame, entirely in your browser.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}
          >
            <Link to="/tracer" id="hero-cta" className="btn btn-primary" style={{ gap: '0.5rem' }}>
              Start Tracing Free
              <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
            <Link to="/pricing" className="btn btn-outline" style={{ padding: '0.75rem 1.5rem' }}>
              View Plans
            </Link>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{
              display: 'flex',
              gap: '3rem',
              flexWrap: 'wrap',
              marginTop: '4rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--ink-3)',
            }}
          >
            <Stat value="30fps" label="Frame Analysis" />
            <Stat value="3 Free" label="Trial Uses" />
            <Stat value="100%" label="Private & Local" />
            <Stat value="4K" label="Export Quality" />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '7rem 0', background: 'var(--ink)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6rem',
            alignItems: 'start',
          }}>
            {/* Left: heading */}
            <div style={{ position: 'sticky', top: '6rem' }}>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="t-label"
                style={{ marginBottom: '1rem' }}
              >
                How it works
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                className="t-display"
                style={{ color: 'var(--cream)', marginBottom: '1.5rem', lineHeight: 1.05 }}
              >
                Three steps to pro-level analysis
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', color: 'var(--mist)', lineHeight: 1.8, marginBottom: '2rem' }}
              >
                No plugin installs, no camera rigs, no exports to third-party servers. Everything runs right in your tab.
              </motion.p>
              <Link to="/tracer" className="btn btn-ghost">
                Open Tracer →
              </Link>
            </div>

            {/* Right: steps */}
            <div>
              <Feature num="01" title="Upload your swing video"
                body="Drag-and-drop or browse for any MP4, MOV, or WebM. Up to 100 MB per file, with no account required on your first three traces." />
              <Feature num="02" title="AI traces every frame"
                body="YOLOv8 runs via onnxruntime-web in WebAssembly — detecting the ball and plotting its exact position across each frame of your video." />
              <Feature num="03" title="Edit, style and export"
                body="Adjust the trace color, line weight, and style in real time. Then export a fully-rendered video to share with your coach or on social." />
            </div>
          </div>

          <style>{`@media (max-width: 768px) {
            section:nth-child(2) .container > div { grid-template-columns: 1fr !important; gap: 2rem !important; }
            section:nth-child(2) .container > div > div:first-child { position: static !important; }
          }`}</style>
        </div>
      </section>

      {/* ── FULL-BLEED QUOTE ── */}
      <section style={{
        padding: '6rem 0',
        background: 'var(--ink-2)',
        borderTop: '1px solid var(--ink-3)',
        borderBottom: '1px solid var(--ink-3)',
        textAlign: 'center',
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
          >
            <p className="t-label" style={{ marginBottom: '2rem' }}>The Difference</p>
            <blockquote style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
              fontWeight: 500,
              fontStyle: 'italic',
              color: 'var(--cream)',
              lineHeight: 1.25,
              maxWidth: '22ch',
              margin: '0 auto 2rem',
            }}>
              "Every great shot deserves to be seen."
            </blockquote>
            <div style={{ width: 40, height: 1, background: 'var(--bronze-dk)', margin: '0 auto 2rem' }} />
            <p style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--smoke)' }}>
              GolfTracer · US Open Edition
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '7rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '3rem',
            alignItems: 'center',
          }}>
            <div>
              <p className="t-label" style={{ marginBottom: '0.75rem' }}>Get Started</p>
              <h2 className="t-display" style={{ color: 'var(--cream)', marginBottom: '1rem' }}>
                Ready to see your swing differently?
              </h2>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', color: 'var(--ash)', lineHeight: 1.75 }}>
                Start with 3 free analyses. No credit card, no sign-up, no catch.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexShrink: 0 }}>
              <Link to="/tracer" className="btn btn-primary" id="bottom-cta" style={{ justifyContent: 'center' }}>
                Try it free
              </Link>
              <Link to="/pricing" className="btn btn-outline" style={{ justifyContent: 'center', padding: '0.65rem 1.5rem', fontSize: '0.82rem' }}>
                See pricing
              </Link>
            </div>
          </div>
        </div>
        <style>{`@media (max-width: 640px) {
          section:last-child .container > div { grid-template-columns: 1fr !important; }
        }`}</style>
      </section>
    </div>
  );
}