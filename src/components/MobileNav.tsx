import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', icon: 'home', label: 'Inicio' },
  { to: '/propiedades', icon: 'search', label: 'Buscar' },
  { to: '/favoritos', icon: 'favorite', label: 'Favoritos' },
  { to: '/guia-de-compra', icon: 'menu_book', label: 'Guía' },
  { to: '/login', icon: 'person', label: 'Perfil' },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-100 bg-white/90 backdrop-blur-xl sm:hidden dark:border-slate-800 dark:bg-surface-dark/90"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 transition-colors ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;
