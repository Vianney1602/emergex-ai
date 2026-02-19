/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { generateRiskGrid } from '../services/riskEngine';

const SafetyContext = createContext(null);

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 }; // Chennai
const RATE_LIMIT = 100;     // max requests per window
const RATE_WINDOW_MS = 60000; // 1-minute window

export function SafetyProvider({ children }) {
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [riskGrid, setRiskGrid] = useState(() =>
    generateRiskGrid(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
  );
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Rate limiting
  const [apiRequestCount, setApiRequestCount] = useState(0);
  const requestTimestamps = useRef([]);

  function incrementApiCount() {
    const now = Date.now();
    requestTimestamps.current = requestTimestamps.current.filter(
      (t) => now - t < RATE_WINDOW_MS
    );
    requestTimestamps.current.push(now);
    setApiRequestCount(requestTimestamps.current.length);
  }

  // Auto-decrement counter every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      requestTimestamps.current = requestTimestamps.current.filter(
        (t) => now - t < RATE_WINDOW_MS
      );
      setApiRequestCount(requestTimestamps.current.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const rateLimitReached = apiRequestCount >= RATE_LIMIT;

  const refreshGrid = useCallback(
    (lat, lng, hour) => {
      if (rateLimitReached) {
        console.warn('[EmergeX] Rate limit reached — request blocked');
        return;
      }
      const newCenter = { lat: lat ?? center.lat, lng: lng ?? center.lng };
      setCenter(newCenter);
      setRiskGrid(generateRiskGrid(newCenter.lat, newCenter.lng, 20, 0.5, hour));
      incrementApiCount();
    },
    [center, rateLimitReached]
  );

  return (
    <SafetyContext.Provider
      value={{
        center,
        setCenter,
        riskGrid,
        refreshGrid,
        privacyConsent,
        setPrivacyConsent,
        emergencyMode,
        setEmergencyMode,
        apiRequestCount,
        rateLimit: RATE_LIMIT,
        rateLimitReached,
        incrementApiCount,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafety() {
  const ctx = useContext(SafetyContext);
  if (!ctx) throw new Error('useSafety must be used within SafetyProvider');
  return ctx;
}
