import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Status = 'loading' | 'success' | 'error' | 'resending' | 'resent';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (params.get('success') === 'true') {
      setStatus('success');
      return;
    }
    const err = params.get('error');
    if (err) {
      setStatus('error');
      setMessage(decodeURIComponent(err));
      return;
    }
    // If no params, just show a "check your email" info screen
    setStatus('error');
    setMessage('');
  }, [params]);

  async function handleResend() {
    setStatus('resending');
    try {
      await apiFetch('/api/auth/resend-verification', { method: 'POST' });
      setStatus('resent');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Error al reenviar');
    }
  }

  if (status === 'loading') return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );

  if (status === 'success') return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 bg-surface-light dark:bg-surface-dark">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
        <span className="material-symbols-outlined text-5xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      </div>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">¡Correo verificado!</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Tu cuenta está activa. Ya puedes explorar todas las propiedades.</p>
      </div>
      <Link to="/" className="btn-primary">Ir al inicio</Link>
    </div>
  );

  if (status === 'resent') return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 bg-surface-light dark:bg-surface-dark">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950">
        <span className="material-symbols-outlined text-5xl text-brand-600" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
      </div>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Correo enviado</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Revisa tu bandeja de entrada y haz clic en el enlace de verificación.</p>
      </div>
      <Link to="/" className="btn-secondary">Volver al inicio</Link>
    </div>
  );

  if (status === 'resending') return (
    <div className="flex min-h-screen items-center justify-center gap-3 flex-col">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <p className="text-sm text-slate-500">Enviando correo…</p>
    </div>
  );

  // error state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 px-4 bg-surface-light dark:bg-surface-dark">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
        <span className="material-symbols-outlined text-5xl text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
          {message ? 'error' : 'mail'}
        </span>
      </div>
      <div className="text-center max-w-sm">
        <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
          {message ? 'Enlace inválido' : 'Verifica tu correo'}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {message || 'Te enviamos un correo con un enlace de verificación. Revisa tu bandeja de entrada.'}
        </p>
      </div>
      {user && !user.emailVerified && (
        <button onClick={handleResend} className="btn-primary">
          <span className="material-symbols-outlined text-base">send</span>
          Reenviar correo de verificación
        </button>
      )}
      <Link to="/" className="btn-ghost text-sm">Volver al inicio</Link>
    </div>
  );
}
