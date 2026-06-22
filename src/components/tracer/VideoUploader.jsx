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
    if (file.size > 100 * 1024 * 1024) { setError('File must be under 100 MB.'); return; }
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
    <div>
      <div
        id="upload-drop-zone"
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        style={{
          padding: '3.5rem 2rem',
          border: `1px dashed ${drag ? 'var(--bronze)' : 'var(--ink-5)'}`,
          borderRadius: 'var(--r-lg)',
          background: drag ? 'rgba(191,155,111,0.04)' : 'var(--ink-2)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 250ms ease',
          position: 'relative',
        }}
      >
        {/* Corner brackets */}
        {[
          { top: 14, left: 14, borderTop: '1px solid', borderLeft: '1px solid' },
          { top: 14, right: 14, borderTop: '1px solid', borderRight: '1px solid' },
          { bottom: 14, left: 14, borderBottom: '1px solid', borderLeft: '1px solid' },
          { bottom: 14, right: 14, borderBottom: '1px solid', borderRight: '1px solid' },
        ].map((s, i) => (
          <div key={i} style={{ position: 'absolute', width: 16, height: 16, borderColor: drag ? 'var(--bronze)' : 'var(--ink-5)', transition: 'border-color 250ms', ...s }} />
        ))}

        <input ref={inputRef} type="file" accept="video/*" onChange={e => validate(e.target.files[0])} style={{ display: 'none' }} id="file-input" />

        {/* Icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: 'var(--r-md)',
          background: drag ? 'rgba(191,155,111,0.15)' : 'var(--ink-3)',
          border: `1px solid ${drag ? 'rgba(191,155,111,0.4)' : 'var(--ink-4)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          fontSize: '1.5rem',
          transition: 'all 250ms ease',
        }}>
          🎬
        </div>

        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.5rem', fontWeight: 600, fontStyle: 'italic',
          color: 'var(--cream)', marginBottom: '0.5rem',
        }}>
          {drag ? 'Drop it here' : 'Upload your golf video'}
        </h3>
        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'var(--mist)', marginBottom: '1.75rem', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 1.75rem' }}>
          Drag & drop, or click to browse. Best results with stable camera, good lighting, and clear ball flight.
        </p>

        <button className="btn btn-outline" style={{ pointerEvents: 'none', fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}>
          Browse file
        </button>

        {/* Format list */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {['MP4', 'WebM', 'MOV', 'AVI'].map(f => (
            <span key={f} className="tag tag-muted">{f}</span>
          ))}
          <span className="tag tag-muted">Max 100 MB</span>
        </div>
      </div>

      {error && (
        <div style={{
          marginTop: '1rem', padding: '0.75rem 1rem',
          background: 'rgba(160,55,42,0.1)',
          border: '1px solid rgba(160,55,42,0.3)',
          borderRadius: 'var(--r-sm)',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '0.83rem', color: '#C9897C',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}