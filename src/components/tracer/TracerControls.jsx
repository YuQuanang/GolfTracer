import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

function Label({ children }) {
  return (
    <p style={{
      fontFamily: "'Space Grotesk', monospace",
      fontSize: '0.65rem', fontWeight: 700,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--silver)', marginBottom: '0.55rem',
    }}>
      {children}
    </p>
  );
}

const QUICK_COLORS = [
  { label: 'Gold', hex: '#FFD700' },
  { label: 'Bronze', hex: '#BF9B6F' },
  { label: 'Laser Red', hex: '#FF3B30' },
  { label: 'Pro Green', hex: '#00E676' },
  { label: 'Electric Blue', hex: '#00B0FF' },
  { label: 'Pure White', hex: '#FFFFFF' },
];

export default function TracerControls({ tracerSettings, onSettingChange, videoRef, onActivateEdit }) {
  const [activeTab, setActiveTab] = useState('timing'); // 'timing' or 'style'
  const styles = ['solid', 'dashed', 'dotted'];

  return (
    <div className="studio-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
      {/* Console Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p className="t-label" style={{ marginBottom: '0.2rem' }}>Configuration</p>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '1.35rem', fontWeight: 600, fontStyle: 'italic',
          color: 'var(--cream)', margin: 0,
        }}>
          Studio Console
        </h3>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem',
        padding: '0.3rem', background: 'var(--ink-3)', borderRadius: 'var(--r-sm)',
        border: '1px solid var(--ink-4)', marginBottom: '1.4rem'
      }}>
        <button
          onClick={() => setActiveTab('timing')}
          style={{
            padding: '0.55rem 0.5rem',
            borderRadius: '4px',
            fontFamily: "'Space Grotesk', monospace",
            fontSize: '0.72rem', fontWeight: activeTab === 'timing' ? 700 : 500,
            color: activeTab === 'timing' ? 'var(--bronze)' : 'var(--ash)',
            background: activeTab === 'timing' ? 'var(--ink)' : 'transparent',
            border: activeTab === 'timing' ? '1px solid rgba(191,155,111,0.3)' : '1px solid transparent',
            cursor: 'pointer', transition: 'all 200ms ease',
            boxShadow: activeTab === 'timing' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none'
          }}
        >
          ⏱️ Timing & Flight
        </button>
        <button
          onClick={() => setActiveTab('style')}
          style={{
            padding: '0.55rem 0.5rem',
            borderRadius: '4px',
            fontFamily: "'Space Grotesk', monospace",
            fontSize: '0.72rem', fontWeight: activeTab === 'style' ? 700 : 500,
            color: activeTab === 'style' ? 'var(--bronze)' : 'var(--ash)',
            background: activeTab === 'style' ? 'var(--ink)' : 'transparent',
            border: activeTab === 'style' ? '1px solid rgba(191,155,111,0.3)' : '1px solid transparent',
            cursor: 'pointer', transition: 'all 200ms ease',
            boxShadow: activeTab === 'style' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none'
          }}
        >
          🎨 Appearance
        </button>
      </div>

      {/* TAB 1: Timing & Flight */}
      {activeTab === 'timing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Start Time (Impact) */}
          <div style={{
            padding: '0.9rem',
            background: tracerSettings.isStartTimeConfirmed ? 'var(--ink-3)' : 'rgba(191,155,111,0.1)',
            border: tracerSettings.isStartTimeConfirmed ? '1px solid var(--ink-4)' : '1px solid var(--bronze)',
            borderRadius: 'var(--r-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <Label>Impact Start Time</Label>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--cream)' }}>
                {(tracerSettings.startTime ?? 0).toFixed(2)}s
              </span>
            </div>
            
            <button
              onClick={() => {
                const v = videoRef?.current?.getVideoElement?.();
                if (v) {
                  onSettingChange('startTime', Number(v.currentTime.toFixed(2)));
                  onSettingChange('isStartTimeConfirmed', true);
                }
                onActivateEdit?.();
              }}
              style={{
                width: '100%', padding: '0.65rem', marginBottom: '0.75rem',
                background: tracerSettings.isStartTimeConfirmed ? 'var(--ink)' : 'var(--bronze)',
                border: '1px solid rgba(191,155,111,0.5)',
                borderRadius: 'var(--r-sm)',
                color: tracerSettings.isStartTimeConfirmed ? 'var(--bronze)' : '#000',
                fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem',
                cursor: 'pointer', fontWeight: 700, transition: 'all 200ms ease',
                boxShadow: tracerSettings.isStartTimeConfirmed ? 'none' : '0 0 15px rgba(191,155,111,0.4)'
              }}
            >
              📍 Set to Current Frame ({videoRef?.current?.getCurrentTime?.()?.toFixed(2) || '0.00'}s)
            </button>

            <input
              id="starttime-slider"
              type="range" min={0} max={videoRef?.current?.getDuration?.() || 15} step={0.05}
              value={tracerSettings.startTime ?? 0}
              onChange={e => onSettingChange('startTime', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--bronze)', marginBottom: '0.3rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.62rem', color: 'var(--mist)' }}>0.00s</span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.62rem', color: 'var(--mist)' }}>
                {(videoRef?.current?.getDuration?.() || 15).toFixed(2)}s
              </span>
            </div>
          </div>

          {/* Physics Club Preset */}
          <div>
            <Label>Club Physics Preset</Label>
            <select
              value={tracerSettings.club || 'DRIVER'}
              onChange={e => onSettingChange('club', e.target.value)}
              style={{
                width: '100%', padding: '0.7rem 0.9rem',
                background: 'var(--ink-3)', border: '1px solid var(--ink-4)',
                borderRadius: 'var(--r-sm)', color: 'var(--cream)',
                fontFamily: "'Space Grotesk', monospace", fontSize: '0.8rem',
                cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="DRIVER">Driver — 150 mph (Explosive Launch)</option>
              <option value="SEVEN_IRON">7-Iron — 115 mph (Balanced Arc)</option>
              <option value="PITCHING_WEDGE">Pitching Wedge — 90 mph (High Hang Time)</option>
            </select>
          </div>

          {/* Physics Shot Shape */}
          <div>
            <Label>Aerodynamic Flight Shape</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.45rem' }}>
              {['STRAIGHT', 'DRAW', 'FADE'].map(shape => (
                <button
                  key={shape}
                  onClick={() => onSettingChange('shotShape', shape)}
                  style={{
                    padding: '0.55rem 0.2rem',
                    borderRadius: 'var(--r-sm)',
                    fontFamily: "'Space Grotesk', monospace",
                    fontSize: '0.72rem', fontWeight: 600,
                    cursor: 'pointer',
                    border: (tracerSettings.shotShape || 'STRAIGHT') === shape
                      ? '1px solid var(--bronze)' : '1px solid var(--ink-4)',
                    background: (tracerSettings.shotShape || 'STRAIGHT') === shape
                      ? 'rgba(191,155,111,0.18)' : 'var(--ink-3)',
                    color: (tracerSettings.shotShape || 'STRAIGHT') === shape
                      ? 'var(--cream)' : 'var(--ash)',
                    transition: 'all 200ms ease'
                  }}
                >
                  {shape === 'STRAIGHT' ? 'Straight' : shape === 'DRAW' ? 'Draw (-5°)' : 'Fade (+5°)'}
                </button>
              ))}
            </div>
          </div>

          {/* Trace Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <Label>Trace Animation Speed</Label>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--cream)' }}>
                {(tracerSettings.speed ?? 1).toFixed(2)}×
              </span>
            </div>
            <input
              id="speed-slider"
              type="range" min={0.25} max={4} step={0.25}
              value={tracerSettings.speed ?? 1}
              onChange={e => onSettingChange('speed', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--bronze)', marginBottom: '0.3rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.62rem', color: 'var(--mist)' }}>0.25× Slow</span>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.62rem', color: 'var(--mist)' }}>4.0× Rapid</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Appearance */}
      {activeTab === 'style' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Live preview */}
          <div>
            <Label>Live Line Preview</Label>
            <div style={{
              padding: '0.85rem 1rem',
              background: 'var(--ink-3)',
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--ink-4)',
              display: 'flex', alignItems: 'center',
            }}>
              <div style={{
                height: Math.max(2, tracerSettings.width * 1.3),
                flex: 1,
                borderRadius: tracerSettings.width,
                opacity: tracerSettings.opacity,
                backgroundColor: tracerSettings.style === 'solid' ? tracerSettings.color : 'transparent',
                backgroundImage: tracerSettings.style === 'dashed'
                  ? `repeating-linear-gradient(90deg, ${tracerSettings.color} 0, ${tracerSettings.color} 10px, transparent 10px, transparent 18px)`
                  : tracerSettings.style === 'dotted'
                  ? `repeating-linear-gradient(90deg, ${tracerSettings.color} 0, ${tracerSettings.color} 4px, transparent 4px, transparent 10px)`
                  : 'none',
                boxShadow: tracerSettings.style === 'solid'
                  ? `0 0 ${tracerSettings.width * 3}px ${tracerSettings.color}70`
                  : 'none',
                transition: 'all 250ms ease',
              }} />
            </div>
          </div>

          {/* Quick Color Swatches */}
          <div>
            <Label>Quick Color Palettes</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {QUICK_COLORS.map(({ label, hex }) => (
                <button
                  key={hex}
                  onClick={() => onSettingChange('color', hex)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.45rem',
                    padding: '0.45rem 0.55rem',
                    borderRadius: 'var(--r-sm)',
                    background: tracerSettings.color === hex ? 'rgba(191,155,111,0.18)' : 'var(--ink-3)',
                    border: `1px solid ${tracerSettings.color === hex ? 'var(--bronze)' : 'var(--ink-4)'}`,
                    cursor: 'pointer', transition: 'all 150ms ease'
                  }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: '50%', background: hex, boxShadow: `0 0 6px ${hex}80` }} />
                  <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.68rem', color: 'var(--cream)' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <Label>Custom Color Picker</Label>
            <div style={{ marginBottom: '0.75rem' }}>
              <style>{`
                .react-colorful { width: 100% !important; height: 130px; border-radius: 8px; overflow: hidden; }
                .react-colorful__saturation { border-radius: 8px 8px 0 0; }
                .react-colorful__hue { height: 10px; border-radius: 0 0 8px 8px; }
                .react-colorful__pointer { width: 16px; height: 16px; border: 2px solid #fff; }
              `}</style>
              <HexColorPicker color={tracerSettings.color} onChange={v => onSettingChange('color', v)} />
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.55rem 0.75rem',
              background: 'var(--ink-3)', borderRadius: 'var(--r-sm)',
              border: '1px solid var(--ink-4)',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 4,
                background: tracerSettings.color,
                boxShadow: `0 0 8px ${tracerSettings.color}70`,
                flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)',
              }} />
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.8rem', color: 'var(--silver)', fontWeight: 600 }}>
                {tracerSettings.color.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Width */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <Label>Line Thickness</Label>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--cream)' }}>
                {tracerSettings.width}px
              </span>
            </div>
            <input
              id="width-slider"
              type="range" min={2} max={24} step={1}
              value={tracerSettings.width}
              onChange={e => onSettingChange('width', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--bronze)', marginBottom: '0.3rem' }}
            />
          </div>

          {/* Opacity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <Label>Line Opacity</Label>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--cream)' }}>
                {Math.round(tracerSettings.opacity * 100)}%
              </span>
            </div>
            <input
              id="opacity-slider"
              type="range" min={0.1} max={1} step={0.05}
              value={tracerSettings.opacity}
              onChange={e => onSettingChange('opacity', Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--bronze)' }}
            />
          </div>

          {/* Style */}
          <div>
            <Label>Dash Style</Label>
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              {styles.map(s => (
                <button
                  key={s}
                  id={`style-${s}`}
                  onClick={() => onSettingChange('style', s)}
                  style={{
                    flex: 1, padding: '0.6rem 0.4rem',
                    borderRadius: 'var(--r-sm)',
                    background: tracerSettings.style === s ? 'rgba(191,155,111,0.18)' : 'var(--ink-3)',
                    border: `1px solid ${tracerSettings.style === s ? 'var(--bronze)' : 'var(--ink-4)'}`,
                    cursor: 'pointer', textAlign: 'center',
                    fontFamily: "'Space Grotesk', monospace",
                    fontSize: '0.75rem', fontWeight: tracerSettings.style === s ? 700 : 400,
                    color: tracerSettings.style === s ? 'var(--cream)' : 'var(--ash)',
                    transition: 'all 200ms ease', textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}