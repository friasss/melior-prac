import { Link, useNavigate } from 'react-router-dom';
import { type Property, formatPrice } from '../data/properties';
import { toggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'featured';
}

const PropertyCard = ({ property, variant = 'default' }: PropertyCardProps) => {
  const isFeatured = variant === 'featured';
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav]           = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  async function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setFavLoading(true);
    try {
      const result = await toggleFavorite(property.id);
      setFav(result);
    } catch {
      // ignore
    } finally {
      setFavLoading(false);
    }
  }

  return (
    <Link
      to={`/propiedad/${property.id}`}
      className={`card-hover group flex flex-col overflow-hidden ${isFeatured ? 'sm:flex-row' : ''}`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${isFeatured ? 'sm:w-1/2' : ''}`}>
        <div
          className={`w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${
            isFeatured ? 'aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-[280px]' : 'aspect-[16/10]'
          }`}
          style={{ backgroundImage: `url("${property.image}")` }}
          role="img"
          aria-label={property.title}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="badge bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm">{property.type}</span>
          <span className={`badge backdrop-blur-sm shadow-sm ${property.status === 'rent' ? 'bg-emerald-500/90 text-white' : 'bg-brand-600/90 text-white'}`}>
            {property.status === 'rent' ? 'Alquiler' : 'Venta'}
          </span>
        </div>

        {/* Heart */}
        <button
          onClick={handleFav}
          disabled={favLoading}
          className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white disabled:opacity-60 ${fav ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
          title={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: fav ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>
      </div>

      {/* Content */}
      <div className={`flex flex-grow flex-col justify-between p-4 ${isFeatured ? 'sm:p-6' : ''}`}>
        <div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {property.location}
          </div>
          <h3 className={`mt-1 font-heading font-bold text-slate-900 leading-tight dark:text-white ${isFeatured ? 'text-xl' : 'text-base'}`}>
            {property.title}
          </h3>
          {isFeatured && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{property.description}</p>
          )}
        </div>

        <div className="mt-3">
          {/* Specs */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">bed</span>
              {property.beds}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">shower</span>
              {property.baths}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">straighten</span>
              {property.size} m²
            </span>
          </div>
          {/* Price */}
          <p className={`mt-2 font-heading font-bold text-brand-600 dark:text-brand-400 ${isFeatured ? 'text-2xl' : 'text-lg'}`}>
            {formatPrice(property.price, property.currency, property.status)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
