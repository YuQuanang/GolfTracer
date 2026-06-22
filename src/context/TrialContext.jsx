import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const TRIAL_KEY = 'gt_trial_uses';
const MAX_FREE = 3;

const TrialContext = createContext(null);

export const TrialProvider = ({ children }) => {
  const [usesLeft, setUsesLeft] = useState(MAX_FREE);
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TRIAL_KEY);
    if (stored !== null) {
      setUsesLeft(Math.max(0, parseInt(stored, 10)));
    }
    // Check if user "subscribed" (demo: stored flag)
    const pro = localStorage.getItem('gt_pro') === 'true';
    setIsPro(pro);
  }, []);

  const consumeTrial = useCallback(() => {
    if (isPro) return true;
    if (usesLeft <= 0) {
      setShowPaywall(true);
      return false;
    }
    const next = usesLeft - 1;
    setUsesLeft(next);
    localStorage.setItem(TRIAL_KEY, String(next));
    if (next === 0) setShowPaywall(false); // let them finish this use
    return true;
  }, [isPro, usesLeft]);

  const upgradeToPro = useCallback(() => {
    localStorage.setItem('gt_pro', 'true');
    setIsPro(true);
    setShowPaywall(false);
  }, []);

  const resetTrials = useCallback(() => {
    localStorage.removeItem(TRIAL_KEY);
    localStorage.removeItem('gt_pro');
    setUsesLeft(MAX_FREE);
    setIsPro(false);
    setShowPaywall(false);
  }, []);

  return (
    <TrialContext.Provider value={{
      usesLeft,
      isPro,
      maxFree: MAX_FREE,
      showPaywall,
      setShowPaywall,
      consumeTrial,
      upgradeToPro,
      resetTrials,
    }}>
      {children}
    </TrialContext.Provider>
  );
};

export const useTrial = () => {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error('useTrial must be used inside <TrialProvider>');
  return ctx;
};
