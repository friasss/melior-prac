import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiFetch, fetchMyInquiries, fetchMyProperties, type MyInquiry } from '../services/api';
import type { Property } from '../data/properties';
import ImageCropModal from '../components/ImageCropModal';

// ─── Sección activa ───────────────────────────────────────────────────────────
type Section = 'info' | 'password' | 'account' | 'inquiries' | 'properties' | 'theme';

const ProfilePage = () => {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [section, setSection] = useState<Section>('info');

  // ── Info personal ──
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName,  setLastName]  = useState(user?.lastName  ?? '');
  const [phone,     setPhone]     = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg,     setInfoMsg]     = useState('');
  const [infoError,   setInfoError]   = useState('');

  // ── Contraseña ──
  const [currentPwd,  setCurrentPwd]  = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [pwdLoading,  setPwdLoading]  = useState(false);
  const [pwdMsg,      setPwdMsg]      = useState('');
  const [pwdError,    setPwdError]    = useState('');

  // ── Mis Consultas ──
  const [inquiries, setInquiries]               = useState<MyInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);

  // ── Mis Propiedades ──
  const [myProps, setMyProps]               = useState<Property[]>([]);
  const [myPropsLoading, setMyPropsLoading] = useState(false);

  // ── Avatar upload ──
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg]             = useState('');
  const [cropSrc, setCropSrc]                 = useState<string | null>(null);

  useEffect(() => {
    if (section === 'inquiries' && inquiries.length === 0) {
      setInquiriesLoading(true);
      fetchMyInquiries().then(setInquiries).catch(() => {}).finally(() => setInquiriesLoading(false));
    }
    if (section === 'properties' && myProps.length === 0) {
      setMyPropsLoading(true);
      fetchMyProperties().then(setMyProps).catch(() => {}).finally(() => setMyPropsLoading(false));
    }
  }, [section]);

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    // reset input so same file can be selected again
    e.target.value = '';
  }

  async function handleCropConfirm(croppedDataUrl: string) {
    setCropSrc(null);
    setAvatarUploading(true);
    setAvatarMsg('');
    try {
      await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: croppedDataUrl }),
      });
      // Update local user state so navbar reflects immediately
      localStorage.setItem('melior_user', JSON.stringify({ ...user, avatarUrl: croppedDataUrl }));
      window.dispatchEvent(new Event('melior_avatar_updated'));
      setAvatarMsg('Foto de perfil actualizada.');
    } catch {
      setAvatarMsg('Error al guardar la foto.');
    } finally {
      setAvatarUploading(false);
    }
  }

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  async function handleUpdateInfo(e: React.SyntheticEvent) {
    e.preventDefault();
    setInfoMsg(''); setInfoError('');
    setInfoLoading(true);
    try {
      await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ firstName, lastName, ...(phone ? { phone } : {}) }),
      });
      setInfoMsg('Perfil actualizado correctamente.');
    } catch (err: unknown) {
      setInfoError(err instanceof Error ? err.message : 'Error al actualizar.');
    } finally {
      setInfoLoading(false);
    }
  }

  async function handleChangePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    setPwdMsg(''); setPwdError('');
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas nuevas no coinciden.'); return; }
    if (newPwd.length < 8)     { setPwdError('La contraseña debe tener al menos 8 caracteres.'); return; }
    setPwdLoading(true);
    try {
      await apiFetch('/api/auth/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd, confirmNewPassword: confirmPwd }),
      });
      setPwdMsg('Contraseña actualizada. Inicia sesión nuevamente.');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => { logout(); navigate('/login'); }, 2000);
    } catch (err: unknown) {
      setPwdError(err instanceof Error ? err.message : 'Error al cambiar contraseña.');
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  // Avatar / initials
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';

  const sideItems = ([
    { id: 'info'       as Section, icon: 'person',          label: 'Información Personal' },
    { id: 'password'   as Section, icon: 'lock',            label: 'Cambiar Contraseña' },
    { id: 'properties' as Section, icon: 'home_work',       label: 'Mis Propiedades', agentOnly: true },
    { id: 'inquiries'  as Section, icon: 'forum',           label: 'Mis Consultas' },
    { id: 'theme'      as Section, icon: 'palette',         label: 'Tema' },
    { id: 'account'    as Section, icon: 'manage_accounts', label: 'Mi Cuenta' },
  ] as { id: Section; icon: string; label: string; agentOnly?: boolean }[])
    .filter(item => !item.agentOnly || user?.role === 'AGENT' || user?.role === 'ADMIN');

  return (
    <>
    <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Mi Perfil</h1>
        <p className="section-subtitle mt-1">Gestiona tu información personal y configuración</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* ── Sidebar ── */}
        <div className="space-y-3 lg:col-span-1">
          {/* Avatar card */}
          <div className="card p-6 text-center">
            <div className="relative mx-auto h-20 w-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-2xl font-bold text-white ring-4 ring-brand-100 dark:ring-brand-900 overflow-hidden">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  : initials
                }
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-md transition-colors hover:bg-brand-700">
                {avatarUploading
                  ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <span className="material-symbols-outlined text-sm">photo_camera</span>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            {avatarMsg && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{avatarMsg}</p>}
            <p className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              user?.role === 'ADMIN'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : user?.role === 'AGENT'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                : 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
            }`}>
              {user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'AGENT' ? 'Agente' : 'Cliente'}
            </span>
          </div>

          {/* Nav items */}
          <nav className="card overflow-hidden p-1.5">
            {sideItems.map((item) => (
              <button key={item.id} onClick={() => setSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  section === item.id
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {item.label}
              </button>
            ))}

            <hr className="my-1.5 border-slate-100 dark:border-slate-800" />

            <Link to="/favoritos"
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              Mis Favoritos
            </Link>

            <button onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Cerrar Sesión
            </button>
          </nav>
        </div>

        {/* ── Main content ── */}
        <div className="lg:col-span-3">

          {/* ── Información Personal ── */}
          {section === 'info' && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <span className="material-symbols-outlined text-xl">person</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Información Personal</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Actualiza tus datos de contacto</p>
                </div>
              </div>

              {infoMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {infoMsg}
                </div>
              )}
              {infoError && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{infoError}</div>
              )}

              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="input-field" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                  <input type="email" value={user?.email} disabled className="input-field opacity-60 cursor-not-allowed" />
                  <p className="mt-1 text-xs text-slate-400">El correo no se puede cambiar.</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="809-000-0000" className="input-field" />
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={infoLoading} className="btn-primary disabled:opacity-60">
                    {infoLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Guardando...
                      </span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">save</span>
                        Guardar cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Cambiar Contraseña ── */}
          {section === 'password' && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Cambiar Contraseña</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Usa una contraseña segura de al menos 8 caracteres</p>
                </div>
              </div>

              {pwdMsg && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {pwdMsg}
                </div>
              )}
              {pwdError && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{pwdError}</div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña actual</label>
                  <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} required placeholder="••••••••" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nueva contraseña</label>
                  <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required placeholder="••••••••" minLength={8} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar nueva contraseña</label>
                  <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required placeholder="••••••••" className="input-field" />
                </div>

                <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <p className="font-medium">Requisitos de contraseña:</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos un número</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={pwdLoading} className="btn-primary disabled:opacity-60">
                    {pwdLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Actualizando...
                      </span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-lg">lock_reset</span>
                        Actualizar contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Mis Propiedades ── */}
          {section === 'properties' && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                    <span className="material-symbols-outlined text-xl">home_work</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Mis Propiedades</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Listings que has publicado</p>
                  </div>
                </div>
                <Link to="/publicar" className="btn-primary text-sm">
                  <span className="material-symbols-outlined text-base">add</span>
                  Nueva
                </Link>
              </div>

              {myPropsLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              ) : myProps.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">home_work</span>
                  <p className="font-medium text-slate-500 dark:text-slate-400">No tienes propiedades publicadas todavía.</p>
                  <Link to="/publicar" className="btn-primary text-sm">Publicar propiedad</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myProps.map(prop => (
                    <div key={prop.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                      <div className="h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {prop.image
                          ? <img src={prop.image} alt="" className="h-full w-full object-cover" />
                          : <div className="flex h-full items-center justify-center"><span className="material-symbols-outlined text-slate-300">home</span></div>
                        }
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-sm text-slate-900 dark:text-white">{prop.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{prop.location}</p>
                        <p className="mt-0.5 text-sm font-bold text-brand-600 dark:text-brand-400">
                          {prop.currency} {prop.price.toLocaleString()}
                          {prop.status === 'rent' && <span className="text-xs font-normal">/mes</span>}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Link to={`/editar/${prop.id}`}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Editar
                        </Link>
                        <Link to={`/propiedad/${prop.id}`}
                          className="flex items-center gap-1 rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50 dark:border-brand-800 dark:text-brand-400">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                          Ver
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Mis Consultas ── */}
          {section === 'inquiries' && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <span className="material-symbols-outlined text-xl">forum</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Mis Consultas</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Mensajes que has enviado a través de Melior</p>
                </div>
              </div>

              {inquiriesLoading ? (
                <div className="flex justify-center py-12">
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              ) : inquiries.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">forum</span>
                  <p className="font-medium text-slate-500 dark:text-slate-400">No has enviado ninguna consulta todavía.</p>
                  <Link to="/contacto" className="btn-primary text-sm">Enviar consulta</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => {
                    const statusColor: Record<string, string> = {
                      NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                      IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
                      RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                      CLOSED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                    };
                    const statusLabel: Record<string, string> = {
                      NEW: 'Nueva', IN_PROGRESS: 'En proceso', RESOLVED: 'Resuelta', CLOSED: 'Cerrada',
                    };
                    return (
                      <div key={inq.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            {inq.subject && (
                              <p className="font-semibold text-slate-900 dark:text-white text-sm">{inq.subject}</p>
                            )}
                            {inq.property && (
                              <Link to={`/propiedad/${inq.property.id}`} className="text-xs text-brand-600 hover:underline dark:text-brand-400">
                                <span className="material-symbols-outlined text-xs align-middle mr-0.5">home</span>
                                {inq.property.title}
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[inq.status] ?? statusColor.NEW}`}>
                              {statusLabel[inq.status] ?? inq.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(inq.createdAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{inq.message}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Mi Cuenta ── */}
          {section === 'account' && (
            <div className="space-y-4">
              {/* Info de cuenta */}
              <div className="card p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                    <span className="material-symbols-outlined text-xl">manage_accounts</span>
                  </div>
                  <div>
                    <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Mi Cuenta</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Detalles y estado de tu cuenta</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'ID de usuario', value: user?.id ?? '-', icon: 'badge' },
                    { label: 'Correo electrónico', value: user?.email ?? '-', icon: 'mail' },
                    { label: 'Tipo de cuenta', value: user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'AGENT' ? 'Agente Inmobiliario' : 'Cliente', icon: 'verified_user' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                      <span className="material-symbols-outlined text-[18px] text-slate-400">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="card p-6">
                <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white mb-4">Acciones rápidas</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link to="/favoritos" className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-[18px] text-red-400">favorite</span>
                    Ver mis favoritos
                  </Link>
                  <Link to="/propiedades" className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-[18px] text-brand-400">search</span>
                    Buscar propiedades
                  </Link>
                  <Link to="/contacto" className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">support_agent</span>
                    Contactar soporte
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Tema ── */}
          {section === 'theme' && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Tema de la aplicación</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Elige cómo se ve Melior</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {([
                  { value: 'light',  icon: 'light_mode',   label: 'Claro',     desc: 'Fondo blanco' },
                  { value: 'dark',   icon: 'dark_mode',    label: 'Oscuro',    desc: 'Fondo negro' },
                  { value: 'system', icon: 'brightness_auto', label: 'Sistema', desc: 'Según tu dispositivo' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all ${
                      theme === opt.value
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-3xl ${
                      theme === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${
                        theme === opt.value ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300'
                      }`}>{opt.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                    {theme === opt.value && (
                      <span className="material-symbols-outlined text-base text-brand-600 dark:text-brand-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    )}
                  </button>
                ))}
              </div>

              {user?.role === 'ADMIN' && (
                <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
                  El panel de administración siempre se muestra en modo oscuro, independientemente de esta configuración.
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>

    {/* Avatar crop modal */}
    {cropSrc && (
      <ImageCropModal
        src={cropSrc}
        shape="circle"
        outputSize={400}
        onConfirm={handleCropConfirm}
        onClose={() => setCropSrc(null)}
      />
    )}
    </>
  );
};

export default ProfilePage;
