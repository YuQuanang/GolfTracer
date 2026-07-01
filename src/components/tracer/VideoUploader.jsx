import React, { useState, useRef } from 'react';

export default function VideoUploader({ onFileUpload }) {
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validate = (file) => {
    setError('');
    if (!file) { setError('No file selected.'); return; }
    const ok = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'].includes(file.type);
    if (!ok) { setError('Supported formats: MP4, WebM, MOV, AVI.'); return; }
    if (file.size > 2 * 1024 * 1024 * 1024) { setError('File must be under 2 GB.'); return; }
    onFileUpload(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDrag(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDrag(false);
    if (e.dataTransfer.files?.[0]) validate(e.dataTransfer.files[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: 840, margin: '0 auto' }}>
      {/* Studio Drop Zone */}
      <div
        id="upload-drop-zone"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className="studio-card"
        style={{
          padding: '4rem 2rem',
          border: `2px dashed ${drag ? 'var(--bronze)' : 'var(--ink-4)'}`,
          background: drag ? 'rgba(191,155,111,0.06)' : 'var(--ink-2)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 250ms ease',
          position: 'relative',
          boxShadow: drag ? '0 0 30px rgba(191,155,111,0.2)' : 'var(--shadow-lg)',
        }}
      >
        <input ref={inputRef} type="file" accept="video/*" onChange={e => validate(e.target.files[0])} style={{ display: 'none' }} id="file-input" />

        <div style={{
          width: 72, height: 72,
          borderRadius: '20px',
          background: drag ? 'rgba(191,155,111,0.2)' : 'var(--ink-3)',
          border: `1px solid ${drag ? 'var(--bronze)' : 'var(--ink-4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '2rem',
          transition: 'all 250ms ease',
          boxShadow: drag ? '0 0 20px rgba(191,155,111,0.4)' : 'none'
        }}>
          🎬
        </div>

        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 600, fontStyle: 'italic',
          color: 'var(--cream)', marginBottom: '0.6rem',
        }}>
          {drag ? 'Release to upload video' : 'Upload your golf swing video'}
        </h3>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem',
          color: 'var(--mist)', marginBottom: '2rem', lineHeight: 1.6,
          maxWidth: 440, margin: '0 auto 2rem'
        }}>
          Tap to choose from your camera roll or drop files directly. Powered by AI kinematic flight tracking.
        </p>

        <button className="btn btn-primary" style={{ pointerEvents: 'none', fontSize: '0.92rem', padding: '0.75rem 2rem', boxShadow: 'var(--shadow-bronze)' }}>
          Browse Camera & Files
        </button>

        {/* Format tag pills */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
          {['MP4', 'MOV (iOS/iPhone)', 'WebM', 'AVI'].map(f => (
            <span key={f} style={{
              fontFamily: "'Space Grotesk', monospace", fontSize: '0.7rem',
              background: 'var(--ink-3)', color: 'var(--silver)',
              padding: '0.3rem 0.75rem', borderRadius: 'var(--r-full)',
              border: '1px solid var(--ink-4)'
            }}>{f}</span>
          ))}
          <span style={{
            fontFamily: "'Space Grotesk', monospace", fontSize: '0.7rem',
            background: 'rgba(191,155,111,0.1)', color: 'var(--bronze)',
            padding: '0.3rem 0.75rem', borderRadius: 'var(--r-full)',
            border: '1px solid rgba(191,155,111,0.3)'
          }}>Max 2 GB</span>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(160,55,42,0.12)',
          border: '1px solid rgba(160,55,42,0.4)',
          borderRadius: 'var(--r-sm)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.88rem', color: '#E08E7E',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      {/* Recording Tips Card Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '📱', title: 'Down-The-Line Angle', desc: 'Position camera directly behind your hands looking down the target line.' },
          { icon: '🎯', title: 'Stable & Steady', desc: 'Rest your phone against a golf bag or tripod to prevent shake.' },
          { icon: '☀️', title: 'Clear Lighting', desc: 'Daylight or well-lit driving ranges produce the cleanest tracer flight.' }
        ].map((tip, i) => (
          <div key={i} className="studio-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{tip.icon}</div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--cream)', fontStyle: 'italic', marginBottom: '0.35rem' }}>
              {tip.title}
            </h4>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.78rem', color: 'var(--mist)', lineHeight: 1.5, margin: 0 }}>
              {tip.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}