import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-white pb-24 sm:pb-0 dark:border-slate-800 dark:bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>villa</span>
              </div>
              <span className="font-heading text-lg font-bold text-slate-900 dark:text-white">Melior</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Tu socio de confianza en bienes raíces en la República Dominicana.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Explorar</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/propiedades" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Propiedades</Link></li>
              <li><Link to="/propiedades?status=sale" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">En Venta</Link></li>
              <li><Link to="/propiedades?status=rent" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">En Alquiler</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Recursos</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/guia-de-compra" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Guía de Compra</Link></li>
              <li><Link to="/contacto" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Términos</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Privacidad</a></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-slate-100 dark:border-slate-800" />

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Melior. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
