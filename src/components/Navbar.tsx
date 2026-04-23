import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/guia-de-compra', label: 'Guía de Compra' },
  { to: '/contacto', label: 'Contacto' },
];

const Navbar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    navigate('/');
  }

  // User avatar: photo or initials
  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  const roleConfig = {
    AGENT: { label: 'Agente', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300', ring: 'ring-amber-300 dark:ring-amber-700' },
    ADMIN: { label: 'Admin',  bg: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',         ring: 'ring-red-300 dark:ring-red-700' },
    CLIENT:{ label: 'Cliente',bg: 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300', ring: 'ring-brand-200 dark:ring-brand-800' },
  };
  const role = (user?.role ?? 'CLIENT') as keyof typeof roleConfig;
  const rc = roleConfig[role] ?? roleConfig.CLIENT;

  const Avatar = ({ size = 'sm' }: { size?: 'sm' | 'lg' }) => {
    const cls = size === 'lg' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs';
    const avatarBg = role === 'AGENT' ? 'bg-amber-500' : role === 'ADMIN' ? 'bg-red-500' : 'bg-brand-600';

    return user?.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.firstName} className={`${cls} rounded-full object-cover ring-2 ${rc.ring}`} />
    ) : (
      <div className={`${cls} flex items-center justify-center rounded-full ${avatarBg} font-bold text-white ring-2 ${rc.ring}`}>
        {initials}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-surface-dark/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>villa</span>
            </div>
            <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">Melior</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user?.role === 'ADMIN' && (
              <Link to="/admin"
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950'
                }`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/favoritos" className="btn-ghost hidden sm:flex">
              <span className="material-symbols-outlined text-xl">favorite</span>
            </Link>

            {isAuthenticated && (user?.role === 'AGENT' || user?.role === 'ADMIN') && (
              <Link to="/publicar" className="btn-primary hidden text-sm sm:flex gap-1.5">
                <span className="material-symbols-outlined text-base">add_home</span>
                Publicar
              </Link>
            )}
            {isAuthenticated && user?.role === 'CLIENT' && (
              <Link to="/publicar" className="hidden sm:flex items-center gap-1.5 rounded-xl border border-brand-300 bg-brand-50 px-3.5 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-950 dark:text-brand-300 dark:hover:bg-brand-900">
                <span className="material-symbols-outlined text-base">add_home</span>
                Publicar
              </Link>
            )}

            {isAuthenticated ? (
              /* ── Avatar + Dropdown ── */
              <div className="relative hidden sm:block" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Avatar />
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                      {user?.firstName}
                    </span>
                    <span className={`mt-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold ${rc.bg}`}>
                      {rc.label}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-slate-400 transition-transform duration-200"
                    style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-card-dark">
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                      <Avatar size="lg" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                        <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${rc.bg}`}>
                          {role === 'AGENT' && <span className="material-symbols-outlined text-[12px]">home_work</span>}
                          {role === 'ADMIN' && <span className="material-symbols-outlined text-[12px]">admin_panel_settings</span>}
                          {role === 'CLIENT' && <span className="material-symbols-outlined text-[12px]">person</span>}
                          {rc.label}
                        </span>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <Link to="/perfil" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                        Mi Perfil
                      </Link>
                      <Link to="/favoritos" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">favorite</span>
                        Mis Favoritos
                      </Link>
                      <Link to="/propiedades" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                        Buscar Propiedades
                      </Link>
                      {(user?.role === 'AGENT' || user?.role === 'ADMIN' || user?.role === 'CLIENT') && (
                        <Link to="/publicar" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-600 transition-colors hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950">
                          <span className="material-symbols-outlined text-[18px]">add_home</span>
                          {user?.role === 'CLIENT' ? 'Publicar Propiedad →' : 'Publicar Propiedad'}
                        </Link>
                      )}
                      {user?.role === 'ADMIN' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                          Panel Admin
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 py-1.5 dark:border-slate-700">
                      <button onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950">
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary hidden text-sm sm:flex">
                Iniciar Sesión
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden dark:border-slate-800 dark:bg-surface-dark">
            {/* User info mobile */}
            {isAuthenticated && (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 mb-3 dark:bg-slate-800">
                <Avatar size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <hr className="my-2 border-slate-100 dark:border-slate-800" />

              {isAuthenticated ? (
                <>
                  <Link to="/perfil" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    Mi Perfil
                  </Link>
                  {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
                    <Link to="/publicar" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950">
                      <span className="material-symbols-outlined text-[18px]">add_home</span>
                      Publicar Propiedad
                    </Link>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950">
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
                      Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950">
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary justify-center text-sm">
                  Iniciar Sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
