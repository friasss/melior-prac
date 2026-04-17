import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CompleteProfileModal from '../components/CompleteProfileModal';

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const needsProfile = searchParams.get('needs_profile') === 'true';
    const oauthError = searchParams.get('error');

    if (oauthError || !accessToken || !refreshToken) {
      setError('No se pudo iniciar sesión con el proveedor. Intenta de nuevo.');
      return;
    }

    loginWithOAuth(accessToken, refreshToken)
      .then(({ needsProfileCompletion }) => {
        if (needsProfile || needsProfileCompletion) {
          setShowModal(true);
        } else {
          navigate('/', { replace: true });
        }
      })
      .catch(() => setError('Error al iniciar sesión. Intenta de nuevo.'));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-light dark:bg-surface-dark px-4 text-center">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="text-slate-600 dark:text-slate-300">{error}</p>
        <button onClick={() => navigate('/login', { replace: true })} className="btn-primary">
          Volver al inicio de sesión
        </button>
      </div>
    );
  }

  if (showModal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <CompleteProfileModal onDone={() => navigate('/', { replace: true })} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-light dark:bg-surface-dark">
      <span className="h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Iniciando sesión...</p>
    </div>
  );
};

export default OAuthCallbackPage;
