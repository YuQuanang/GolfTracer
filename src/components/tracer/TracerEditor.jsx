import React from 'react';

const HANDLES = [
  { key: 'start',   label: 'Start (Tee)',   icon: '⛳', color: '#00E676', desc: 'Ball launch origin' },
  { key: 'apex',    label: 'Apex (Peak)',   icon: '◆',  color: '#FFD600', desc: 'Highest altitude crest' },
  { key: 'landing', label: 'Landing Spot',  icon: '⬇',  color: '#FF5252', desc: 'Target ground impact' },
];

export default function TracerEditor({ curvePoints, editMode, setEditMode, activeHandle, onSelectHandle }) {
  return (
    <div className="studio-card" style={{ padding: '1.4rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: editMode ? 'var(--bronze)' : 'var(--fairway-lt)',
              boxShadow: editMode ? '0 0 8px var(--bronze)' : 'none'
            }} />
            <p className="t-label" style={{ margin: 0 }}>Kinematic Flight Path</p>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.25rem', fontWeight: 600, fontStyle: 'italic',
            color: 'var(--cream)', margin: 0,
          }}>
            Trajectory Anchors
          </h3>
        </div>
        <button
          id="edit-mode-toggle"
          onClick={() => {
            if (editMode) {
              onSelectHandle?.(null);
            }
            setEditMode(!editMode);
          }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '0.55rem 1.1rem',
            borderRadius: 'var(--r-sm)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            border: editMode
              ? '1px solid var(--bronze)'
              : '1px solid var(--ink-4)',
            background: editMode
              ? 'rgba(191,155,111,0.18)'
              : 'var(--ink-3)',
            color: editMode ? 'var(--cream)' : 'var(--ash)',
            boxShadow: editMode ? '0 0 14px rgba(191,155,111,0.2)' : 'none',
          }}
        >
          {editMode ? '✓ Finish Editing' : '✎ Adjust Flight Path'}
        </button>
      </div>

      {/* Interactive status banner */}
      {editMode ? (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(191,155,111,0.08)',
          borderLeft: '3px solid var(--bronze)',
          borderRadius: '4px var(--r-sm) var(--r-sm) 4px',
          marginBottom: '1.1rem',
        }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--cream-dim)', margin: 0, lineHeight: 1.5 }}>
            <strong>How to edit:</strong> Tap or click any anchor below to select it, then click or drag directly on the video canvas above to reposition the point.
          </p>
        </div>
      ) : (
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--mist)', marginBottom: '1.1rem' }}>
          Flight path locked. Click <strong>Adjust Flight Path</strong> above to move Start, Apex, or Landing coordinates.
        </p>
      )}

      {/* Control-point rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
        {HANDLES.map(({ key, label, icon, color, desc }) => {
          const pt = curvePoints?.[key];
          const isActive = editMode && activeHandle === key;
          return (
            <button
              key={key}
              onClick={() => {
                if (!editMode) setEditMode(true);
                onSelectHandle?.(key);
              }}
              style={{
                display: 'flex', flexDirection: 'column', gap: '0.45rem',
                padding: '0.85rem 0.95rem',
                background: isActive ? `${color}15` : 'var(--ink-3)',
                border: `1px solid ${isActive ? color : (editMode ? `${color}40` : 'var(--ink-4)')}`,
                borderRadius: 'var(--r-sm)',
                transition: 'all 200ms ease',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                boxShadow: isActive ? `0 0 16px ${color}25` : 'none',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  padding: '0.15rem 0.5rem',
                  background: color, color: '#000',
                  fontFamily: 'var(--font-mono)', fontSize: '0.58rem', fontWeight: 700,
                  borderBottomLeftRadius: 'var(--r-sm)',
                  letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>
                  Focused
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700,
                  letterSpacing: '0.06em', color: isActive ? color : 'var(--cream)',
                  transition: 'color 200ms ease'
                }}>
                  {label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.68rem', color: 'var(--mist)' }}>
                  {desc}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 600,
                  color: isActive ? color : 'var(--silver)',
                  background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: 4
                }}>
                  {pt ? `${Math.round(pt.x)}, ${Math.round(pt.y)}` : '—'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}