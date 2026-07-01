import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const VideoExporter = ({ videoFile, videoUrl, tracerPoints, tracerSettings }) => {
  const [ffmpeg, setFfmpeg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState('');
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('golftracer_pro_swing');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const ffmpegInstance = new FFmpeg();
        ffmpegInstance.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });
        await ffmpegInstance.load({
          coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.js', 'application/javascript'),
          wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.2/dist/ffmpeg-core.wasm', 'application/wasm'),
        });
        setFfmpeg(ffmpegInstance);
        setIsReady(true);
        setIsLoading(false);
      } catch (err) {
        setError(`Error initializing FFmpeg: ${err.message}`);
        setIsLoading(false);
      }
    };
    load();
    return () => {
      if (exportedUrl) URL.revokeObjectURL(exportedUrl);
    };
  }, []);

  const exportVideo = async () => {
    if (!ffmpeg || !videoFile || !tracerPoints) return;
    try {
      setIsLoading(true);
      setProgress(0);
      setError('');
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      const svgOverlay = generateSvgOverlay();
      await ffmpeg.writeFile('overlay.svg', svgOverlay);
      await ffmpeg.exec(['-i', 'input.mp4', '-hide_banner', '-loglevel', 'error']);
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'overlay.svg',
        '-filter_complex', '[0:v][1:v]overlay=0:0',
        '-c:a', 'copy',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        'output.mp4'
      ]);
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setIsLoading(false);
    } catch (err) {
      setError(`Error exporting video: ${err.message}`);
      setIsLoading(false);
    }
  };

  const generateSvgOverlay = () => {
    const width = 1280;
    const height = 720;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
    if (tracerPoints && tracerPoints.length > 1) {
      svg += `<path d="M ${tracerPoints[0].x} ${tracerPoints[0].y}`;
      for (let i = 1; i < tracerPoints.length; i++) {
        svg += ` L ${tracerPoints[i].x} ${tracerPoints[i].y}`;
      }
      svg += `" fill="none" stroke="${tracerSettings?.color || '#BF9B6F'}" stroke-width="${tracerSettings?.width || 10}" stroke-opacity="${tracerSettings?.opacity || 0.85}" `;
      if (tracerSettings?.style === 'dashed') svg += `stroke-dasharray="12,8" `;
      if (tracerSettings?.style === 'dotted') svg += `stroke-dasharray="4,6" `;
      svg += `/>`;
    }
    svg += '</svg>';
    return svg;
  };

  const downloadVideo = () => {
    if (!exportedUrl) return;
    const a = document.createElement('a');
    a.href = exportedUrl;
    a.download = `${fileName || 'golftracer_swing'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="studio-card" style={{ padding: '2rem', maxWidth: 760, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p className="t-label" style={{ marginBottom: '0.3rem' }}>High-Definition Render</p>
        <h3 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 600, fontStyle: 'italic',
          color: 'var(--cream)', margin: 0
        }}>
          Export Studio & Download
        </h3>
      </div>

      {/* File Name Config */}
      <div style={{ marginBottom: '2rem', background: 'var(--ink-3)', padding: '1.2rem', borderRadius: 'var(--r-sm)', border: '1px solid var(--ink-4)' }}>
        <label style={{
          display: 'block', fontFamily: "'Space Grotesk', monospace",
          fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--silver)', marginBottom: '0.5rem'
        }}>
          Export File Name
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={isLoading}
            style={{
              flex: 1, padding: '0.75rem 1rem',
              background: 'var(--ink)', border: '1px solid var(--ink-4)',
              borderRadius: 'var(--r-sm)', color: 'var(--cream)',
              fontFamily: "'Space Grotesk', monospace", fontSize: '0.9rem', outline: 'none'
            }}
          />
          <span style={{
            display: 'flex', alignItems: 'center', padding: '0 1rem',
            background: 'var(--ink-4)', borderRadius: 'var(--r-sm)',
            fontFamily: "'Space Grotesk', monospace", fontSize: '0.82rem', color: 'var(--ash)'
          }}>
            .mp4
          </span>
        </div>
      </div>

      {/* Loading Engine State */}
      {!isReady && !error && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '0.25rem' }}>
            Warming up FFmpeg Studio Engine…
          </p>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: 'var(--mist)' }}>
            Loading WebAssembly video codecs directly in your browser.
          </p>
        </div>
      )}

      {/* Active Rendering State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '1.5rem', position: 'relative', width: 100, height: 100, margin: '0 auto 1.5rem' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--ink-4)" strokeWidth="6" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="var(--bronze)" strokeWidth="6"
                strokeDasharray="276" strokeDashoffset={276 - (progress / 100) * 276}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 300ms ease', transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '1.2rem', fontWeight: 700, color: 'var(--cream)' }}>{progress}%</span>
            </div>
          </div>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--cream)', marginBottom: '0.4rem' }}>
            Compositing 60 FPS Tracer Layer…
          </h4>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem', color: 'var(--mist)' }}>
            Baking aerodynamic trajectory curves onto your swing video. Please keep this tab open.
          </p>
        </div>
      )}

      {/* Ready to Export */}
      {!isLoading && isReady && !exportedUrl && (
        <div>
          <button
            onClick={exportVideo}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', boxShadow: 'var(--shadow-bronze)' }}
          >
            ⚡ Render & Export High-Definition MP4
          </button>
        </div>
      )}

      {/* Render Completed & Ready to Download */}
      {exportedUrl && (
        <div>
          <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--ink-4)' }}>
            <video src={exportedUrl} controls style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              onClick={downloadVideo}
              className="btn btn-primary"
              style={{ padding: '0.9rem', fontSize: '0.95rem', boxShadow: 'var(--shadow-bronze)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <span>⬇</span> Download MP4 Video
            </button>
            <button
              onClick={() => setExportedUrl('')}
              className="btn btn-outline"
              style={{ padding: '0.9rem', fontSize: '0.9rem' }}
            >
              ↺ Render New Version
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '1.5rem', padding: '1rem',
          background: 'rgba(160,55,42,0.15)', border: '1px solid rgba(160,55,42,0.4)',
          borderRadius: 'var(--r-sm)', color: '#E08E7E',
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.85rem'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default VideoExporter;