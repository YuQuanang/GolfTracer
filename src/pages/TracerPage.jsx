import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrial } from '../context/TrialContext';
import toast from 'react-hot-toast';

import VideoUploader from '../components/tracer/VideoUploader';
import VideoPlayer from '../components/tracer/VideoPlayer';
import TracerControls from '../components/tracer/TracerControls';
import TracerEditor from '../components/tracer/TracerEditor';
import VideoExporter from '../components/tracer/VideoExporter';

const STEPS = ['Upload', 'Process', 'Edit', 'Export'];

/* ── Step indicator ─────────────────────────────────────────────── */
function StepBar({ active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {STEPS.map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: 28, height: 28,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.7rem', fontWeight: 600,
                background: done ? 'var(--bronze)' : current ? 'var(--ink-4)' : 'var(--ink-3)',
                border: current ? '1px solid rgba(191,155,111,0.5)' : done ? 'none' : '1px solid var(--ink-4)',
                color: done ? 'var(--ink)' : current ? 'var(--bronze)' : 'var(--smoke)',
                transition: 'all 300ms ease',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{
                fontFamily: "'Space Grotesk', monospace",
                fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: current ? 'var(--bronze)' : done ? 'var(--silver)' : 'var(--smoke)',
                whiteSpace: 'nowrap',
              }}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 1, minWidth: 32,
                background: done ? 'var(--bronze-dk)' : 'var(--ink-4)',
                margin: '0 0.5rem',
                marginBottom: '1.2rem',
                transition: 'background 300ms ease',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Progress ring ──────────────────────────────────────────────── */
function ProgressRing({ pct }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 112, height: 112 }}>
      <svg width="112" height="112" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="56" cy="56" r={r} fill="none" stroke="var(--ink-4)" strokeWidth="2" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke="var(--bronze)" strokeWidth="2"
          strokeDasharray={circ}
          strokeDashoffset={circ - (pct / 100) * circ}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 300ms ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)', lineHeight: 1 }}>
          {pct}%
        </span>
      </div>
    </div>
  );
}

/* ── TracerPage ─────────────────────────────────────────────────── */
export default function TracerPage() {
  const { usesLeft, isPro, consumeTrial, setShowPaywall } = useTrial();

  const [activeStep, setActiveStep] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [tracerPoints, setTracerPoints] = useState([]);
  const [tracerSettings, setTracerSettings] = useState({
    color: '#BF9B6F', width: 3, opacity: 0.85, style: 'solid',
  });
  const [error, setError] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileUpload = (file) => {
    if (!file) return;
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setActiveStep(1);
    setError('');
  };

  const processVideo = async () => {
    // Trial gate
    const allowed = consumeTrial();
    if (!allowed) { setShowPaywall(true); return; }

    setIsProcessing(true);
    setProcessingProgress(0);
    setError('');
    setTracerPoints([]);

    try {
      const { loadModel, preprocess, postprocess } = await import('../utils/yoloUtils.js');
      const session = await loadModel('/golf-vfa.onnx');
      const video = videoRef.current?.getVideoElement();
      if (!video) throw new Error('Video element not found');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const duration = video.duration || videoRef.current.getDuration();
      const fps = 30;
      const totalFrames = Math.floor(duration * fps);
      const points = [];
      let currentFrame = 0;

      for (let time = 0; time < duration; time += 1 / fps) {
        video.currentTime = time;
        await new Promise(resolve => {
          const fn = () => { video.removeEventListener('seeked', fn); resolve(); };
          video.addEventListener('seeked', fn);
          setTimeout(() => { video.removeEventListener('seeked', fn); resolve(); }, 100);
        });
        const tensor = preprocess(canvas, ctx, video);
        const results = await session.run({ images: tensor });
        const outputName = Object.keys(results)[0];
        const bestBox = postprocess(results[outputName], video.videoWidth, video.videoHeight);
        if (bestBox) points.push({ x: bestBox.x, y: bestBox.y, frame: currentFrame });
        currentFrame++;
        setProcessingProgress(Math.min(100, Math.floor((currentFrame / totalFrames) * 100)));
      }

      setTracerPoints(points);
      setIsProcessing(false);
      setActiveStep(2);
      video.currentTime = 0;
      toast.success('Ball flight traced successfully!');
    } catch (err) {
      setError('Processing failed: ' + err.message);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setVideoFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl('');
    setTracerPoints([]);
    setError('');
    setProcessingProgress(0);
  };

  const getContent = (step) => {
    switch (step) {
      case 0:
        return <VideoUploader onFileUpload={handleFileUpload} />;

      case 1:
        return (
          <div style={{ textAlign: 'center' }}>
            {videoUrl && (
              <div style={{ marginBottom: '2rem' }}>
                <VideoPlayer videoUrl={videoUrl} ref={videoRef} />
              </div>
            )}
            {isProcessing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                <ProgressRing pct={processingProgress} />
                <div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.4rem', color: 'var(--cream)', marginBottom: '0.25rem' }}>
                    Analysing ball flight…
                  </p>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: 'var(--mist)' }}>
                    YOLOv8 is tracing every frame. This may take a few minutes.
                  </p>
                </div>
                <div style={{ width: '100%', maxWidth: 360, height: 2, background: 'var(--ink-4)', borderRadius: 1, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${processingProgress}%`,
                    background: 'linear-gradient(90deg, var(--bronze-dk), var(--bronze))',
                    transition: 'width 300ms ease',
                  }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                {/* Trial warning if last use */}
                {!isPro && usesLeft === 1 && (
                  <div style={{
                    padding: '0.6rem 1.25rem',
                    background: 'rgba(160,55,42,0.1)',
                    border: '1px solid rgba(160,55,42,0.3)',
                    borderRadius: 'var(--r-sm)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.8rem', color: '#C0796C',
                    marginBottom: '0.5rem',
                  }}>
                    ⚠ This is your last free analysis. <Link to="/pricing" style={{ color: 'inherit', textDecoration: 'underline' }}>Upgrade</Link> to continue after.
                  </div>
                )}
                <button
                  id="process-btn"
                  className="btn btn-primary"
                  onClick={processVideo}
                  disabled={!isPro && usesLeft === 0}
                  style={{ fontSize: '0.95rem', padding: '0.8rem 2rem', opacity: (!isPro && usesLeft === 0) ? 0.5 : 1 }}
                >
                  {(!isPro && usesLeft === 0) ? 'No analyses remaining' : 'Process & Trace Ball'}
                </button>
                {!isPro && usesLeft === 0 && (
                  <Link to="/pricing" className="btn btn-bronze" style={{ fontSize: '0.85rem' }}>
                    View Plans
                  </Link>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <VideoPlayer videoUrl={videoUrl} tracerPoints={tracerPoints} tracerSettings={tracerSettings} ref={videoRef} />
              </div>
              <TracerEditor
                videoRef={videoRef} canvasRef={canvasRef}
                tracerPoints={tracerPoints}
                updateTracerPoint={(i, p) => { const u = [...tracerPoints]; u[i] = { ...u[i], ...p }; setTracerPoints(u); }}
                addTracerPoint={(p) => setTracerPoints([...tracerPoints, p])}
                removeTracerPoint={(i) => setTracerPoints(tracerPoints.filter((_, j) => j !== i))}
              />
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={() => setActiveStep(3)} style={{ fontSize: '0.9rem' }}>
                  Export Video →
                </button>
              </div>
            </div>
            <TracerControls tracerSettings={tracerSettings} onSettingChange={(k, v) => setTracerSettings(s => ({ ...s, [k]: v }))} />
            <style>{`@media (max-width: 900px) {
              /* stack on mobile */
            }`}</style>
          </div>
        );

      case 3:
        return <VideoExporter videoFile={videoFile} videoUrl={videoUrl} tracerPoints={tracerPoints} tracerSettings={tracerSettings} />;

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ padding: '3.5rem 0 2.5rem', borderBottom: '1px solid var(--ink-3)' }}>
        <div className="container">
          <p className="t-label" style={{ marginBottom: '0.5rem' }}>Tracer Tool</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 600, fontStyle: 'italic',
            color: 'var(--cream)', lineHeight: 1.1,
          }}>
            Golf Swing Tracer
          </h1>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        {/* Step bar */}
        <div style={{
          padding: '1.5rem 2rem',
          background: 'var(--ink-2)',
          border: '1px solid var(--ink-4)',
          borderRadius: 'var(--r-md)',
          marginBottom: '2.5rem',
        }}>
          <StepBar active={activeStep} />
        </div>

        {/* Trial banner */}
        {!isPro && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            background: 'var(--ink-2)',
            border: `1px solid ${usesLeft > 0 ? 'var(--ink-4)' : 'rgba(160,55,42,0.35)'}`,
            borderRadius: 'var(--r-sm)',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: i < (3 - usesLeft) ? 'var(--ink-5)' : 'var(--bronze)',
                    boxShadow: i >= (3 - usesLeft) ? '0 0 5px rgba(191,155,111,0.5)' : 'none',
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: usesLeft > 0 ? 'var(--ash)' : '#C0796C' }}>
                {usesLeft > 0
                  ? `${usesLeft} free ${usesLeft === 1 ? 'analysis' : 'analyses'} remaining`
                  : 'All free analyses used — upgrade to continue'}
              </span>
            </div>
            <Link to="/pricing" className="btn btn-ghost" style={{ padding: '0.35rem 0.9rem', fontSize: '0.75rem' }}>
              View plans →
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '1rem 1.25rem',
            background: 'rgba(160,55,42,0.1)',
            border: '1px solid rgba(160,55,42,0.3)',
            borderRadius: 'var(--r-sm)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.85rem', color: '#C9897C',
            marginBottom: '1.5rem', lineHeight: 1.6,
          }}>
            {error}
          </div>
        )}

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {getContent(activeStep)}
          </motion.div>
        </AnimatePresence>

        {/* Reset */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
          <button
            id="reset-btn"
            className="btn btn-outline"
            onClick={handleReset}
            style={{ fontSize: '0.8rem', padding: '0.55rem 1.25rem', color: 'var(--smoke)', borderColor: 'var(--ink-4)' }}
          >
            ↺ Start over
          </button>
        </div>
      </div>
    </div>
  );
}