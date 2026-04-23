import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset, resetPasswordWithCode } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const PWD_RULES = [
  { label: '8+ caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Un número',     test: (p: string) => /[0-9]/.test(p) },
];

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isLogin, setIsLogin] = useState(searchParams.get('tab') !== 'register');
  const oauthError = searchParams.get('error');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [role, setRole]           = useState<'CLIENT' | 'AGENT'>('CLIENT');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Forgot password flow: 'off' | 'email' | 'code'
  const [fpStep, setFpStep]           = useState<'off' | 'email' | 'code'>('off');
  const [fpEmail, setFpEmail]         = useState('');
  const [fpCode, setFpCode]           = useState('');
  const [fpNew, setFpNew]             = useState('');
  const [fpConfirm, setFpConfirm]     = useState('');
  const [fpShowNew, setFpShowNew]     = useState(false);
  const [fpLoading, setFpLoading]     = useState(false);
  const [fpError, setFpError]         = useState('');
  const [fpSuccess, setFpSuccess]     = useState(false);
  const [fpResendCooldown, setFpResendCooldown] = useState(0);

  useEffect(() => {
    if (fpResendCooldown <= 0) return;
    const t = setTimeout(() => setFpResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [fpResendCooldown]);

  function resetFields() {
    setRole('CLIENT');
    setFirstName(''); setLastName(''); setPhone('');
    setEmail(''); setPassword(''); setConfirmPassword('');
    setError('');
  }

  async function handleFpRequestCode(e: React.SyntheticEvent) {
    e.preventDefault();
    setFpError('');
    setFpLoading(true);
    try {
      await requestPasswordReset(fpEmail);
      setFpStep('code');
      setFpResendCooldown(30);
    } catch (err: unknown) {
      setFpError(err instanceof Error ? err.message : 'Error al enviar');
    } finally { setFpLoading(false); }
  }

  async function handleFpResend() {
    setFpError('');
    setFpLoading(true);
    try {
      await requestPasswordReset(fpEmail);
      setFpResendCooldown(30);
    } catch (err: unknown) {
      setFpError(err instanceof Error ? err.message : 'Error al reenviar');
    } finally { setFpLoading(false); }
  }

  async function handleFpReset(e: React.SyntheticEvent) {
    e.preventDefault();
    setFpError('');
    if (!PWD_RULES.every(r => r.test(fpNew))) { setFpError('La contraseña no cumple los requisitos.'); return; }
    if (fpNew !== fpConfirm) { setFpError('Las contraseñas no coinciden.'); return; }
    if (fpCode.length !== 6) { setFpError('El código debe tener 6 dígitos.'); return; }
    setFpLoading(true);
    try {
      await resetPasswordWithCode(fpEmail, fpCode, fpNew);
      setFpSuccess(true);
    } catch (err: unknown) {
      setFpError(err instanceof Error ? err.message : 'Error al restablecer');
    } finally { setFpLoading(false); }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
      if (!/[A-Z]/.test(password)) { setError('La contraseña debe contener al menos una letra mayúscula.'); return; }
      if (!/[0-9]/.test(password)) { setError('La contraseña debe contener al menos un número.'); return; }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ firstName, lastName, email, phone, password, confirmPassword, role });
      }
      navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-x-hidden bg-surface-light dark:bg-surface-dark">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-light via-surface-light/90 to-surface-light/50 dark:from-surface-dark dark:via-surface-dark/90 dark:to-surface-dark/50" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 p-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>villa</span>
          </div>
          <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">Melior</span>
        </Link>
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-grow flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-6 sm:p-8 shadow-2xl">

            {/* ── FORGOT PASSWORD FLOW ── */}
            {fpStep !== 'off' && (
              <div>
                <button onClick={() => { setFpStep('off'); setFpError(''); setFpCode(''); setFpNew(''); setFpConfirm(''); setFpSuccess(false); }}
                  className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Volver
                </button>

                {fpSuccess ? (
                  <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">¡Contraseña actualizada!</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Ya puedes iniciar sesión con tu nueva contraseña.</p>
                    <button onClick={() => { setFpStep('off'); setFpSuccess(false); }} className="btn-primary w-full justify-center">
                      Iniciar Sesión
                    </button>
                  </div>
                ) : fpStep === 'email' ? (
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Recuperar contraseña</h2>
                    <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">Te enviaremos un código de 6 dígitos a tu correo.</p>
                    {fpError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{fpError}</div>}
                    <form onSubmit={handleFpRequestCode} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                        <input type="email" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required placeholder="tuemail@ejemplo.com" className="input-field" />
                      </div>
                      <button type="submit" disabled={fpLoading} className="btn-primary w-full justify-center py-3 disabled:opacity-60">
                        {fpLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><span className="material-symbols-outlined text-base">send</span>Enviar código</>}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Nuevo acceso</h2>
                    <p className="mt-1 mb-5 text-sm text-slate-500 dark:text-slate-400">Ingresa el código que enviamos a <strong>{fpEmail}</strong> y tu nueva contraseña.</p>
                    {fpError && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{fpError}</div>}
                    <form onSubmit={handleFpReset} className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Código de 6 dígitos</label>
                        <input type="text" inputMode="numeric" maxLength={6} value={fpCode} onChange={e => setFpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000" className="input-field text-center text-2xl font-bold tracking-[0.5em]" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nueva contraseña</label>
                        <div className="relative">
                          <input type={fpShowNew ? 'text' : 'password'} value={fpNew} onChange={e => setFpNew(e.target.value)} required minLength={8} placeholder="••••••••" className="input-field pr-11" />
                          <button type="button" onClick={() => setFpShowNew(!fpShowNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                            <span className="material-symbols-outlined text-xl">{fpShowNew ? 'visibility_off' : 'visibility'}</span>
                          </button>
                        </div>
                        {fpNew.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                            {PWD_RULES.map(({ label, test }) => (
                              <span key={label} className={`flex items-center gap-1 text-xs font-medium ${test(fpNew) ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                                <span className="material-symbols-outlined text-sm">{test(fpNew) ? 'check_circle' : 'radio_button_unchecked'}</span>
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar contraseña</label>
                        <input type="password" value={fpConfirm} onChange={e => setFpConfirm(e.target.value)} required placeholder="••••••••" className="input-field" />
                      </div>
                      <div className="flex gap-3 pt-1">
                        <button type="button" onClick={handleFpResend} disabled={fpResendCooldown > 0 || fpLoading} className="btn-secondary flex-1 justify-center text-sm disabled:opacity-60">
                          {fpResendCooldown > 0 ? `Reenviar (${fpResendCooldown}s)` : 'Reenviar código'}
                        </button>
                        <button type="submit" disabled={fpLoading} className="btn-primary flex-1 justify-center disabled:opacity-60">
                          {fpLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Guardar'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ── NORMAL LOGIN / REGISTER ── */}
            {fpStep === 'off' && <>
            {/* Header */}
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isLogin ? 'Ingresa a tu cuenta para continuar' : 'Únete a la comunidad Melior'}
              </p>
            </div>

            {/* Tab Switch */}
            <div className="mt-6 flex h-11 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => { setIsLogin(true); resetFields(); }}
                className={`flex h-full flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setIsLogin(false); resetFields(); }}
                className={`flex h-full flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Error message */}
            {oauthError && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {oauthError === 'google_failed' ? 'No se pudo iniciar sesión con Google.' : 'No se pudo iniciar sesión con Facebook.'}
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {/* Registration fields */}
              {!isLogin && (
                <>
                  {/* Role selector */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de cuenta</label>
                    <div className="flex h-11 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setRole('CLIENT')}
                        className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all ${
                          role === 'CLIENT'
                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">person</span>
                        Cliente
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('AGENT')}
                        className={`flex h-full flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-all ${
                          role === 'AGENT'
                            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">home_work</span>
                        Agente
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Tu nombre" required className="input-field" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Tu apellido" required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="809-000-0000" className="input-field" />
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tuemail@ejemplo.com" required className="input-field" />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="input-field pr-11 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300" tabIndex={-1}>
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
                {!isLogin && password.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {[
                      { label: '8+ caracteres', ok: password.length >= 8 },
                      { label: 'Una mayúscula', ok: /[A-Z]/.test(password) },
                      { label: 'Un número', ok: /[0-9]/.test(password) },
                    ].map(({ label, ok }) => (
                      <span key={label} className={`flex items-center gap-1 text-xs font-medium ${ok ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        <span className="material-symbols-outlined text-sm">{ok ? 'check_circle' : 'radio_button_unchecked'}</span>
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {!isLogin && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="input-field pr-11 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300" tabIndex={-1}>
                      <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </div>
              )}

              {isLogin && (
                <div className="text-right">
                  <button type="button" onClick={() => { setFpEmail(email); setFpStep('email'); setFpError(''); }}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
                  </span>
                ) : (
                  isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <hr className="flex-grow border-slate-200 dark:border-slate-700" />
              <span className="text-xs font-medium text-slate-400">o continúa con</span>
              <hr className="flex-grow border-slate-200 dark:border-slate-700" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a href={`${API_URL}/api/auth/google`} className="btn-secondary justify-center py-2.5">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </a>
              <a href={`${API_URL}/api/auth/facebook`} className="btn-secondary justify-center py-2.5">
                <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.38 0-1.5.62-1.5 1.44V12h3l-.5 3h-2.5v6.8c4.56-1.03 8-5.06 8-9.8z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </a>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Al continuar, aceptas nuestros{' '}
              <a className="font-medium text-brand-600 hover:underline dark:text-brand-400" href="#">Términos</a>{' '}y{' '}
              <a className="font-medium text-brand-600 hover:underline dark:text-brand-400" href="#">Privacidad</a>.
            </p>
            </>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
