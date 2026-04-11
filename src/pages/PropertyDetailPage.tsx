import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/properties';
import type { Property } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import { fetchPropertyById, fetchSimilarProperties, submitInquiry, toggleFavorite, checkIsFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty]   = useState<Property | null>(null);
  const [similar, setSimilar]     = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  // Favorites
  const [isFav, setIsFav]             = useState(false);
  const [favLoading, setFavLoading]   = useState(false);

  // Visit form
  const [visitName, setVisitName]     = useState('');
  const [visitEmail, setVisitEmail]   = useState('');
  const [visitPhone, setVisitPhone]   = useState('');
  const [visitMsg, setVisitMsg]       = useState('');
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitSent, setVisitSent]     = useState(false);
  const [visitError, setVisitError]   = useState('');

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setCurrentImage(0);

    Promise.all([
      fetchPropertyById(id),
      fetchSimilarProperties(id),
      isAuthenticated ? checkIsFavorite(id) : Promise.resolve(false),
    ]).then(([prop, sim, fav]) => {
      setProperty(prop);
      setSimilar(sim);
      setIsFav(fav);
    }).finally(() => setIsLoading(false));
  }, [id, isAuthenticated]);

  async function handleToggleFav() {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!id) return;
    setFavLoading(true);
    try {
      const result = await toggleFavorite(id);
      setIsFav(result);
    } catch {
      // ignore
    } finally {
      setFavLoading(false);
    }
  }

  async function handleVisitSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!id || !property) return;
    setVisitLoading(true);
    setVisitError('');
    try {
      await submitInquiry({
        firstName: visitName.split(' ')[0] || visitName,
        lastName:  visitName.split(' ').slice(1).join(' ') || '-',
        email:     visitEmail,
        phone:     visitPhone,
        message:   visitMsg || `Me interesa agendar una visita para: ${property.title}`,
        subject:   'Comprar una propiedad',
        propertyId: id,
      });
      setVisitSent(true);
      setVisitName(''); setVisitEmail(''); setVisitPhone(''); setVisitMsg('');
    } catch (err: unknown) {
      setVisitError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.');
    } finally {
      setVisitLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[16/10] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-3">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">house</span>
        <h2 className="mt-4 font-heading text-xl font-bold text-slate-700 dark:text-slate-300">Propiedad no encontrada</h2>
        <Link to="/propiedades" className="btn-primary mt-6">Ver propiedades</Link>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-0">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-brand-600">Inicio</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/propiedades" className="hover:text-brand-600">Propiedades</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-300">{property.title}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left — Image + Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="overflow-hidden rounded-2xl">
              <div className="relative aspect-[16/10]">
                <img src={property.images[currentImage] || property.image} alt={property.title} className="h-full w-full object-cover" />
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white">
                  {currentImage + 1} / {property.images.length}
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="badge bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm">{property.type}</span>
                  <span className={`badge shadow-sm backdrop-blur-sm ${property.status === 'rent' ? 'bg-emerald-500/90 text-white' : 'bg-brand-600/90 text-white'}`}>
                    {property.status === 'rent' ? 'Alquiler' : 'Venta'}
                  </span>
                </div>
              </div>
              {property.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {property.images.map((img, i) => (
                    <button key={i} onClick={() => setCurrentImage(i)} className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all ${currentImage === i ? 'ring-2 ring-brand-500 ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + Price */}
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="material-symbols-outlined text-[16px]">location_on</span>
                {property.location}
              </div>
              <h1 className="mt-1 font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{property.title}</h1>
              <p className="mt-2 font-heading text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {formatPrice(property.price, property.currency, property.status)}
              </p>
            </div>

            {/* Specs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {[
                { icon: 'bed',        label: `${property.beds} Habitaciones` },
                { icon: 'shower',     label: `${property.baths} Baños` },
                { icon: 'straighten', label: `${property.size} m²` },
              ].map((spec) => (
                <div key={spec.icon} className="card flex shrink-0 items-center gap-2 px-4 py-3">
                  <span className="material-symbols-outlined text-slate-500 text-lg">{spec.icon}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{spec.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">Sobre esta propiedad</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{property.description}</p>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Agent card */}
            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Agente asignado</p>
              <div className="mt-4 flex items-center gap-4">
                <img src={property.agent.image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} alt={property.agent.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-900" />
                <div>
                  <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">{property.agent.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{property.agent.company}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {property.agent.phone && (
                  <a href={`tel:${property.agent.phone}`} className="btn-primary w-full justify-center">
                    <span className="material-symbols-outlined text-lg">call</span>
                    Llamar ahora
                  </a>
                )}
                <button
                  onClick={handleToggleFav}
                  disabled={favLoading}
                  className={`btn-ghost w-full justify-center disabled:opacity-60 transition-colors ${isFav ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950' : 'text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'}`}
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                  {isFav ? 'Guardado en favoritos' : 'Guardar en favoritos'}
                </button>
              </div>
            </div>

            {/* Schedule visit */}
            <div className="card p-6">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">Agendar visita</h3>

              {visitSent ? (
                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-4 text-center dark:bg-emerald-950">
                  <span className="material-symbols-outlined text-3xl text-emerald-500" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="mt-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">¡Solicitud enviada!</p>
                  <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Te contactaremos pronto.</p>
                  <button onClick={() => setVisitSent(false)} className="mt-3 text-xs text-emerald-600 underline dark:text-emerald-400">Enviar otra solicitud</button>
                </div>
              ) : (
                <form className="mt-4 space-y-3" onSubmit={handleVisitSubmit}>
                  {visitError && (
                    <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">{visitError}</div>
                  )}
                  <input type="text" value={visitName} onChange={(e) => setVisitName(e.target.value)} placeholder="Tu nombre completo" required className="input-field" />
                  <input type="email" value={visitEmail} onChange={(e) => setVisitEmail(e.target.value)} placeholder="Tu correo" required className="input-field" />
                  <input type="tel" value={visitPhone} onChange={(e) => setVisitPhone(e.target.value)} placeholder="Tu teléfono" className="input-field" />
                  <textarea value={visitMsg} onChange={(e) => setVisitMsg(e.target.value)} placeholder="Me interesa esta propiedad..." rows={3} className="input-field resize-none" />
                  <button type="submit" disabled={visitLoading} className="btn-primary w-full justify-center disabled:opacity-60">
                    {visitLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Enviando...
                      </span>
                    ) : 'Solicitar visita'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="section-title">Propiedades similares</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default PropertyDetailPage;
