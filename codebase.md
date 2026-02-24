# index.html

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Melior — Bienes Raíces</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

# package.json

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@types/leaflet": "^1.9.21",
    "leaflet": "^1.9.4",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-leaflet": "^5.0.0",
    "react-router-dom": "^7.6.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.46.4",
    "vite": "^7.2.4"
  }
}

```

# postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

# src\App.tsx

```tsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import BuyingGuidePage from './pages/BuyingGuidePage';
import FavoritesPage from './pages/FavoritesPage';
import ContactPage from './pages/ContactPage';

function App() {
  return (
    <Routes>
      {/* Auth routes — sin layout principal */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas con layout principal (navbar + footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/propiedades" element={<PropertiesPage />} />
        <Route path="/propiedad/:id" element={<PropertyDetailPage />} />
        <Route path="/guia-de-compra" element={<BuyingGuidePage />} />
        <Route path="/favoritos" element={<FavoritesPage />} />
        <Route path="/contacto" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default App;

```

# src\components\Footer.tsx

```tsx
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-slate-100 bg-white pb-24 sm:pb-0 dark:border-slate-800 dark:bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <span className="material-symbols-outlined text-white text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>villa</span>
              </div>
              <span className="font-heading text-lg font-bold text-slate-900 dark:text-white">Melior</span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Tu socio de confianza en bienes raíces en la República Dominicana.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Explorar</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/propiedades" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Propiedades</Link></li>
              <li><Link to="/propiedades?status=sale" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">En Venta</Link></li>
              <li><Link to="/propiedades?status=rent" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">En Alquiler</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Recursos</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/guia-de-compra" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Guía de Compra</Link></li>
              <li><Link to="/contacto" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Legal</h4>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Términos</a></li>
              <li><a href="#" className="text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400">Privacidad</a></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-slate-100 dark:border-slate-800" />

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Melior. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

```

# src\components\MobileNav.tsx

```tsx
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', icon: 'home', label: 'Inicio' },
  { to: '/propiedades', icon: 'search', label: 'Buscar' },
  { to: '/favoritos', icon: 'favorite', label: 'Favoritos' },
  { to: '/guia-de-compra', icon: 'menu_book', label: 'Guía' },
  { to: '/login', icon: 'person', label: 'Perfil' },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-100 bg-white/90 backdrop-blur-xl sm:hidden dark:border-slate-800 dark:bg-surface-dark/90"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 transition-colors ${
              isActive
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileNav;

```

# src\components\Navbar.tsx

```tsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/propiedades', label: 'Propiedades' },
  { to: '/guia-de-compra', label: 'Guía de Compra' },
  { to: '/contacto', label: 'Contacto' },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-surface-dark/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>villa</span>
            </div>
            <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">Melior</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link to="/favoritos" className="btn-ghost hidden sm:flex">
              <span className="material-symbols-outlined text-xl">favorite</span>
            </Link>
            <Link to="/login" className="btn-primary hidden text-sm sm:flex">
              Iniciar Sesión
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden dark:border-slate-800 dark:bg-surface-dark">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <hr className="my-2 border-slate-100 dark:border-slate-800" />
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary justify-center text-sm"
              >
                Iniciar Sesión
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;

```

# src\components\PropertyCard.tsx

```tsx
import { Link } from 'react-router-dom';
import { type Property, formatPrice } from '../data/properties';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'featured';
}

const PropertyCard = ({ property, variant = 'default' }: PropertyCardProps) => {
  const isFeatured = variant === 'featured';

  return (
    <Link
      to={`/propiedad/${property.id}`}
      className={`card-hover group flex flex-col overflow-hidden ${
        isFeatured ? 'sm:flex-row' : ''
      }`}
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
          <span className="badge bg-white/90 text-slate-700 backdrop-blur-sm shadow-sm">
            {property.type}
          </span>
          <span className={`badge backdrop-blur-sm shadow-sm ${
            property.status === 'rent'
              ? 'bg-emerald-500/90 text-white'
              : 'bg-brand-600/90 text-white'
          }`}>
            {property.status === 'rent' ? 'Alquiler' : 'Venta'}
          </span>
        </div>

        {/* Heart */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:text-red-500"
        >
          <span className="material-symbols-outlined text-lg">favorite</span>
        </button>
      </div>

      {/* Content */}
      <div className={`flex flex-grow flex-col justify-between p-4 ${isFeatured ? 'sm:p-6' : ''}`}>
        <div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {property.location}
          </div>
          <h3 className={`mt-1 font-heading font-bold text-slate-900 leading-tight dark:text-white ${
            isFeatured ? 'text-xl' : 'text-base'
          }`}>
            {property.title}
          </h3>
          {isFeatured && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {property.description}
            </p>
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
          <p className={`mt-2 font-heading font-bold text-brand-600 dark:text-brand-400 ${
            isFeatured ? 'text-2xl' : 'text-lg'
          }`}>
            {formatPrice(property.price, property.currency, property.status)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;

```

# src\data\properties.ts

```ts
export interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  location: string;
  neighborhood: string;
  beds: number;
  baths: number;
  size: number;
  type: string;
  status: 'sale' | 'rent';
  featured: boolean;
  image: string;
  images: string[];
  description: string;
  agent: {
    name: string;
    company: string;
    image: string;
    phone: string;
  };
}

export const properties: Property[] = [
  {
    id: '1',
    title: 'Villa de Lujo con Vista al Mar',
    price: 1200000,
    currency: 'USD',
    location: 'Cap Cana, Punta Cana',
    neighborhood: 'Cap Cana',
    beds: 5,
    baths: 4,
    size: 380,
    type: 'Villa',
    status: 'sale',
    featured: true,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    ],
    description: 'Experimente el epítome del lujo caribeño en esta impresionante villa frente al mar. Ubicada en la prestigiosa comunidad de Cap Cana, esta propiedad ofrece vistas panorámicas ininterrumpidas y acceso directo a playas de arena blanca. Acabados de primera calidad, piscina infinita privada y amplios espacios de entretenimiento.',
    agent: {
      name: 'Ana García',
      company: 'Melior Properties',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      phone: '+1 809-555-0101',
    },
  },
  {
    id: '2',
    title: 'Penthouse Moderno en Torre Premium',
    price: 850000,
    currency: 'USD',
    location: 'Naco, Santo Domingo',
    neighborhood: 'Naco',
    beds: 3,
    baths: 3,
    size: 260,
    type: 'Penthouse',
    status: 'sale',
    featured: true,
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1200',
    ],
    description: 'Penthouse de diseño contemporáneo con terraza privada de 80m² y vistas 360° a la ciudad. Cocina gourmet italiana, pisos de mármol importado y domótica completa. Edificio con amenidades de primer nivel: gimnasio, piscina, área social.',
    agent: {
      name: 'Carlos Méndez',
      company: 'Melior Properties',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      phone: '+1 809-555-0102',
    },
  },
  {
    id: '3',
    title: 'Apartamento con Vista al Jardín Botánico',
    price: 285000,
    currency: 'USD',
    location: 'Los Jardines, Santo Domingo',
    neighborhood: 'Los Jardines',
    beds: 3,
    baths: 2,
    size: 145,
    type: 'Apartamento',
    status: 'sale',
    featured: false,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    ],
    description: 'Hermoso apartamento con vista verde al Jardín Botánico Nacional. Remodelado con acabados modernos, cocina abierta con isla central, y balcón amplio. Ubicación privilegiada con fácil acceso a la 27 de Febrero.',
    agent: {
      name: 'Ana García',
      company: 'Melior Properties',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      phone: '+1 809-555-0101',
    },
  },
  {
    id: '4',
    title: 'Casa Familiar en Arroyo Hondo',
    price: 420000,
    currency: 'USD',
    location: 'Arroyo Hondo, Santo Domingo',
    neighborhood: 'Arroyo Hondo',
    beds: 4,
    baths: 3,
    size: 280,
    type: 'Casa',
    status: 'sale',
    featured: false,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1200',
    ],
    description: 'Espaciosa casa familiar con patio amplio, piscina y área de BBQ. Distribución ideal para familias con 4 habitaciones, sala de estar doble altura y cochera para 3 vehículos. Zona tranquila y segura con vigilancia 24/7.',
    agent: {
      name: 'Laura Reyes',
      company: 'Melior Properties',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      phone: '+1 809-555-0103',
    },
  },
  {
    id: '5',
    title: 'Studio Moderno en Piantini',
    price: 1800,
    currency: 'USD',
    location: 'Piantini, Santo Domingo',
    neighborhood: 'Piantini',
    beds: 1,
    baths: 1,
    size: 65,
    type: 'Studio',
    status: 'rent',
    featured: false,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
    ],
    description: 'Studio completamente amueblado y equipado en el corazón de Piantini. Diseño minimalista, electrodomésticos premium y acceso a todas las amenidades del edificio. Ideal para profesionales jóvenes.',
    agent: {
      name: 'Carlos Méndez',
      company: 'Melior Properties',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      phone: '+1 809-555-0102',
    },
  },
  {
    id: '6',
    title: 'Apartamento Amueblado en Bella Vista',
    price: 2500,
    currency: 'USD',
    location: 'Bella Vista, Santo Domingo',
    neighborhood: 'Bella Vista',
    beds: 2,
    baths: 2,
    size: 120,
    type: 'Apartamento',
    status: 'rent',
    featured: true,
    image: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&q=80&w=1200',
    ],
    description: 'Elegante apartamento completamente amueblado con decoración de diseñador. Dos habitaciones amplias con baño privado, cocina moderna totalmente equipada y área de lavado. Edificio con seguridad 24/7, gimnasio y piscina.',
    agent: {
      name: 'Laura Reyes',
      company: 'Melior Properties',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      phone: '+1 809-555-0103',
    },
  },
];

export const propertyTypes = ['Villa', 'Penthouse', 'Apartamento', 'Casa', 'Studio', 'Terreno'];

export const locations = [
  'Cap Cana', 'Punta Cana', 'Santo Domingo', 'Santiago', 'La Romana', 'Samaná',
  'Naco', 'Piantini', 'Bella Vista', 'Arroyo Hondo', 'Los Jardines',
];

export function formatPrice(price: number, currency: string, status: 'sale' | 'rent'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(price);
  return status === 'rent' ? `${formatted}/mes` : formatted;
}

```

# src\index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    @apply font-display text-slate-800 bg-surface-light dark:bg-surface-dark dark:text-slate-200;
  }

  ::selection {
    @apply bg-brand-200 text-brand-900;
  }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all duration-200 hover:bg-brand-700 hover:shadow-brand-700/30 active:scale-[0.97];
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.97] dark:bg-card-dark dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800;
  }

  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white;
  }

  .card {
    @apply rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 dark:bg-card-dark dark:border-slate-800;
  }

  .card-hover {
    @apply card hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 dark:hover:shadow-black/20;
  }

  .input-field {
    @apply w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-900/30;
  }

  .section-title {
    @apply font-heading text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl;
  }

  .section-subtitle {
    @apply text-base text-slate-500 dark:text-slate-400;
  }

  .badge {
    @apply inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold;
  }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .text-gradient {
    @apply bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent;
  }
}

```

# src\layouts\MainLayout.tsx

```tsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MobileNav from '../components/MobileNav';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};

export default MainLayout;

```

# src\main.tsx

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

```

# src\pages\BuyingGuidePage.tsx

```tsx
import { Link } from 'react-router-dom';

const steps = [
  {
    id: '01',
    icon: 'account_balance',
    title: 'Definición de Presupuesto y Pre-aprobación',
    description:
      'La pre-aprobación bancaria es clave para entender tu capacidad de compra. Reúne tus documentos financieros iniciales y utiliza nuestra calculadora de hipotecas para tener una idea clara de tu presupuesto.',
    tips: ['Solicita tu reporte de crédito', 'Reúne comprobantes de ingresos de 3 meses', 'Calcula tu cuota inicial (típicamente 20-30%)'],
  },
  {
    id: '02',
    icon: 'search',
    title: 'Búsqueda y Selección de la Propiedad',
    description:
      'Define tus criterios de búsqueda: ubicación, tipo de propiedad, presupuesto. Un agente inmobiliario profesional te ayudará a encontrar opciones que se ajusten a tus necesidades.',
    tips: ['Define tus prioridades (ubicación vs. tamaño)', 'Visita al menos 5 propiedades', 'Compara precios por metro cuadrado'],
  },
  {
    id: '03',
    icon: 'gavel',
    title: 'Proceso Legal y Debida Diligencia',
    description:
      'Tu abogado revisará documentos clave como el Título de Propiedad, la Certificación de Estado Jurídico, y verificará que no existan gravámenes o impedimentos legales.',
    tips: ['Contrata un abogado inmobiliario', 'Verifica el título en el Registro de Títulos', 'Solicita certificación de estado jurídico'],
  },
  {
    id: '04',
    icon: 'edit_document',
    title: 'Firma y Cierre',
    description:
      'El paso final incluye la firma del contrato de promesa de venta, el acto de venta final ante notario, el registro del inmueble a tu nombre y la entrega de llaves.',
    tips: ['Revisa todos los documentos antes de firmar', 'Paga el impuesto de transferencia (3%)', 'Registra la propiedad a tu nombre'],
  },
];

const resources = [
  {
    icon: 'real_estate_agent',
    title: 'Asesores Inmobiliarios',
    description: 'Conecta con nuestros expertos para encontrar tu propiedad ideal.',
    link: '/contacto',
    buttonText: 'Contactar ahora',
  },
  {
    icon: 'calculate',
    title: 'Calculadora de Hipoteca',
    description: 'Estima tu cuota mensual y encuentra el mejor plan de financiamiento.',
    link: '#',
    buttonText: 'Calcular',
  },
  {
    icon: 'menu_book',
    title: 'Documentos Necesarios',
    description: 'Descarga la lista completa de documentos para el proceso de compra.',
    link: '#',
    buttonText: 'Descargar',
  },
];

const BuyingGuidePage = () => {
  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-600 px-4 py-16 sm:py-20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500 opacity-30" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-700 opacity-30" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="badge bg-white/20 text-white border border-white/20 mb-4">
            📋 Guía paso a paso
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            Guía de Compra de Propiedad
          </h1>
          <p className="mt-3 text-brand-100">
            Todo lo que necesitas saber para comprar tu propiedad en República Dominicana, explicado de forma clara y sencilla.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {steps.map((step, index) => (
            <details
              key={step.id}
              className="card group overflow-hidden"
              open={index === 0}
            >
              <summary className="flex cursor-pointer items-center gap-4 p-5 list-none outline-none [&::-webkit-details-marker]:hidden">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                  <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                </div>
                <div className="flex-grow">
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">PASO {step.id}</span>
                  <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>
                <span className="material-symbols-outlined text-slate-400 transition-transform duration-200 group-open:rotate-180">
                  expand_more
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Consejos clave:</p>
                  <ul className="mt-2 space-y-1.5">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="material-symbols-outlined text-brand-500 text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <h2 className="section-title text-center">Recursos y Herramientas</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {resources.map((res) => (
            <div key={res.title} className="card p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                <span className="material-symbols-outlined text-2xl">{res.icon}</span>
              </div>
              <h3 className="mt-4 font-heading text-base font-bold text-slate-900 dark:text-white">
                {res.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {res.description}
              </p>
              <Link to={res.link} className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                {res.buttonText} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BuyingGuidePage;

```

# src\pages\ContactPage.tsx

```tsx
const ContactPage = () => {
  return (
    <div className="pb-24 sm:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900 px-4 py-16 sm:py-20">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
            Contáctanos
          </h1>
          <p className="mt-3 text-slate-300">
            Estamos aquí para ayudarte a encontrar la propiedad perfecta. Escríbenos o llámanos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact form */}
          <div className="card p-6 sm:p-8 lg:col-span-3">
            <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">
              Envíanos un mensaje
            </h2>
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                  <input type="text" placeholder="Tu nombre" className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Apellido</label>
                  <input type="text" placeholder="Tu apellido" className="input-field" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                <input type="email" placeholder="tuemail@ejemplo.com" className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Teléfono</label>
                <input type="tel" placeholder="809-000-0000" className="input-field" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">¿En qué te podemos ayudar?</label>
                <select className="input-field">
                  <option>Comprar una propiedad</option>
                  <option>Alquilar una propiedad</option>
                  <option>Vender mi propiedad</option>
                  <option>Inversión inmobiliaria</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos más sobre lo que buscas..."
                  className="input-field resize-none"
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base">
                <span className="material-symbols-outlined text-lg">send</span>
                Enviar mensaje
              </button>
            </form>
          </div>

          {/* Contact info */}
          <div className="space-y-6 lg:col-span-2">
            {[
              { icon: 'location_on', title: 'Oficina Principal', lines: ['Av. Abraham Lincoln #1001', 'Torre Empresarial, Piso 12', 'Santo Domingo, DN'] },
              { icon: 'call', title: 'Teléfono', lines: ['+1 (809) 555-0100', '+1 (809) 555-0200'] },
              { icon: 'mail', title: 'Correo', lines: ['info@melior.com.do', 'ventas@melior.com.do'] },
              { icon: 'schedule', title: 'Horario', lines: ['Lun - Vie: 8:00 AM - 6:00 PM', 'Sáb: 9:00 AM - 1:00 PM'] },
            ].map((item) => (
              <div key={item.title} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    {item.lines.map((line, i) => (
                      <p key={i} className="text-sm text-slate-500 dark:text-slate-400">{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

```

# src\pages\FavoritesPage.tsx

```tsx
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

```

# src\pages\HomePage.tsx

```tsx
import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { properties } from '../data/properties';

const stats = [
  { value: '500+', label: 'Propiedades' },
  { value: '200+', label: 'Clientes Felices' },
  { value: '15', label: 'Años de Experiencia' },
  { value: '98%', label: 'Satisfacción' },
];

const categories = [
  { icon: 'villa', label: 'Villas', count: 42, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
  { icon: 'apartment', label: 'Apartamentos', count: 128, color: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400' },
  { icon: 'house', label: 'Casas', count: 85, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' },
  { icon: 'domain', label: 'Penthouses', count: 23, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400' },
  { icon: 'landscape', label: 'Terrenos', count: 56, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400' },
  { icon: 'store', label: 'Comercial', count: 34, color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400' },
];

const testimonials = [
  {
    name: 'María Fernández',
    role: 'Compradora',
    text: 'Melior hizo que el proceso de compra fuera increíblemente sencillo. Encontramos nuestra villa soñada en Cap Cana en tiempo récord.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  },
  {
    name: 'Roberto Sánchez',
    role: 'Inversionista',
    text: 'Como inversionista, valoro la transparencia y profesionalismo. Melior superó todas mis expectativas con su servicio personalizado.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
  },
  {
    name: 'Lucía Martínez',
    role: 'Compradora',
    text: 'El equipo de Melior nos guió en cada paso. Su conocimiento del mercado dominicano es incomparable.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
  },
];

const HomePage = () => {
  const featuredProperties = properties.filter((p) => p.featured);
  const latestProperties = properties.slice(0, 6);

  return (
    <div className="pb-16 sm:pb-0">
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden bg-slate-900">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000"
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-slate-900/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="max-w-2xl">
            <span className="badge bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">
              🏝️ República Dominicana
            </span>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Encuentra tu{' '}
              <span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">
                hogar ideal
              </span>{' '}
              en el Caribe
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300 sm:text-xl">
              Descubre propiedades exclusivas en las mejores ubicaciones de la República Dominicana. Villas frente al mar, penthouses de lujo y mucho más.
            </p>

            {/* Search bar */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-grow">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input
                  type="text"
                  placeholder="Buscar por ciudad, zona o tipo..."
                  className="w-full rounded-xl border-0 bg-white/10 py-4 pl-12 pr-4 text-white backdrop-blur-md placeholder:text-slate-400 outline-none ring-1 ring-white/20 transition-all focus:bg-white/15 focus:ring-brand-400"
                />
              </div>
              <Link
                to="/propiedades"
                className="btn-primary whitespace-nowrap py-4 text-base shadow-2xl shadow-brand-600/30"
              >
                <span className="material-symbols-outlined text-xl">search</span>
                Explorar
              </Link>
            </div>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['Cap Cana', 'Punta Cana', 'Santo Domingo', 'Samaná'].map((loc) => (
                <Link
                  key={loc}
                  to={`/propiedades?location=${encodeURIComponent(loc)}`}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/25"
                >
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
            <div
              key={stat.label}
              className="card flex flex-col items-center py-5 px-4 text-center"
            >
              <span className="font-heading text-2xl font-extrabold text-brand-600 dark:text-brand-400 sm:text-3xl">
                {stat.value}
              </span>
              <span className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════ FEATURED ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="section-title">Propiedades Destacadas</h2>
            <p className="section-subtitle mt-1">Selección exclusiva de nuestros expertos</p>
          </div>
          <Link to="/propiedades" className="btn-ghost hidden sm:flex">
            Ver todas
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {featuredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} variant="featured" />
          ))}
        </div>
      </section>

      {/* ═══════════════════════ CATEGORIES ═══════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-title">Explora por Categoría</h2>
          <p className="section-subtitle mt-1">Encuentra exactamente lo que buscas</p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/propiedades?type=${encodeURIComponent(cat.label)}`}
              className="card group flex flex-col items-center gap-3 p-5 text-center transition-all hover:shadow-lg hover:-translate-y-1"
            >
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
            Ver todas
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/propiedades" className="btn-secondary">
            Ver todas las propiedades
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
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
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                "{t.text}"
              </p>
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
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-500 opacity-40" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-brand-700 opacity-40" />

          <div className="relative">
            <h2 className="font-heading text-3xl font-extrabold text-white sm:text-4xl">
              ¿Listo para encontrar tu próximo hogar?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-100">
              Nuestros asesores inmobiliarios te guiarán en cada paso del proceso. Contacta con nosotros hoy.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/propiedades"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 shadow-xl transition-all hover:bg-brand-50 active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                Explorar Propiedades
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                Contactar Asesor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

```

# src\pages\LoginPage.tsx

```tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="relative flex min-h-screen w-full flex-col font-display overflow-x-hidden bg-surface-light dark:bg-surface-dark">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-light via-surface-light/90 to-surface-light/50 dark:from-surface-dark dark:via-surface-dark/90 dark:to-surface-dark/50" />
      </div>

      {/* Top bar */}
      <div className="relative z-10 p-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/25">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>villa</span>
          </div>
          <span className="font-heading text-xl font-bold text-slate-900 dark:text-white">Melior</span>
        </Link>
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-grow flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card p-6 sm:p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center">
              <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isLogin ? 'Ingresa a tu cuenta para continuar' : 'Únete a la comunidad Melior'}
              </p>
            </div>

            {/* Tab Switch */}
            <div className="mt-6 flex h-11 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex h-full flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  isLogin
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex h-full flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-all ${
                  !isLogin
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Form */}
            <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Registration fields */}
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Nombre
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Apellido
                      </label>
                      <input
                        type="text"
                        placeholder="Tu apellido"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      placeholder="809-000-0000"
                      className="input-field"
                    />
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  className="input-field"
                />
              </div>

              {/* Password — BUG FIXED:
                  - Single input with type toggling
                  - Custom toggle button inside via absolute positioning
                  - CSS hides native browser password reveal buttons
              */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pr-11 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    style={{ WebkitTextSecurity: showPassword ? 'none' : undefined } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password (registration only) */}
              {!isLogin && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="input-field pr-11 [&::-ms-reveal]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot password */}
              {isLogin && (
                <div className="text-right">
                  <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <hr className="flex-grow border-slate-200 dark:border-slate-700" />
              <span className="text-xs font-medium text-slate-400">o continúa con</span>
              <hr className="flex-grow border-slate-200 dark:border-slate-700" />
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-secondary justify-center py-2.5">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button className="btn-secondary justify-center py-2.5">
                <svg className="h-5 w-5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.38 0-1.5.62-1.5 1.44V12h3l-.5 3h-2.5v6.8c4.56-1.03 8-5.06 8-9.8z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              Al continuar, aceptas nuestros{' '}
              <a className="font-medium text-brand-600 hover:underline dark:text-brand-400" href="#">Términos</a>{' '}y{' '}
              <a className="font-medium text-brand-600 hover:underline dark:text-brand-400" href="#">Privacidad</a>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

```

# src\pages\PropertiesPage.tsx

```tsx
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

```

# src\pages\PropertyDetailPage.tsx

```tsx
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

```

# tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eff4ff",
          100: "#dbe6fe",
          200: "#bfd3fe",
          300: "#93b4fd",
          400: "#6090fa",
          500: "#3b6cf5",
          600: "#1d4ed8",
          700: "#1a3fba",
          800: "#1b3598",
          900: "#1c3178",
          950: "#152049",
        },
        surface: {
          light: "#f8fafc",
          dark: "#0c1322",
        },
        card: {
          light: "#ffffff",
          dark: "#141d2f",
        },
      },
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        heading: ["'Outfit'", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

```

# tsconfig.app.json

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}

```

# tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}

```

# tsconfig.node.json

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}

```

# vite.config.ts

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})

```

