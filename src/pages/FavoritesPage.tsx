import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { fetchFavorites } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Property } from '../data/properties';

const FavoritesPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    fetchFavorites()
      .then(setFavorites)
      .catch(() => setError('No se pudieron cargar los favoritos.'))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  // Still checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
        <h1 className="section-title">Mis Favoritos</h1>
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
            <span className="material-symbols-outlined text-4xl text-brand-400">lock</span>
          </div>
          <h3 className="mt-6 font-heading text-xl font-bold text-slate-700 dark:text-slate-300">Inicia sesión para ver tus favoritos</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Guarda las propiedades que te interesan y accede a ellas desde cualquier dispositivo.
          </p>
          <Link to="/login" className="btn-primary mt-6">
            <span className="material-symbols-outlined text-lg">login</span>
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      <h1 className="section-title">Mis Favoritos</h1>
      <p className="section-subtitle mt-1">Propiedades que has guardado</p>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-6xl text-red-300">wifi_off</span>
          <p className="mt-4 text-sm text-slate-500">{error}</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
            <span className="material-symbols-outlined text-4xl text-red-400">favorite</span>
          </div>
          <h3 className="mt-6 font-heading text-xl font-bold text-slate-700 dark:text-slate-300">Aún no tienes favoritos</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Explora nuestras propiedades y guarda las que más te gusten haciendo clic en el ícono de corazón.
          </p>
          <Link to="/propiedades" className="btn-primary mt-6">
            <span className="material-symbols-outlined text-lg">search</span>
            Explorar propiedades
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
