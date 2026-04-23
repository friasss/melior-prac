import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { type Property, formatPrice } from '../data/properties';
import { toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoginPromptModal from './LoginPromptModal';

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', VILLA: 'Villa',
  LAND: 'Solar / Terreno', COMMERCIAL: 'Local Comercial', OFFICE: 'Oficina',
};

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'featured';
}

const PropertyCard = ({ property, variant = 'default' }: PropertyCardProps) => {
  const isFeatured = variant === 'featured';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav]             = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  async function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { setShowPrompt(true); return; }
    setFavLoading(true);
    try {
      const result = await toggleFavorite(property.id);
      setFav(result);
    } catch { /* ignore */ }
    finally { setFavLoading(false); }
  }

  const fallback = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800';

  return (
    <>
    <LoginPromptModal
      isOpen={showPrompt}
      onClose={() => setShowPrompt(false)}
      action="guardar propiedades en favoritos"
    />
    <Link
      to={`/propiedad/${property.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-card-dark"
    >
      {/* ── Image container ── */}
      <div className={`relative w-full overflow-hidden ${isFeatured ? 'h-64 sm:h-72' : 'h-52'}`}>
        <img
          src={imgError || !property.image ? fallback : property.image}
          alt={property.title}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-40 transition-opacity duration-300 group-hover:opacity-70" />

        {/* "Ver propiedad" button that appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Ver propiedad
          </span>
        </div>

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
            {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm ${
            property.status === 'rent'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-brand-600/90 text-white'
          }`}>
            {property.status === 'rent' ? 'Alquiler' : 'Venta'}
          </span>
        </div>

        {/* Heart top-right */}
        <button
          onClick={handleFav}
          disabled={favLoading}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all disabled:opacity-60 ${
            fav
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-slate-500 hover:bg-white hover:text-red-500'
          }`}
          title={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}
          >
            favorite
          </span>
        </button>

        {/* Price pinned to bottom of image */}
        <div className="absolute bottom-3 left-3">
          <p className="font-heading text-lg font-bold text-white drop-shadow-md">
            {formatPrice(property.price, property.currency, property.status)}
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-grow flex-col gap-1.5 p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="material-symbols-outlined text-[14px] text-brand-500">location_on</span>
          <span className="truncate">{property.location}</span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-sm font-bold leading-snug text-slate-900 line-clamp-2 dark:text-white">
          {property.title}
        </h3>

        {/* Specs */}
        <div className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {property.beds > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bed</span>
              {property.beds}
            </span>
          )}
          {property.baths > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shower</span>
              {property.baths}
            </span>
          )}
          {property.size > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">straighten</span>
              {property.size} m²
            </span>
          )}
        </div>
      </div>
    </Link>
    </>
  );
};

export default PropertyCard;
