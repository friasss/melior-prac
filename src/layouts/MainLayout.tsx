import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';
import { usePageTracking } from '../hooks/usePageTracking';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

const MainLayout = () => {
  usePageTracking();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const showBanner = !!user && !user.emailVerified && !dismissed;

  async function handleResend() {
    setResending(true);
    try {
      await apiFetch('/api/auth/resend-verification', { method: 'POST' });
      setResent(true);
    } catch { /* ignore */ }
    finally { setResending(false); }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Email verification banner */}
      {showBanner && (
        <div className="relative bg-amber-50 border-b border-amber-200 dark:bg-amber-950/40 dark:border-amber-800">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2.5 text-sm text-amber-800 dark:text-amber-300">
              <span className="material-symbols-outlined text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              {resent
                ? <span>✅ Correo enviado — revisa tu bandeja de entrada.</span>
                : <span>Verifica tu correo electrónico para activar tu cuenta.</span>
              }
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!resent && (
                <button onClick={handleResend} disabled={resending}
                  className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60 transition-colors">
                  {resending ? 'Enviando…' : 'Reenviar'}
                </button>
              )}
              <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-800 dark:text-amber-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;
