import React, { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { simulateTrajectory, getTrajectoryPointAtTime, mapPhysicsTimeToScreenProgress } from '../../utils/golfPhysicsEngine.js';

const getVideoMetadata = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve({ width: 1280, height: 720, duration: 5 });
      return;
    }
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      resolve({
        width: v.videoWidth || 1280,
        height: v.videoHeight || 720,
        duration: v.duration && isFinite(v.duration) && v.duration > 0 ? v.duration : 5
      });
    };
    v.onerror = () => {
      resolve({ width: 1280, height: 720, duration: 5 });
    };
    v.src = url;
  });
};

const VideoExporter = ({ videoFile, videoUrl, curvePoints, tracerPoints, tracerSettings }) => {
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
        ffmpegInstance.on('progress', ({ progress: p }) => {
          // Map FFmpeg encoding progress to the remaining 45% -> 100%
          setProgress((prev) => Math.max(prev, Math.min(100, 45 + Math.round(p * 55))));
        });
        let loaded = false;
        const cdns = [
          'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
          'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm'
        ];
        
        for (const baseURL of cdns) {
          try {
            await ffmpegInstance.load({
              coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'application/javascript'),
              wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            loaded = true;
            break;
          } catch (e) {
            console.warn(`Failed loading FFmpeg core from ${baseURL}:`, e);
          }
        }

        if (!loaded) {
          throw new Error('Failed to load FFmpeg video processing engine from CDN due to network or CORS restrictions.');
        }

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
      if (exportedUrl) {
        try { URL.revokeObjectURL(exportedUrl); } catch (_) {}
      }
    };
  }, []);

  const exportVideo = async () => {
    if (!ffmpeg || !videoFile) return;
    try {
      setIsLoading(true);
      setProgress(0);
      setError('');

      // 1. Get exact video dimensions and duration
      const { width, height, duration } = await getVideoMetadata(videoUrl);
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      // 2. Setup physics trajectory simulation parameters
      const clubKey = tracerSettings?.club || 'DRIVER';
      const shapeKey = tracerSettings?.shotShape || 'STRAIGHT';
      const speed = tracerSettings?.speed || 1;
      const physicsTrajectory = simulateTrajectory(clubKey, shapeKey);
      const T_max = physicsTrajectory[physicsTrajectory.length - 1]?.t || 1;

      let maxZ = 0.01;
      for (const p of physicsTrajectory) {
        if (Math.abs(p.z) > maxZ) maxZ = Math.abs(p.z);
      }

      // Determine impact start time
      const startTime = tracerSettings?.startTime !== undefined
        ? tracerSettings.startTime
        : (curvePoints?.start?.frame !== undefined ? curvePoints.start.frame / 30 : 0);

      // 3. Setup reusable offscreen canvas for dynamic frame sequence generation
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const fps = 30; // standard smooth export frame rate
      const totalFrames = Math.max(1, Math.ceil(duration * fps));
      const generatedFileNames = [];

      // Generate dynamic frame sequence matching exact kinematics
      for (let f = 1; f <= totalFrames; f++) {
        const curTime = (f - 1) / fps;
        ctx.clearRect(0, 0, width, height);

        if (curTime >= startTime) {
          const elapsed = curTime - startTime;
          const progressFraction = mapPhysicsTimeToScreenProgress(physicsTrajectory, elapsed * speed, clubKey);

          if (progressFraction > 0) {
            let pts = [];
            if (curvePoints && curvePoints.start && curvePoints.apex && curvePoints.landing) {
              const p0 = curvePoints.start;
              const apex = curvePoints.apex;
              const p2 = curvePoints.landing;

              const p1 = {
                x: 2 * apex.x - 0.5 * (p0.x + p2.x),
                y: 2 * apex.y - 0.5 * (p0.y + p2.y),
              };

              const span = Math.hypot(p2.x - p0.x, p2.y - p0.y) || 300;
              const maxLateralPx = Math.min(75, span * 0.22);

              const steps = 150;
              const maxStep = Math.floor(steps * progressFraction);

              for (let i = 0; i <= maxStep; i++) {
                const u = (i / steps);
                const inv = 1 - u;
                const bx = inv * inv * p0.x + 2 * inv * u * p1.x + u * u * p2.x;
                const by = inv * inv * p0.y + 2 * inv * u * p1.y + u * u * p2.y;

                let lateralOffset = 0;
                if (maxZ > 0.5) {
                  const pt = getTrajectoryPointAtTime(physicsTrajectory, u * T_max, 1.0);
                  if (pt) {
                    lateralOffset = (pt.z / maxZ) * maxLateralPx;
                  }
                }
                pts.push({ x: bx + lateralOffset, y: by });
              }
            } else if (tracerPoints && tracerPoints.length > 1) {
              const maxIdx = Math.max(1, Math.floor(tracerPoints.length * progressFraction));
              pts = tracerPoints.slice(0, maxIdx + 1);
            }

            if (pts.length > 1) {
              ctx.beginPath();
              ctx.moveTo(pts[0].x, pts[0].y);
              for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
              }

              ctx.strokeStyle = tracerSettings?.color || '#BF9B6F';
              ctx.lineWidth = tracerSettings?.width || 10;
              ctx.globalAlpha = tracerSettings?.opacity ?? 0.85;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';

              if (tracerSettings?.style === 'dashed') {
                ctx.setLineDash([ctx.lineWidth * 2.5, ctx.lineWidth * 1.5]);
              } else if (tracerSettings?.style === 'dotted') {
                ctx.setLineDash([ctx.lineWidth * 0.8, ctx.lineWidth * 1.5]);
              } else {
                ctx.setLineDash([]);
              }
              ctx.stroke();

              // Draw glowing start anchor dot
              ctx.globalAlpha = 1;
              ctx.setLineDash([]);
              ctx.fillStyle = tracerSettings?.color || '#BF9B6F';
              ctx.beginPath();
              ctx.arc(pts[0].x, pts[0].y, ctx.lineWidth * 0.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const frameName = `overlay_${String(f).padStart(4, '0')}.png`;
        await ffmpeg.writeFile(frameName, await fetchFile(blob));
        generatedFileNames.push(frameName);

        // Update progress bar during frame rendering (0% -> 45%)
        setProgress(Math.round((f / totalFrames) * 45));
      }

      // 4. Composite frame sequence over video stream at 60/30 FPS sync
      const ret = await ffmpeg.exec([
        '-i', 'input.mp4',
        '-framerate', `${fps}`,
        '-i', 'overlay_%04d.png',
        '-filter_complex', '[0:v][1:v]overlay=0:0:shortest=1',
        '-c:a', 'copy',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        'output.mp4'
      ]);

      // Free up temporary frame memory inside FFmpeg WebAssembly virtual filesystem
      for (const fname of generatedFileNames) {
        try { await ffmpeg.deleteFile(fname); } catch (_) {}
      }

      if (ret !== 0 && ret !== undefined && ret !== null && typeof ret === 'number') {
        throw new Error(`FFmpeg exited with error code ${ret}`);
      }

      const data = await ffmpeg.readFile('output.mp4');
      if (!data || data.length === 0) {
        throw new Error('Video rendering completed but generated 0 bytes. Please verify input video format.');
      }

      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setExportedUrl(url);
      setIsLoading(false);
    } catch (err) {
      console.error('Export error:', err);
      setError(`Error exporting video: ${err.message}`);
      setIsLoading(false);
    }
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
              onClick={() => {
                if (exportedUrl) { try { URL.revokeObjectURL(exportedUrl); } catch (_) {} }
                setExportedUrl('');
              }}
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