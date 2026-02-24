import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { properties, formatPrice } from '../data/properties';
import PropertyCard from '../components/PropertyCard';

const PropertyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const property = properties.find((p) => p.id === id);
  const [currentImage, setCurrentImage] = useState(0);

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <span className="material-symbols-outlined text-6xl text-slate-300">house</span>
        <h2 className="mt-4 font-heading text-xl font-bold text-slate-700 dark:text-slate-300">
          Propiedad no encontrada
        </h2>
        <Link to="/propiedades" className="btn-primary mt-6">
          Ver propiedades
        </Link>
      </div>
    );
  }

  const similar = properties
    .filter((p) => p.id !== property.id && p.type === property.type)
    .slice(0, 3);

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
                <img
                  src={property.images[currentImage]}
                  alt={property.title}
                  className="h-full w-full object-cover"
                />
                {/* Image counter */}
                <div className="absolute bottom-4 right-4 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white">
                  {currentImage + 1} / {property.images.length}
                </div>
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="badge bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm">
                    {property.type}
                  </span>
                  <span className={`badge shadow-sm backdrop-blur-sm ${
                    property.status === 'rent' ? 'bg-emerald-500/90 text-white' : 'bg-brand-600/90 text-white'
                  }`}>
                    {property.status === 'rent' ? 'Alquiler' : 'Venta'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {property.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                        currentImage === i
                          ? 'ring-2 ring-brand-500 ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
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
              <h1 className="mt-1 font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                {property.title}
              </h1>
              <p className="mt-2 font-heading text-3xl font-extrabold text-brand-600 dark:text-brand-400">
                {formatPrice(property.price, property.currency, property.status)}
              </p>
            </div>

            {/* Specs */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {[
                { icon: 'bed', label: `${property.beds} Habitaciones` },
                { icon: 'shower', label: `${property.baths} Baños` },
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
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                Sobre esta propiedad
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {property.description}
              </p>
            </div>
          </div>

          {/* Right sidebar — Agent + Actions */}
          <div className="space-y-6">
            {/* Agent card */}
            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Agente asignado
              </p>
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={property.agent.image}
                  alt={property.agent.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-100 dark:ring-brand-900"
                />
                <div>
                  <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">
                    {property.agent.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {property.agent.company}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="btn-primary w-full justify-center">
                  <span className="material-symbols-outlined text-lg">call</span>
                  Llamar ahora
                </button>
                <button className="btn-secondary w-full justify-center">
                  <span className="material-symbols-outlined text-lg">chat</span>
                  Enviar mensaje
                </button>
                <button className="btn-ghost w-full justify-center text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950">
                  <span className="material-symbols-outlined text-lg">favorite</span>
                  Guardar en favoritos
                </button>
              </div>
            </div>

            {/* Schedule visit */}
            <div className="card p-6">
              <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                Agendar visita
              </h3>
              <div className="mt-4 space-y-3">
                <input type="text" placeholder="Tu nombre" className="input-field" />
                <input type="email" placeholder="Tu correo" className="input-field" />
                <input type="tel" placeholder="Tu teléfono" className="input-field" />
                <textarea
                  placeholder="Me interesa esta propiedad..."
                  rows={3}
                  className="input-field resize-none"
                />
                <button className="btn-primary w-full justify-center">
                  Solicitar visita
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar properties */}
      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="section-title">Propiedades similares</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default PropertyDetailPage;
