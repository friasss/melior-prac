import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { fetchProperties } from '../services/api';
import { propertyTypes } from '../data/properties';
import type { Property } from '../data/properties';

const PropertiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize filters from URL params
  const [search, setSearch]       = useState(searchParams.get('search') ?? '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'SALE' | 'RENT'>(
    (searchParams.get('status') as 'SALE' | 'RENT') ?? 'all'
  );
  const [typeFilter, setTypeFilter] = useState(searchParams.get('propertyType') ?? 'all');

  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal]           = useState(0);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');

  // Debounced search ref
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadProperties = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetchProperties({
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        propertyType: typeFilter !== 'all' ? typeFilter : undefined,
        limit: 50,
      });
      setProperties(res.data);
      setTotal(res.meta.total);
    } catch {
      setError('No se pudieron cargar las propiedades.');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, typeFilter]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  // Keep URL params in sync
  useEffect(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (typeFilter !== 'all') params.propertyType = typeFilter;
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, statusFilter, typeFilter, setSearchParams]);

  function clearFilters() {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="section-title">Propiedades</h1>
        <p className="section-subtitle mt-1">
          {isLoading ? 'Cargando...' : `${total} propiedad${total !== 1 ? 'es' : ''} disponible${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search and filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-grow sm:max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ciudad, zona, tipo..."
            className="input-field pl-11"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'SALE', 'RENT'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 dark:bg-card-dark dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {s === 'all' ? 'Todas' : s === 'SALE' ? 'En Venta' : 'Alquiler'}
            </button>
          ))}

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field w-auto py-2.5 pr-8 text-sm"
          >
            <option value="all">Todos los tipos</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card h-72 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-6xl text-red-300">wifi_off</span>
          <h3 className="mt-4 font-heading text-lg font-bold text-slate-700 dark:text-slate-300">Error al cargar propiedades</h3>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button onClick={loadProperties} className="btn-primary mt-4">Reintentar</button>
        </div>
      ) : properties.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">search_off</span>
          <h3 className="mt-4 font-heading text-lg font-bold text-slate-700 dark:text-slate-300">No se encontraron propiedades</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Intenta ajustar los filtros o el término de búsqueda.</p>
          <button onClick={clearFilters} className="btn-secondary mt-4">Limpiar filtros</button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
