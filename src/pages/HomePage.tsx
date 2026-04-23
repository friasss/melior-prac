import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { fetchFeaturedProperties, fetchProperties } from '../services/api';
import type { Property } from '../data/properties';
import FoundersSection from '../components/FoundersSection';
import { useAuth } from '../context/AuthContext';

const stats = [
  { value: '500+', label: 'Propiedades' },
  { value: '200+', label: 'Clientes Felices' },
  { value: '15',   label: 'Años de Experiencia' },
  { value: '98%',  label: 'Satisfacción' },
];

const categories = [
  { icon: 'villa',      label: 'Villas',       count: 42,  type: 'Villa',       color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  { icon: 'apartment',  label: 'Apartamentos', count: 128, type: 'Apartamento', color: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400' },
  { icon: 'house',      label: 'Casas',        count: 85,  type: 'Casa',        color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  { icon: 'domain',     label: 'Penthouses',   count: 23,  type: 'Penthouse',   color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400' },
  { icon: 'landscape',  label: 'Terrenos',     count: 56,  type: 'Terreno',     color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
  { icon: 'store',      label: 'Studios',      count: 34,  type: 'Studio',      color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400' },
];

const testimonials = [
  { name: 'María Fernández', role: 'Compradora',  text: 'Melior hizo que el proceso de compra fuera increíblemente sencillo. Encontramos nuestra villa soñada en Cap Cana en tiempo récord.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
  { name: 'Roberto Sánchez', role: 'Inversionista', text: 'Como inversionista, valoro la transparencia y profesionalismo. Melior superó todas mis expectativas con su servicio personalizado.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' },
  { name: 'Lucía Martínez',  role: 'Compradora',  text: 'El equipo de Melior nos guió en cada paso. Su conocimiento del mercado dominicano es incomparable.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
];

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [featured, setFeatured]   = useState<Property[]>([]);
  const [latest, setLatest]       = useState<Property[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLatest, setLoadingLatest]     = useState(true);

  useEffect(() => {
    fetchFeaturedProperties(4)
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));

    fetchProperties({ limit: 6 })
      .then((res) => setLatest(res.data))
      .catch(() => setLatest([]))
      .finally(() => setLoadingLatest(false));
  }, []);

  return (
    <div className="pb-16 sm:pb-0">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">🏝️ República Dominicana</span>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Encuentra tu{' '}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">hogar ideal</span>{' '}
              en el Caribe
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300 sm:text-xl">
              Descubre propiedades exclusivas en las mejores ubicaciones de la República Dominicana. Villas frente al mar, penthouses de lujo y mucho más.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input
                  type="text"
                  placeholder="Buscar por ciudad, zona o tipo..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      window.location.href = `/propiedades${val ? `?search=${encodeURIComponent(val)}` : ''}`;
                    }
                  }}
                  className="w-full rounded-xl border-0 bg-white/10 py-4 pl-12 pr-4 text-white backdrop-blur-md placeholder:text-slate-400 outline-none ring-1 ring-white/20 transition-all focus:bg-white/15 focus:ring-brand-400"
                />
              </div>
              <Link to="/propiedades" className="btn-primary whitespace-nowrap py-4 text-base shadow-2xl shadow-brand-600/30">
                <span className="material-symbols-outlined text-xl">search</span>
                Explorar
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Cap Cana', 'Punta Cana', 'Santo Domingo', 'Samaná'].map((loc) => (
                <Link key={loc} to={`/propiedades?city=${encodeURIComponent(loc)}`} className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/25">
                  {loc}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ STATS ═══════════════════════ */}
      <section className="relative -mt-8 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="card flex flex-col items-center py-5 px-4 text-center">
              <span className="font-heading text-2xl font-extrabold text-brand-600 dark:text-brand-400 sm:text-3xl">{stat.value}</span>
              <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ AGENT CTA (CLIENT only) ═══════════════════════ */}
      {isAuthenticated && user?.role === 'CLIENT' && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 px-6 py-8 sm:px-10 sm:py-10">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200")', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-200">Para propietarios</p>
                <h3 className="mt-1 font-heading text-2xl font-extrabold text-white sm:text-3xl">¿Tienes una propiedad para vender o alquilar?</h3>
                <p className="mt-2 max-w-lg text-sm text-brand-100">Conviértete en agente Melior y publica tu propiedad para llegar a miles de compradores en República Dominicana.</p>
              </div>
              <Link to="/publicar" className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl whitespace-nowrap">
                <span className="material-symbols-outlined text-xl">add_home</span>
                Publicar propiedad
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════ FEATURED ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Propiedades Destacadas</h2>
            <p className="section-subtitle mt-1">Selección exclusiva de nuestros expertos</p>
          </div>
          <Link to="/propiedades" className="btn-ghost hidden sm:flex">
            Ver todas <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        {loadingFeatured ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => <div key={i} className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />)}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {featured.map((p) => <PropertyCard key={p.id} property={p} variant="featured" />)}
          </div>
        )}
      </section>

      {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-title">Explora por Categoría</h2>
          <p className="section-subtitle mt-1">Encuentra exactamente lo que buscas</p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link key={cat.label} to={`/propiedades?propertyType=${encodeURIComponent(cat.type)}`} className="card group flex flex-col items-center gap-3 p-5 text-center transition-all hover:shadow-lg hover:-translate-y-1">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${cat.color} transition-transform group-hover:scale-110`}>
                <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.label}</p>
                <p className="text-xs text-slate-400">{cat.count} propiedades</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ LATEST PROPERTIES ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Propiedades Recientes</h2>
            <p className="section-subtitle mt-1">Lo último en nuestro portafolio</p>
          </div>
          <Link to="/propiedades" className="btn-ghost hidden sm:flex">
            Ver todas <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        {loadingLatest ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />)}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/propiedades" className="btn-secondary">
            Ver todas las propiedades <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════ TESTIMONIALS ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-title">Lo que dicen nuestros clientes</h2>
          <p className="section-subtitle mt-1">Historias reales de compradores satisfechos</p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500 opacity-40" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-700 opacity-40" />
          <div className="relative">
            <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">¿Listo para encontrar tu próximo hogar?</h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">Nuestros asesores inmobiliarios te guiarán en cada paso del proceso. Contacta con nosotros hoy.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/propiedades" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-xl transition-all hover:bg-brand-50 active:scale-[0.97]">
                <span className="material-symbols-outlined text-lg">search</span>
                Explorar Propiedades
              </Link>
              <Link to="/contacto" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97]">
                <span className="material-symbols-outlined text-lg">call</span>
                Contactar Asesor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FoundersSection />
    </div>
  );
};

export default HomePage;
