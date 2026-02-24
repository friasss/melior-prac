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
