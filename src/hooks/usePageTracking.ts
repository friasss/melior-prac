import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // Fire and forget — don't block anything if this fails
    fetch(`${BASE_URL}/api/analytics/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: location.pathname }),
    }).catch(() => {});
  }, [location.pathname]);
}
