import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { simulateTrajectory, getTrajectoryPointAtTime, mapPhysicsTimeToScreenProgress } from '../../utils/golfPhysicsEngine';

/* ── colours matching the site theme ─────────────────────── */
const HANDLE_COLORS = { start: '#00E676', apex: '#FFD600', landing: '#FF5252' };

/* ── helpers ──────────────────────────────────────────────── */
const fmt = (s) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Evaluate quadratic Bézier at parameter t */
const bezierPt = (p0, p1, p2, t) => {
  const m = 1 - t;
  return { x: m * m * p0.x + 2 * m * t * p1.x + t * t * p2.x,
           y: m * m * p0.y + 2 * m * t * p1.y + t * t * p2.y };
};

/** Draw a partial quadratic Bézier from tStart to tEnd (80 segments) */
const drawBezierSegment = (ctx, p0, p1, p2, tStart, tEnd) => {
  const steps = 80;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = tStart + (tEnd - tStart) * (i / steps);
    const { x, y } = bezierPt(p0, p1, p2, t);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
};

/** Draw Bézier curve sampled according to RK4 kinematic physics velocity distribution */
const drawPhysicsSegment = (ctx, p0, p1, p2, uStart, uEnd, physicsTrajectory, clubKey = 'DRIVER') => {
  if (!physicsTrajectory || physicsTrajectory.length === 0) {
    drawBezierSegment(ctx, p0, p1, p2, uStart, uEnd);
    return;
  }
  const steps = 150;
  const T_max = physicsTrajectory[physicsTrajectory.length - 1].t || 1;

  // Calculate maximum lateral curvature (z) for Draw/Fade shaping
  let maxZ = 0.01;
  for (const p of physicsTrajectory) {
    if (Math.abs(p.z) > maxZ) maxZ = Math.abs(p.z);
  }
  const span = Math.hypot(p2.x - p0.x, p2.y - p0.y) || 300;
  const maxLateralPx = Math.min(75, span * 0.22); // up to 75px lateral bow on screen

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const screenProgress = uStart + (uEnd - uStart) * (i / steps);
    const { x, y } = bezierPt(p0, p1, p2, screenProgress);

    // Apply lateral Draw/Fade displacement
    let lateralOffset = 0;
    if (maxZ > 0.5) {
      const t_query = screenProgress * T_max;
      const pt = getTrajectoryPointAtTime(physicsTrajectory, t_query, 1.0);
      if (pt) {
        lateralOffset = (pt.z / maxZ) * maxLateralPx;
      }
    }

    const finalX = x + lateralOffset;
    i === 0 ? ctx.moveTo(finalX, y) : ctx.lineTo(finalX, y);
  }
  ctx.stroke();
};

/** Draw a circular handle without text label, highlighting when active */
const drawHandle = (ctx, x, y, key, isActive) => {
  const color = HANDLE_COLORS[key];
  const r = isActive ? 13 : 10;

  ctx.save();
  ctx.globalAlpha = 1;

  // Active pulsing target ring when focused
  if (isActive) {
    ctx.beginPath();
    ctx.arc(x, y, r + 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
  }

  // glow ring
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.fillStyle = color + (isActive ? '60' : '30');
  ctx.fill();

  // filled circle
  ctx.shadowColor = color;
  ctx.shadowBlur = isActive ? 20 : 14;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // white border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = isActive ? 2.5 : 1.5;
  ctx.stroke();

  ctx.restore();
};

/* ── component ────────────────────────────────────────────── */
const VideoPlayer = forwardRef(({ videoUrl, curvePoints, tracerSettings = {}, editMode = false, activeHandle, onSelectHandle, onCurvePointChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const dragging   = useRef(null); // 'start' | 'apex' | 'landing' | null
  const drawRef    = useRef(null); // always-fresh drawTracer reference

  /* ── imperative handle ──────────────────────────────────── */
  useImperativeHandle(ref, () => ({
    play:           () => { videoRef.current.play();  setIsPlaying(true);  },
    pause:          () => { videoRef.current.pause(); setIsPlaying(false); },
    getCurrentTime: () => videoRef.current.currentTime,
    getDuration:    () => videoRef.current.duration,
    seekTo:    (t) => { videoRef.current.currentTime = t; },
    getVideoElement: () => videoRef.current,
    getCanvasElement: () => canvasRef.current,
  }));

  /* ── video event wiring (once) ──────────────────────────── */
  useEffect(() => {
    const v = videoRef.current;
    const onTime  = () => { setCurrentTime(v.currentTime); drawRef.current?.(); };
    const onMeta  = () => setDuration(v.duration);
    const onEnded = () => setIsPlaying(false);
    v.addEventListener('timeupdate',     onTime);
    v.addEventListener('loadedmetadata', onMeta);
    v.addEventListener('ended',          onEnded);
    return () => {
      v.removeEventListener('timeupdate',     onTime);
      v.removeEventListener('loadedmetadata', onMeta);
      v.removeEventListener('ended',          onEnded);
    };
  }, []);

  /* ── 60 FPS smooth animation loop during playback ─────────── */
  useEffect(() => {
    let animId;
    const renderLoop = () => {
      if (videoRef.current && !videoRef.current.paused) {
        setCurrentTime(videoRef.current.currentTime);
        drawRef.current?.();
      }
      animId = requestAnimationFrame(renderLoop);
    };
    if (isPlaying) {
      animId = requestAnimationFrame(renderLoop);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying]);

  /* ── draw whenever props change ─────────────────────────── */
  useEffect(() => { drawRef.current?.(); }, [curvePoints, tracerSettings, editMode]);

  /* ── drawTracer — re-created each render, stored in ref ── */
  const drawTracer = () => {
    const canvas = canvasRef.current;
    const video  = videoRef.current;
    if (!canvas || !video || !video.videoWidth) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!curvePoints) return;
    const { start, apex, landing } = curvePoints;
    if (!start || !apex || !landing) return;

    const color   = tracerSettings.color   || '#BF9B6F';
    const width   = tracerSettings.width   || 3;
    const opacity = tracerSettings.opacity || 0.85;
    const style   = tracerSettings.style   || 'solid';

    ctx.lineWidth  = width;
    ctx.lineCap    = 'round';
    ctx.lineJoin   = 'round';
    ctx.strokeStyle = color;

    if      (style === 'dashed') ctx.setLineDash([width * 3, width * 2]);
    else if (style === 'dotted') ctx.setLineDash([width,     width * 3]);
    else                          ctx.setLineDash([]);

    const curTime = video.currentTime;

    // If start time hasn't been explicitly confirmed by pressing "Set to Current Frame",
    // do not draw ANY tracer lines, faint outlines, or handles whether playing or paused!
    if (!tracerSettings.isStartTimeConfirmed) {
      return;
    }

    // Determine start time (in seconds)
    const startTime = tracerSettings.startTime !== undefined
      ? tracerSettings.startTime
      : (start.frame !== undefined ? start.frame / 30 : 0);

    // When playing back or before start/impact time, hide revealed tracer completely
    if (curTime < startTime && !video.paused) return;
    if (!editMode && curTime < startTime) return;

    // Generate kinematic physics trajectory based on selected club & aerodynamic shape
    const clubKey = tracerSettings.club || 'DRIVER';
    const shapeKey = tracerSettings.shotShape || 'STRAIGHT';
    const physicsTrajectory = simulateTrajectory(clubKey, shapeKey);

    // Progress parameter u mapped with perspective launch acceleration and apex synchronization
    const speed = tracerSettings.speed || 1;
    const elapsed = Math.max(0, curTime - startTime);
    const progressFraction = mapPhysicsTimeToScreenProgress(physicsTrajectory, elapsed * speed, clubKey);

    // Treat apex as ON-CURVE point at t=0.5 → back-compute the Bézier control point P1
    const P1 = {
      x: 2 * apex.x - 0.5 * (start.x + landing.x),
      y: 2 * apex.y - 0.5 * (start.y + landing.y),
    };

    // Ghost (full path, faint) — ONLY visible when actively editing
    if (editMode) {
      ctx.globalAlpha = opacity * 0.18;
      ctx.shadowBlur  = 0;
      drawPhysicsSegment(ctx, start, P1, landing, 0, 1, physicsTrajectory, clubKey);
    }

    // Revealed portion with physics velocity mapping
    if (progressFraction > 0) {
      ctx.globalAlpha  = opacity;
      ctx.shadowColor  = color;
      ctx.shadowBlur   = width * 2.5;
      drawPhysicsSegment(ctx, start, P1, landing, 0, progressFraction, physicsTrajectory, clubKey);
    }

    // Edit handles
    if (editMode) {
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Control polygon (dashed lines: start → apex → landing)
      ctx.globalAlpha  = 0.3;
      ctx.strokeStyle  = '#FFFFFF';
      ctx.lineWidth    = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(apex.x,  apex.y);
      ctx.lineTo(landing.x, landing.y);
      ctx.stroke();

      // Handles
      drawHandle(ctx, start.x,   start.y,   'start',   activeHandle === 'start');
      drawHandle(ctx, apex.x,    apex.y,    'apex',    activeHandle === 'apex');
      drawHandle(ctx, landing.x, landing.y, 'landing', activeHandle === 'landing');
    }
  };

  // Keep the ref current every render
  drawRef.current = drawTracer;

  /* ── canvas coordinate transform ───────────────────────── */
  const canvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left)  * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)   * (canvas.height / rect.height),
    };
  };

  const hitHandle = (x, y) => {
    if (!curvePoints) return null;
    const HIT = 20;
    for (const key of ['start', 'apex', 'landing']) {
      const p = curvePoints[key];
      if (p && Math.hypot(x - p.x, y - p.y) < HIT) return key;
    }
    return null;
  };

  /* ── drag handlers ──────────────────────────────────────── */
  const onMouseDown = (e) => {
    if (!editMode) return;
    const { x, y } = canvasCoords(e);
    const hit = hitHandle(x, y);
    if (hit) {
      dragging.current = hit;
      onSelectHandle?.(hit);
    } else if (activeHandle) {
      onCurvePointChange?.(activeHandle, x, y);
      dragging.current = activeHandle;
    }
  };
  const onMouseMove = (e) => {
    if (!editMode || !dragging.current) return;
    const { x, y } = canvasCoords(e);
    onCurvePointChange?.(dragging.current, x, y);
  };
  const onMouseUp = () => { dragging.current = null; };

  /* ── playback controls ──────────────────────────────────── */
  const togglePlay = () => {
    if (isPlaying) { videoRef.current.pause(); setIsPlaying(false); }
    else            { videoRef.current.play();  setIsPlaying(true);  }
  };
  const handleSeek = (e) => {
    const t = Number(e.target.value);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  };
  const toggleMute = () => {
    if (isMuted) { videoRef.current.volume = volume || 0.5; setIsMuted(false); }
    else          { videoRef.current.volume = 0;             setIsMuted(true);  }
  };
  const toggleFullscreen = () => {
    const el = document.getElementById('video-container');
    if (!document.fullscreenElement) el?.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div
      id="video-container"
      style={{ position: 'relative', width: '100%', maxWidth: 560, margin: '0 auto',
               borderRadius: 8, overflow: 'hidden', background: '#000' }}
    >
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          src={videoUrl}
          style={{ width: '100%', display: 'block' }}
          muted={isMuted}
          playsInline
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: editMode ? 'auto' : 'none',
            cursor:        editMode ? 'crosshair' : 'default',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        padding: '1.5rem 0.875rem 0.75rem',
      }}>
        {/* Seek bar */}
        <input
          type="range" min={0} max={duration || 100} step={0.033}
          value={currentTime}
          onChange={handleSeek}
          style={{ width: '100%', height: 3, marginBottom: '0.5rem',
                   accentColor: '#BF9B6F', cursor: 'pointer', display: 'block' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button id="vp-play" onClick={togglePlay}
              style={{ background: 'none', border: 'none', color: '#F2EDE5',
                       cursor: 'pointer', fontSize: '1rem', padding: '2px 6px', lineHeight: 1 }}>
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button id="vp-mute" onClick={toggleMute}
              style={{ background: 'none', border: 'none', color: '#888',
                       cursor: 'pointer', fontSize: '0.85rem', padding: '2px 4px', lineHeight: 1 }}>
              {isMuted ? '🔇' : '🔊'}
            </button>
            <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.68rem',
                           color: '#888', letterSpacing: '0.06em' }}>
              {fmt(currentTime)} / {fmt(duration)}
            </span>
          </div>
          <button id="vp-fullscreen" onClick={toggleFullscreen}
            style={{ background: 'none', border: 'none', color: '#666',
                     cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1 }}>
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
});

export default VideoPlayer;