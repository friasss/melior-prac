import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-4 text-center dark:bg-surface-dark">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-50 dark:bg-brand-950">
        <span className="material-symbols-outlined text-5xl text-brand-500" style={{ fontVariationSettings: "'FILL' 1" }}>home_search</span>
      </div>
      <p className="text-6xl font-extrabold text-brand-600 dark:text-brand-400">404</p>
      <h1 className="mt-3 font-heading text-2xl font-bold text-slate-900 dark:text-white">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        La página que buscas no existe o fue movida. Quizás puedes encontrar lo que necesitas desde el inicio.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Volver atrás
        </button>
        <Link to="/" className="btn-primary">
          <span className="material-symbols-outlined text-base">home</span>
          Ir al inicio
        </Link>
        <Link to="/propiedades" className="btn-ghost">
          <span className="material-symbols-outlined text-base">search</span>
          Ver propiedades
        </Link>
      </div>
    </div>
  );
}
