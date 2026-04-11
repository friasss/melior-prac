import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProperty, type CreatePropertyPayload } from '../services/api';

const PROPERTY_TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'COMMERCIAL', 'OFFICE'];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', VILLA: 'Villa',
  LAND: 'Solar / Terreno', COMMERCIAL: 'Local Comercial', OFFICE: 'Oficina',
};
const CONDITIONS = ['NEW', 'USED', 'UNDER_CONSTRUCTION'] as const;
const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Nuevo', USED: 'Usado', UNDER_CONSTRUCTION: 'En Construcción',
};
const AVAILABLE_FEATURES = [
  { name: 'Piscina', category: 'EXTERIOR' },
  { name: 'Balcón', category: 'EXTERIOR' },
  { name: 'Jardín', category: 'EXTERIOR' },
  { name: 'Terraza', category: 'EXTERIOR' },
  { name: 'Gym', category: 'AMENITIES' },
  { name: 'Seguridad 24/7', category: 'AMENITIES' },
  { name: 'Lobby', category: 'AMENITIES' },
  { name: 'Área social', category: 'AMENITIES' },
  { name: 'Aire acondicionado', category: 'INTERIOR' },
  { name: 'Cocina equipada', category: 'INTERIOR' },
  { name: 'Closets', category: 'INTERIOR' },
  { name: 'Amueblado', category: 'INTERIOR' },
];

type Step = 1 | 2 | 3;

export default function PublishPropertyPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Step 1 – Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [status, setStatus] = useState<'SALE' | 'RENT'>('SALE');
  const [condition, setCondition] = useState<'NEW' | 'USED' | 'UNDER_CONSTRUCTION'>('NEW');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Step 2 – Details
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [size, setSize] = useState('');
  const [parking, setParking] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Step 3 – Location
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [country, setCountry] = useState('DO');

  function toggleFeature(name: string) {
    setSelectedFeatures((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    );
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const payload: CreatePropertyPayload = {
        title,
        description,
        price: parseFloat(price),
        currency,
        status,
        condition,
        propertyType,
        beds: parseInt(beds) || 0,
        baths: parseInt(baths) || 0,
        size: parseFloat(size) || 0,
        parkingSpaces: parseInt(parking) || 0,
        isFeatured,
        address: { city, neighborhood, street, country },
        features: selectedFeatures.map((name) => {
          const f = AVAILABLE_FEATURES.find((x) => x.name === name);
          return { name, category: f?.category ?? 'OTHER' };
        }),
      };
      const id = await createProperty(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/propiedad/${id}`), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-light px-4 dark:bg-surface-dark">
        <span className="material-symbols-outlined text-5xl text-brand-600">lock</span>
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Acceso restringido</h2>
        <p className="text-slate-500 dark:text-slate-400">Debes iniciar sesión para publicar propiedades.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Iniciar Sesión</button>
      </div>
    );
  }

  if (user?.role === 'CLIENT') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-light px-4 dark:bg-surface-dark">
        <span className="material-symbols-outlined text-5xl text-amber-500">badge</span>
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Cuenta de Agente requerida</h2>
        <p className="max-w-sm text-center text-slate-500 dark:text-slate-400">
          Solo los agentes pueden publicar propiedades. Regístrate nuevamente seleccionando el tipo <strong>Agente</strong>.
        </p>
        <button onClick={() => navigate('/login')} className="btn-primary">Crear cuenta Agente</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-light px-4 dark:bg-surface-dark">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <span className="material-symbols-outlined text-4xl text-green-600 dark:text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">¡Propiedad publicada!</h2>
        <p className="text-slate-500 dark:text-slate-400">Redirigiendo a tu publicación…</p>
      </div>
    );
  }

  const stepLabel = ['Información básica', 'Detalles', 'Ubicación'];

  return (
    <div className="min-h-screen bg-surface-light pb-20 dark:bg-surface-dark">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Publicar propiedad</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completa los 3 pasos para publicar tu listing.</p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step === s ? 'bg-brand-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                </div>
                <span className={`hidden sm:block text-sm font-medium ${step === s ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  {stepLabel[i]}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ─── Step 1 ─── */}
          {step === 1 && (
            <div className="card p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Título del listing</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Apartamento moderno en Piantini" required className="input-field" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe la propiedad con detalle…" required className="input-field resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de propiedad</label>
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="input-field">
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Operación</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as 'SALE' | 'RENT')} className="input-field">
                    <option value="SALE">Venta</option>
                    <option value="RENT">Alquiler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Condición</label>
                <div className="flex gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCondition(c)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        condition === c
                          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                          : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {CONDITION_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Precio</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="250000" required min={0} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Moneda</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                    <option value="USD">USD</option>
                    <option value="DOP">DOP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { if (!title || !description || !price) { setError('Completa todos los campos requeridos.'); return; } setError(''); setStep(2); }}
                  className="btn-primary"
                >
                  Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2 ─── */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Habitaciones</label>
                  <input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} placeholder="3" min={0} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Baños</label>
                  <input type="number" value={baths} onChange={(e) => setBaths(e.target.value)} placeholder="2" min={0} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Área (m²)</label>
                  <input type="number" value={size} onChange={(e) => setSize(e.target.value)} placeholder="120" min={0} className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Estacionamientos</label>
                  <input type="number" value={parking} onChange={(e) => setParking(e.target.value)} placeholder="1" min={0} className="input-field" />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Características</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FEATURES.map(({ name }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleFeature(name)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedFeatures.includes(name)
                          ? 'border-brand-600 bg-brand-600 text-white'
                          : 'border-slate-200 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Marcar como destacado</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Aparecerá en la sección de propiedades destacadas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${isFeatured ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                  <span className="material-symbols-outlined text-base">arrow_back</span> Atrás
                </button>
                <button type="button" onClick={() => { setError(''); setStep(3); }} className="btn-primary">
                  Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3 ─── */}
          {step === 3 && (
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Ciudad *</label>
                  <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Santo Domingo" required className="input-field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sector / Barrio</label>
                  <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} placeholder="Piantini" className="input-field" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Calle / Dirección</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Av. Abraham Lincoln #123" className="input-field" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">País</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-field">
                  <option value="DO">República Dominicana</option>
                  <option value="US">Estados Unidos</option>
                  <option value="ES">España</option>
                  <option value="MX">México</option>
                  <option value="CO">Colombia</option>
                  <option value="PA">Panamá</option>
                </select>
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-2 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">Resumen</p>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{title}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{currency} {Number(price).toLocaleString()}</span>
                </div>
                <div className="flex gap-3 text-slate-500 dark:text-slate-400">
                  <span>{PROPERTY_TYPE_LABELS[propertyType]}</span>
                  <span>·</span>
                  <span>{status === 'SALE' ? 'Venta' : 'Alquiler'}</span>
                  {beds && <><span>·</span><span>{beds} hab.</span></>}
                  {baths && <><span>·</span><span>{baths} baños</span></>}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                  <span className="material-symbols-outlined text-base">arrow_back</span> Atrás
                </button>
                <button type="submit" disabled={isSubmitting || !city} className="btn-primary disabled:opacity-60">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Publicando…
                    </span>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">publish</span>
                      Publicar propiedad
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
