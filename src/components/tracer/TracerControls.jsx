import React from 'react';
import { HexColorPicker } from 'react-colorful';

function Label({ children }) {
  return (
    <p style={{
      fontFamily: "'Space Grotesk', monospace",
      fontSize: '0.65rem', fontWeight: 600,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--smoke)', marginBottom: '0.65rem',
    }}>
      {children}
    </p>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--ink-3)', margin: '1.5rem 0' }} />;
}

export default function TracerControls({ tracerSettings, onSettingChange }) {
  const styles = ['solid', 'dashed', 'dotted'];

  return (
    <div style={{
      padding: '1.5rem',
      background: 'var(--ink-2)',
      border: '1px solid var(--ink-4)',
      borderRadius: 'var(--r-md)',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>
      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic',
        color: 'var(--cream)', marginBottom: '1.5rem',
      }}>
        Trace Style
      </h3>

      {/* Color */}
      <Label>Color</Label>
      <div style={{
        '& .react-colorful': { width: '100%' },
        marginBottom: '0.75rem',
      }}>
        <style>{`
          .react-colorful { width: 100% !important; height: 140px; border-radius: 8px; overflow: hidden; }
          .react-colorful__saturation { border-radius: 8px 8px 0 0; }
          .react-colorful__hue { height: 10px; border-radius: 0 0 8px 8px; }
          .react-colorful__pointer { width: 16px; height: 16px; border: 2px solid #fff; }
        `}</style>
        <HexColorPicker color={tracerSettings.color} onChange={v => onSettingChange('color', v)} />
      </div>
      {/* Hex swatch */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        padding: '0.65rem 0.75rem',
        background: 'var(--ink-3)', borderRadius: 'var(--r-sm)',
        border: '1px solid var(--ink-4)',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: 4,
          background: tracerSettings.color,
          boxShadow: `0 0 8px ${tracerSettings.color}70`,
          flexShrink: 0,
          border: '1px solid rgba(255,255,255,0.1)',
        }} />
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.82rem', color: 'var(--silver)', fontWeight: 600 }}>
          {tracerSettings.color.toUpperCase()}
        </span>
      </div>

      <Divider />

      {/* Width */}
      <Label>Line Width — {tracerSettings.width}px</Label>
      <input
        id="width-slider"
        type="range" min={1} max={10} step={1}
        value={tracerSettings.width}
        onChange={e => onSettingChange('width', Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--bronze)', marginBottom: 0 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', marginBottom: 0 }}>
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.6rem', color: 'var(--smoke)' }}>1</span>
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.6rem', color: 'var(--smoke)' }}>10</span>
      </div>

      <Divider />

      {/* Opacity */}
      <Label>Opacity — {Math.round(tracerSettings.opacity * 100)}%</Label>
      <input
        id="opacity-slider"
        type="range" min={0.1} max={1} step={0.05}
        value={tracerSettings.opacity}
        onChange={e => onSettingChange('opacity', Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--bronze)' }}
      />

      <Divider />

      {/* Style */}
      <Label>Line Style</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {styles.map(s => (
          <button
            key={s}
            id={`style-${s}`}
            onClick={() => onSettingChange('style', s)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--r-sm)',
              background: tracerSettings.style === s ? 'rgba(191,155,111,0.1)' : 'var(--ink-3)',
              border: `1px solid ${tracerSettings.style === s ? 'rgba(191,155,111,0.4)' : 'var(--ink-4)'}`,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: "'Space Grotesk', monospace",
              fontSize: '0.75rem', fontWeight: tracerSettings.style === s ? 600 : 400,
              color: tracerSettings.style === s ? 'var(--bronze)' : 'var(--ash)',
              transition: 'all 200ms ease',
              textTransform: 'capitalize',
            }}
          >
            {s === 'solid' ? '— ' : s === 'dashed' ? '- - ' : '· · '}{s}
          </button>
        ))}
      </div>

      <Divider />

      {/* Live preview */}
      <Label>Preview</Label>
      <div style={{
        padding: '0.85rem 1rem',
        background: 'var(--ink-3)',
        borderRadius: 'var(--r-sm)',
        border: '1px solid var(--ink-4)',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{
          height: Math.max(2, tracerSettings.width * 1.5),
          flex: 1,
          borderRadius: tracerSettings.width,
          opacity: tracerSettings.opacity,
          background: tracerSettings.style === 'solid'
            ? tracerSettings.color
            : undefined,
          backgroundImage: tracerSettings.style === 'dashed'
            ? `repeating-linear-gradient(90deg, ${tracerSettings.color} 0, ${tracerSettings.color} 10px, transparent 10px, transparent 18px)`
            : tracerSettings.style === 'dotted'
            ? `repeating-linear-gradient(90deg, ${tracerSettings.color} 0, ${tracerSettings.color} 4px, transparent 4px, transparent 10px)`
            : undefined,
          boxShadow: tracerSettings.style === 'solid'
            ? `0 0 ${tracerSettings.width * 4}px ${tracerSettings.color}60`
            : 'none',
          transition: 'all 250ms ease',
        }} />
      </div>
    </div>
  );
}