import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PaywallModal from './components/PaywallModal';

import HomePage from './pages/HomePage';
import TracerPage from './pages/TracerPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';

function App() {
  return (
    <>
      <div className="app">
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/tracer"  element={<TracerPage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </main>
        <Footer />
        <PaywallModal />
      </div>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#181818',
            color: '#F2EDE5',
            border: '1px solid #2E2E2E',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.875rem',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: '#BF9B6F', secondary: '#0A0A0A' },
          },
        }}
      />
    </>
  );
}

export default App;