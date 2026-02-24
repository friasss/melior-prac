import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  // In a real app, this would come from a context/store
  const favorites: string[] = [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      <h1 className="section-title">Mis Favoritos</h1>
      <p className="section-subtitle mt-1">Propiedades que has guardado</p>

      {favorites.length === 0 ? (
        <div className="mt-20 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
            <span className="material-symbols-outlined text-4xl text-red-400">favorite</span>
          </div>
          <h3 className="mt-6 font-heading text-xl font-bold text-slate-700 dark:text-slate-300">
            Aún no tienes favoritos
          </h3>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Explora nuestras propiedades y guarda las que más te gusten haciendo clic en el ícono de corazón.
          </p>
          <Link to="/propiedades" className="btn-primary mt-6">
            <span className="material-symbols-outlined text-lg">search</span>
            Explorar propiedades
          </Link>
        </div>
      ) : null}
    </div>
  );
};

export default FavoritesPage;
