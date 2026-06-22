import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TrialProvider } from './context/TrialContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <TrialProvider>
        <App />
      </TrialProvider>
    </BrowserRouter>
  </React.StrictMode>
);