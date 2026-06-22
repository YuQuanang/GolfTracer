import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTrial } from '../context/TrialContext';
import toast from 'react-hot-toast';

/* ── Plan card ─────────────────────────────────────────────────── */
function PlanCard({ tier, price, period, description, features, cta, ctaHref, isPopular, onCtaClick, disabled }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        background: isPopular ? 'var(--ink-2)' : 'var(--ink)',
        border: isPopular ? '1px solid rgba(191,155,111,0.45)' : '1px solid var(--ink-4)',
        borderRadius: 'var(--r-lg)',
        position: 'relative',
        flex: 1,
        minWidth: 0,
      }}
    >
      {isPopular && (
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          padding: '0.2rem 0.9rem',
          background: 'var(--bronze)',
          borderRadius: 'var(--r-full)',
          fontFamily: "'Space Grotesk', monospace",
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--ink)',
          whiteSpace: 'nowrap',
        }}>
          Most Popular
        </div>
      )}

      {/* Tier */}
      <p style={{
        fontFamily: "'Space Grotesk', monospace",
        fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: isPopular ? 'var(--bronze)' : 'var(--mist)',
        marginBottom: '0.75rem',
      }}>
        {tier}
      </p>

      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem', marginBottom: '0.5rem' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '3.2rem', fontWeight: 700,
          color: 'var(--cream)', lineHeight: 1,
        }}>
          {price}
        </span>
        {period && (
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'var(--mist)' }}>
            {period}
          </span>
        )}
      </div>

      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'var(--ash)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
        {description}
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid var(--ink-4)', marginBottom: '1.5rem' }} />

      {/* Features */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2rem', flex: 1 }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
            <span style={{ color: isPopular ? 'var(--bronze)' : 'var(--smoke)', fontSize: '0.85rem', lineHeight: 1.5, flexShrink: 0 }}>✦</span>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'var(--silver)', lineHeight: 1.55 }}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {onCtaClick ? (
        <button
          onClick={onCtaClick}
          disabled={disabled}
          className={`btn ${isPopular ? 'btn-bronze' : 'btn-outline'}`}
          style={{ justifyContent: 'center', width: '100%', opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          {cta}
        </button>
      ) : (
        <Link
          to={ctaHref}
          className={`btn ${isPopular ? 'btn-bronze' : 'btn-outline'}`}
          style={{ justifyContent: 'center', width: '100%', textAlign: 'center' }}
        >
          {cta}
        </Link>
      )}
    </motion.div>
  );
}

/* ── PricingPage ────────────────────────────────────────────────── */
export default function PricingPage() {
  const { isPro, upgradeToPro, usesLeft, maxFree } = useTrial();

  const handleUpgrade = (tier) => {
    // In a real app: redirect to Stripe / payment flow
    upgradeToPro();
    toast.success(`Welcome to GolfTracer ${tier}! Unlimited tracing unlocked.`, { duration: 4000 });
  };

  return (
    <div>
      {/* Header */}
      <section style={{
        padding: '6rem 0 4rem',
        borderBottom: '1px solid var(--ink-3)',
        textAlign: 'center',
      }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="t-label"
            style={{ marginBottom: '1rem' }}
          >
            Pricing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="t-display"
            style={{ fontStyle: 'italic', color: 'var(--cream)', marginBottom: '1.25rem' }}
          >
            Simple, honest pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', color: 'var(--ash)', lineHeight: 1.75 }}
          >
            Start free with {maxFree} full analyses. Upgrade when you're ready. Cancel any time.
          </motion.p>

          {/* Trial status bar */}
          {!isPro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '2rem',
                padding: '1rem 1.5rem',
                background: 'var(--ink-2)',
                border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', fontWeight: 600, color: 'var(--cream)' }}>
                  Your trial status
                </span>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8rem', color: 'var(--ash)' }}>
                  {usesLeft > 0 ? `${usesLeft} of ${maxFree} free analyses remaining` : 'All free analyses used — upgrade to continue'}
                </span>
              </div>
              {/* Progress dots */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {Array.from({ length: maxFree }).map((_, i) => (
                  <div key={i} style={{
                    width: 10, height: 10,
                    borderRadius: '50%',
                    background: i < (maxFree - usesLeft) ? 'var(--ink-5)' : 'var(--bronze)',
                    border: `1px solid ${i < (maxFree - usesLeft) ? 'var(--ink-5)' : 'rgba(191,155,111,0.5)'}`,
                    boxShadow: i >= (maxFree - usesLeft) ? '0 0 6px rgba(191,155,111,0.4)' : 'none',
                  }} />
                ))}
              </div>
            </motion.div>
          )}

          {isPro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                marginTop: '2rem',
                padding: '1rem 1.5rem',
                background: 'rgba(42,87,64,0.12)',
                border: '1px solid rgba(61,122,91,0.3)',
                borderRadius: 'var(--r-md)',
              }}
            >
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', color: 'var(--fairway-lt)' }}>
                ✦ You're on Pro — unlimited tracing is active.
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'stretch',
          }}>
            {/* Free */}
            <PlanCard
              tier="Free"
              price="$0"
              description={`${maxFree} full analyses, no account required. Perfect for trying GolfTracer before committing.`}
              features={[
                `${maxFree} video analyses`,
                'YOLOv8 ball detection',
                'Trace editor (color, width, style)',
                'Video export (720p)',
                'In-browser processing',
              ]}
              cta={usesLeft > 0 ? `${usesLeft} uses remaining` : 'Trial ended'}
              ctaHref="/tracer"
              disabled={usesLeft === 0}
            />

            {/* Pro */}
            <PlanCard
              tier="Pro"
              price="$9"
              period="/ month"
              description="For the serious golfer. Unlimited traces, priority processing, and full HD export."
              features={[
                'Unlimited video analyses',
                'Priority AI processing',
                'Video export up to 1080p',
                'Batch upload (up to 5 videos)',
                'Advanced trace customization',
                'Email support',
              ]}
              cta={isPro ? '✦ Current Plan' : 'Upgrade to Pro'}
              isPopular
              onCtaClick={isPro ? null : () => handleUpgrade('Pro')}
              disabled={isPro}
            />

            {/* Championship */}
            <PlanCard
              tier="Championship"
              price="$24"
              period="/ month"
              description="Built for coaches and academies. Multi-user access, 4K export, and API access."
              features={[
                'Everything in Pro',
                '4K video export',
                'Up to 5 team seats',
                'REST API access',
                'Custom trace branding',
                'Priority phone support',
                'Early access to new features',
              ]}
              cta={isPro ? 'Contact Sales' : 'Upgrade to Championship'}
              onCtaClick={isPro ? null : () => handleUpgrade('Championship')}
              disabled={isPro}
            />
          </div>

          <style>{`@media (max-width: 900px) {
            section:nth-child(2) .container > div { flex-direction: column !important; }
          }`}</style>
        </div>
      </section>

      {/* FAQ strip */}
      <section style={{
        padding: '4rem 0 6rem',
        borderTop: '1px solid var(--ink-3)',
      }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="t-label"
            style={{ marginBottom: '2rem', textAlign: 'center' }}
          >
            Common Questions
          </motion.p>

          {[
            { q: 'Do I need to create an account?', a: 'No. Your 3 free trials are tracked locally in your browser. No sign-up required.' },
            { q: 'Are my videos uploaded to a server?', a: 'Never. All AI processing runs locally in your browser via WebAssembly. Your footage stays on your device.' },
            { q: 'Can I cancel my subscription anytime?', a: 'Yes. Cancel with one click from your account settings. No questions, no long-term commitments.' },
            { q: 'What video formats are supported?', a: 'MP4, MOV (QuickTime), WebM, and AVI — up to 100 MB per file.' },
          ].map(({ q, a }) => (
            <motion.div
              key={q}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5 }}
              style={{
                padding: '1.5rem 0',
                borderBottom: '1px solid var(--ink-3)',
              }}
            >
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', fontWeight: 600, color: 'var(--cream)', marginBottom: '0.5rem' }}>{q}</p>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: 'var(--ash)', lineHeight: 1.75 }}>{a}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
