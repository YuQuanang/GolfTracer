import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrial } from '../../context/TrialContext';

const navLinks = [
  { label: 'Home',   path: '/' },
  { label: 'Tracer', path: '/tracer' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'About',  path: '/about' },
];

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { usesLeft, isPro, maxFree } = useTrial();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const isActive = (p) => location.pathname === p;

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          background: scrolled ? 'rgba(10,10,10,0.96)' : 'transparent',
          borderBottom: scrolled ? '1px solid #1A1A1A' : '1px solid transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'background 320ms ease, border-color 320ms ease',
        }}
      >
        <div
          className="container"
          style={{ display: 'flex', alignItems: 'center', height: 68, gap: '2rem' }}
        >
          {/* Logo */}
          <Link
            to="/"
            id="header-logo"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '0.35rem', flexShrink: 0 }}
          >
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.45rem',
              fontWeight: 700,
              fontStyle: 'italic',
              color: 'var(--cream)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}>
              Golf
            </span>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--bronze)',
              letterSpacing: '0.04em',
              lineHeight: 1,
            }}>
              TRACER
            </span>
          </Link>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Desktop nav */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                id={`nav-${link.label.toLowerCase()}`}
                style={{
                  textDecoration: 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: 'var(--r-sm)',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '0.84rem',
                  fontWeight: isActive(link.path) ? 600 : 400,
                  color: isActive(link.path) ? 'var(--cream)' : 'var(--ash)',
                  background: isActive(link.path) ? 'var(--ink-3)' : 'transparent',
                  transition: 'all 200ms ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={e => {
                  if (!isActive(link.path)) e.currentTarget.style.color = 'var(--cream)';
                }}
                onMouseLeave={e => {
                  if (!isActive(link.path)) e.currentTarget.style.color = 'var(--ash)';
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Trial badge */}
            {!isPro && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.3rem 0.7rem',
                borderRadius: 'var(--r-full)',
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: usesLeft > 0 ? 'var(--bronze-lt)' : '#A0372A',
                background: usesLeft > 0 ? 'rgba(191,155,111,0.1)' : 'rgba(160,55,42,0.12)',
                border: `1px solid ${usesLeft > 0 ? 'rgba(191,155,111,0.25)' : 'rgba(160,55,42,0.3)'}`,
              }}>
                {usesLeft > 0 ? `${usesLeft} free ${usesLeft === 1 ? 'use' : 'uses'} left` : 'Trial ended'}
              </span>
            )}

            {isPro && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.3rem 0.7rem',
                borderRadius: 'var(--r-full)',
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.06em',
                color: 'var(--fairway-lt)',
                background: 'rgba(42,87,64,0.15)',
                border: '1px solid rgba(61,122,91,0.3)',
              }}>
                ✦ Pro
              </span>
            )}

            {!isPro && (
              <Link
                to="/pricing"
                id="nav-cta"
                className="btn btn-bronze"
                style={{ marginLeft: '0.75rem', padding: '0.55rem 1.25rem', fontSize: '0.84rem' }}
              >
                Upgrade
              </Link>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              display: 'none',
              background: 'var(--ink-3)',
              border: '1px solid var(--ink-5)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--cream)',
              cursor: 'pointer',
              padding: '0.5rem',
              lineHeight: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: 68,
              left: 0,
              right: 0,
              zIndex: 199,
              background: 'rgba(10,10,10,0.98)',
              borderBottom: '1px solid var(--ink-4)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem 2rem',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    textDecoration: 'none',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--r-sm)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '1rem',
                    fontWeight: isActive(link.path) ? 600 : 400,
                    color: isActive(link.path) ? 'var(--cream)' : 'var(--ash)',
                    background: isActive(link.path) ? 'var(--ink-3)' : 'transparent',
                    borderBottom: '1px solid var(--ink-3)',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              {!isPro && (
                <Link
                  to="/pricing"
                  className="btn btn-bronze"
                  style={{ marginTop: '1rem', justifyContent: 'center' }}
                >
                  Upgrade to Pro
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}