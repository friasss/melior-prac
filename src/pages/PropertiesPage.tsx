import { useState, useMemo } from 'react';
import PropertyCard from '../components/PropertyCard';
import { properties, propertyTypes } from '../data/properties';

const PropertiesPage = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'sale' | 'rent'>('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase()) ||
        p.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesType = typeFilter === 'all' || p.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:pb-8 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="section-title">Propiedades</h1>
        <p className="section-subtitle mt-1">
          {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search and filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          {(['all', 'sale', 'rent'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 dark:bg-card-dark dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {s === 'all' ? 'Todas' : s === 'sale' ? 'En Venta' : 'Alquiler'}
            </button>
          ))}

          {/* Type filter dropdown */}
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
      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">search_off</span>
          <h3 className="mt-4 font-heading text-lg font-bold text-slate-700 dark:text-slate-300">
            No se encontraron propiedades
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Intenta ajustar los filtros o el término de búsqueda.
          </p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); }}
            className="btn-secondary mt-4"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
