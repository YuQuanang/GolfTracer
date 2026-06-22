import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrial } from '../context/TrialContext';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const panel = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, scale: 0.96, y: 10 },
};

export default function PaywallModal() {
  const { showPaywall, setShowPaywall, usesLeft, maxFree } = useTrial();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    setShowPaywall(false);
    navigate('/pricing');
  };

  return (
    <AnimatePresence>
      {showPaywall && (
        <motion.div
          key="paywall-backdrop"
          variants={backdrop}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={() => setShowPaywall(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            key="paywall-panel"
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--ink-2)',
              border: '1px solid var(--ink-4)',
              borderRadius: 'var(--r-lg)',
              padding: '2.5rem',
              maxWidth: 460,
              width: '100%',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Decorative corner accent */}
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: 120, height: 120,
              background: 'radial-gradient(circle at top right, rgba(191,155,111,0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Icon */}
            <div style={{
              width: 64, height: 64,
              borderRadius: '50%',
              background: 'var(--ink-3)',
              border: '1px solid rgba(191,155,111,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '1.75rem',
            }}>
              ⛳
            </div>

            {/* Eyebrow */}
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Free Trial Ended</p>

            {/* Headline */}
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '2rem',
              fontWeight: 600,
              fontStyle: 'italic',
              color: 'var(--cream)',
              lineHeight: 1.1,
              marginBottom: '1rem',
            }}>
              You've used all {maxFree} free traces
            </h2>

            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.9rem',
              color: 'var(--ash)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}>
              Unlock unlimited ball-flight tracing, priority processing, and 4K video export with a GolfTracer Pro subscription.
            </p>

            {/* Perks */}
            <div style={{
              textAlign: 'left',
              background: 'var(--ink-3)',
              border: '1px solid var(--ink-4)',
              borderRadius: 'var(--r-md)',
              padding: '1.25rem',
              marginBottom: '1.75rem',
            }}>
              {[
                'Unlimited video analyses',
                'Priority AI processing queue',
                '4K video export',
                'Batch upload support',
              ].map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
                  <span style={{ color: 'var(--bronze)', fontSize: '0.8rem' }}>✦</span>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'var(--silver)' }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                id="paywall-upgrade-btn"
                className="btn btn-bronze"
                onClick={handleUpgrade}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.95rem', padding: '0.85rem' }}
              >
                View Plans — from $9 / mo
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.8rem', color: 'var(--smoke)',
                  padding: '0.5rem',
                }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
