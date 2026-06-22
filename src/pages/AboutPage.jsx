import React from 'react';
import { motion } from 'framer-motion';

const Tip = ({ children }) => (
  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid var(--ink-3)' }}>
    <span style={{ color: 'var(--bronze)', flexShrink: 0, marginTop: 2 }}>—</span>
    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: 'var(--silver)', lineHeight: 1.7 }}>{children}</span>
  </div>
);

export default function AboutPage() {
  return (
    <div>
      {/* Page hero */}
      <section style={{ padding: '6rem 0 5rem', borderBottom: '1px solid var(--ink-3)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'end' }}>
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="t-label"
                style={{ marginBottom: '1rem' }}
              >
                About
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                className="t-display"
                style={{ fontStyle: 'italic', color: 'var(--cream)', marginBottom: '1.5rem' }}
              >
                Golf Ball Tracer
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.95rem', color: 'var(--ash)', lineHeight: 1.8 }}
              >
                Democratising broadcast-quality ball-flight analysis for every golfer — from the weekend warrior to the touring pro's coach.
              </motion.p>
            </div>

            {/* Aside stat */}
            <div style={{
              padding: '2rem',
              background: 'var(--ink-2)',
              border: '1px solid var(--ink-4)',
              borderRadius: 'var(--r-lg)',
            }}>
              <p className="t-label" style={{ marginBottom: '1.5rem' }}>At a Glance</p>
              {[
                { label: 'AI Model', value: 'YOLOv8' },
                { label: 'Runtime', value: 'onnxruntime-web' },
                { label: 'Video Processing', value: 'Client-side WASM' },
                { label: 'Export Engine', value: 'FFmpeg.wasm' },
                { label: 'Data Sent to Server', value: 'Zero' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid var(--ink-3)' }}>
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', color: 'var(--mist)' }}>{label}</span>
                  <span style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.82rem', fontWeight: 600, color: 'var(--cream)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <style>{`@media (max-width: 768px) {
            section:first-child .container > div { grid-template-columns: 1fr !important; }
          }`}</style>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{ maxWidth: 720 }}>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '4rem' }}
          >
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Mission</p>
            <h2 className="t-title" style={{ color: 'var(--cream)', marginBottom: '1.25rem' }}>
              Precision for every golfer
            </h2>
            <p className="t-body-lg">
              Golf Ball Tracer was built to give every golfer access to the kind of ball-flight insight that once required expensive Trackman units or a TV broadcast crew. By running everything locally in the browser, we eliminate the privacy risks and server costs that usually come with AI video tools.
            </p>
          </motion.div>

          <hr className="rule" style={{ marginBottom: '3.5rem' }} />

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '4rem' }}
          >
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>How it works</p>
            <h2 className="t-title" style={{ color: 'var(--cream)', marginBottom: '1.25rem' }}>
              Frame-by-frame AI detection
            </h2>
            <p className="t-body" style={{ marginBottom: '1.5rem' }}>
              When you upload a video, GolfTracer seeks through every frame and feeds each one through a YOLOv8 model compiled to WebAssembly via <span style={{ color: 'var(--bronze)' }}>onnxruntime-web</span>. The model outputs a bounding box around the ball — we take the centre of that box and plot it as a point on the trace.
            </p>
            <p className="t-body" style={{ marginBottom: '2rem' }}>
              Once all frames are processed, you can fine-tune the trace in the editor — adjusting color, line weight, and style. Export uses FFmpeg.wasm to burn the overlay directly onto your video, producing a broadcast-ready file.
            </p>

            {/* Tips */}
            <div style={{
              padding: '1.5rem',
              background: 'var(--ink-2)',
              border: '1px solid var(--ink-4)',
              borderRadius: 'var(--r-md)',
            }}>
              <p className="t-label" style={{ marginBottom: '1rem' }}>Tips for best results</p>
              <Tip>Shoot in good, consistent lighting — avoid harsh shadows across the ball flight path.</Tip>
              <Tip>Use a tripod or stable surface. Camera shake between frames will reduce detection accuracy.</Tip>
              <Tip>Frame the shot so the ball is visible for its entire flight — don't pan the camera.</Tip>
              <Tip>A clean sky or contrasting background behind the ball helps the model isolate it quickly.</Tip>
              <Tip>720p or above is recommended. Higher resolution means fewer missed detections.</Tip>
            </div>
          </motion.div>

          <hr className="rule" style={{ marginBottom: '3.5rem' }} />

          {/* Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="t-label" style={{ marginBottom: '0.75rem' }}>Privacy</p>
            <h2 className="t-title" style={{ color: 'var(--cream)', marginBottom: '1.25rem' }}>
              Your footage stays yours
            </h2>
            <p className="t-body">
              Every byte of video data is processed entirely inside your browser tab. Nothing is uploaded to a server. Trial usage is tracked via a counter in <code style={{ fontFamily: "'Space Grotesk', monospace", fontSize: '0.82rem', color: 'var(--bronze)', background: 'var(--ink-3)', padding: '0.1rem 0.4rem', borderRadius: 3 }}>localStorage</code> — no cookies, no account, no surveillance.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}