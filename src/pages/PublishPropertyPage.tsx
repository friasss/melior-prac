import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createProperty, addPropertyImageUrls, fetchMyProperties, type CreatePropertyPayload } from '../services/api';
import ImageCropModal from '../components/ImageCropModal';
import PaymentModal from '../components/PaymentModal';

const DOP_RATE = 59;
const FEATURED_PRICE_USD = 10;
const EXTRA_PROP_PRICE_USD = 30;
const FREE_PROP_LIMIT = 2;

function UpgradeToAgentScreen() {
  const { upgradeToAgent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    setError('');
    try {
      await upgradeToAgent();
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
        <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">¡Cuenta actualizada!</h2>
      <p className="max-w-sm text-center text-slate-500 dark:text-slate-400">Tu cuenta ahora es de Agente. Ya puedes publicar propiedades.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
        <span className="material-symbols-outlined text-5xl text-brand-600">badge</span>
      </div>
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">¿Quieres publicar propiedades?</h2>
        <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
          Para publicar propiedades necesitas una <strong className="text-slate-700 dark:text-slate-300">cuenta de Agente</strong>.
          ¿Deseas cambiar tu cuenta actual a cuenta de Agente?
        </p>
      </div>
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button onClick={handleUpgrade} disabled={loading} className="btn-primary min-w-[180px] justify-center">
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <><span className="material-symbols-outlined text-base">upgrade</span> Cambiar a Agente</>
          )}
        </button>
      </div>
      <p className="max-w-xs text-center text-xs text-slate-400 dark:text-slate-500">
        Al confirmar, tu rol cambiará a Agente y podrás publicar, gestionar y administrar propiedades en Melior.
      </p>
    </div>
  );
}

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
  'Piscina','Balcón','Jardín','Terraza','Gym','Seguridad 24/7',
  'Lobby','Área social','Aire acondicionado','Cocina equipada','Closets','Amueblado',
];

type Step = 1 | 2 | 3 | 4;

export default function PublishPropertyPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]           = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState(false);
  const [newPropertyId, setNewPropertyId] = useState('');

  // Property count + payment
  const [myPropCount, setMyPropCount] = useState<number | null>(null);
  const [showFeaturedPayment, setShowFeaturedPayment] = useState(false);
  const [showPublishPayment, setShowPublishPayment]   = useState(false);
  const [publishPaid, setPublishPaid] = useState(false);

  // Step 1
  const [title, setTitle]         = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [status, setStatus]       = useState<'SALE'|'RENT'>('SALE');
  const [condition, setCondition] = useState<'NEW'|'USED'|'UNDER_CONSTRUCTION'>('NEW');
  const [price, setPrice]         = useState('');
  const [currency, setCurrency]   = useState('USD');

  // Step 2
  const [beds, setBeds]           = useState('');
  const [baths, setBaths]         = useState('');
  const [size, setSize]           = useState('');
  const [parking, setParking]     = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Step 3
  const [city, setCity]           = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet]       = useState('');
  const [country, setCountry]     = useState('DO');

  // Step 4 – images (cropped data URLs, ordered)
  const [images, setImages]           = useState<string[]>([]); // final cropped data URLs
  const [imageError, setImageError]   = useState('');
  const [cropSrc, setCropSrc]         = useState<string | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdx = React.useRef<number | null>(null);

  useEffect(() => {
    if (user?.role === 'AGENT' || user?.role === 'ADMIN') {
      fetchMyProperties().then(p => setMyPropCount(p.length)).catch(() => setMyPropCount(0));
    }
  }, [user]);

  function toggleFeature(name: string) {
    setSelectedFeatures(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    e.target.value = '';
    // open crop for first file; queue the rest
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(files[0]);
    setImageError('');
  }

  function handleDropZone(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(files[0]);
    setImageError('');
  }

  function handleCropConfirm(dataUrl: string) {
    setCropSrc(null);
    if (images.length >= 10) return;
    setImages(prev => [...prev, dataUrl]);
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  // Drag-to-reorder
  function onDragStart(i: number) { dragIdx.current = i; }
  function onDragEnter(i: number) { setDragOverIdx(i); }
  function onDragEnd() {
    if (dragIdx.current !== null && dragOverIdx !== null && dragIdx.current !== dragOverIdx) {
      setImages(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIdx.current!, 1);
        arr.splice(dragOverIdx, 0, moved);
        return arr;
      });
    }
    dragIdx.current = null;
    setDragOverIdx(null);
  }

  async function doSubmit() {
    setIsSubmitting(true);
    setError('');
    try {
      const payload: CreatePropertyPayload = {
        title, description,
        price: parseFloat(price), currency,
        status, condition, propertyType,
        beds: parseInt(beds) || 0, baths: parseInt(baths) || 0,
        size: parseFloat(size) || 0,
        parkingSpaces: parseInt(parking) || 0,
        isFeatured,
        address: { city, neighborhood, street, country },
        features: selectedFeatures.map(name => ({ name, category: 'general' })),
      };
      const id = await createProperty(payload);
      setNewPropertyId(id);
      await addPropertyImageUrls(id, images);
      setSuccess(true);
      setTimeout(() => navigate(`/propiedad/${id}`), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (images.length < 2) {
      setImageError('Debes subir al menos 2 fotos de la propiedad.');
      return;
    }
    if (myPropCount !== null && myPropCount >= FREE_PROP_LIMIT && !publishPaid) {
      setShowPublishPayment(true);
      return;
    }
    await doSubmit();
  }

  if (authLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-surface-light dark:bg-surface-dark">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );

  if (!isAuthenticated) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <span className="material-symbols-outlined text-5xl text-brand-600">lock</span>
      <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Acceso restringido</h2>
      <button onClick={() => navigate('/login')} className="btn-primary">Iniciar Sesión</button>
    </div>
  );

  if (user?.role === 'CLIENT') return <UpgradeToAgentScreen />;

  if (success) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
        <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">¡Propiedad publicada!</h2>
      <p className="text-slate-500">Redirigiendo a tu publicación…</p>
    </div>
  );

  const stepLabels = ['Información', 'Detalles', 'Ubicación', 'Fotos'];

  return (
    <>
    <div className="min-h-screen bg-surface-light pb-20 dark:bg-surface-dark">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Publicar propiedad</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Completa los 4 pasos para publicar tu listing.</p>
        </div>

        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {([1,2,3,4] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step === s ? 'bg-brand-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {step > s ? <span className="material-symbols-outlined text-sm">check</span> : s}
                </div>
                <span className={`hidden sm:block text-xs font-medium ${step === s ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {stepLabels[i]}
                </span>
              </div>
              {i < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Property limit banners */}
        {myPropCount === FREE_PROP_LIMIT - 1 && !publishPaid && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-950/40">
            <span className="material-symbols-outlined text-base text-blue-600 dark:text-blue-400 mt-0.5">info</span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Solo te queda <strong>1 propiedad gratuita</strong>. La siguiente requerirá un pago de{' '}
              <strong>${EXTRA_PROP_PRICE_USD} USD</strong>{' '}
              <span className="font-normal opacity-70">(≈ RD${Math.round(EXTRA_PROP_PRICE_USD * DOP_RATE).toLocaleString('es-DO')})</span>.
            </p>
          </div>
        )}
        {myPropCount !== null && myPropCount >= FREE_PROP_LIMIT && !publishPaid && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-950/40">
            <span className="material-symbols-outlined text-base text-amber-600 dark:text-amber-400 mt-0.5">payments</span>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Has usado tus {FREE_PROP_LIMIT} propiedades gratuitas. Esta publicación adicional tiene un costo de{' '}
              <strong>${EXTRA_PROP_PRICE_USD} USD</strong>{' '}
              <span className="font-normal opacity-70">(≈ RD${Math.round(EXTRA_PROP_PRICE_USD * DOP_RATE).toLocaleString('es-DO')})</span>.
            </p>
          </div>
        )}

        {error && <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="card p-6 space-y-5">
              <div>
                <label className="label-field">Título del listing</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Apartamento moderno en Piantini" required className="input-field" />
              </div>
              <div>
                <label className="label-field">Descripción</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe la propiedad con detalle… (mín. 20 caracteres)" required minLength={20} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="label-field">Tipo de propiedad</label>
                  <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="input-field">
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-field">Operación</label>
                  <select value={status} onChange={e => setStatus(e.target.value as 'SALE'|'RENT')} className="input-field">
                    <option value="SALE">Venta</option>
                    <option value="RENT">Alquiler</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-field">Condición</label>
                <div className="flex gap-2">
                  {CONDITIONS.map(c => (
                    <button key={c} type="button" onClick={() => setCondition(c)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${condition === c ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300' : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'}`}>
                      {CONDITION_LABELS[c]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-2">
                  <label className="label-field">Precio</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="250000" required min={1} className="input-field" />
                </div>
                <div>
                  <label className="label-field">Moneda</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="input-field">
                    <option value="USD">USD</option>
                    <option value="DOP">DOP</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => { if (!title || !description || !price) { setError('Completa todos los campos requeridos.'); return; } setError(''); setStep(2); }} className="btn-primary">
                  Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="label-field">Habitaciones</label><input type="number" value={beds} onChange={e => setBeds(e.target.value)} placeholder="3" min={0} className="input-field" /></div>
                <div><label className="label-field">Baños</label><input type="number" value={baths} onChange={e => setBaths(e.target.value)} placeholder="2" min={0} className="input-field" /></div>
                <div><label className="label-field">Área (m²)</label><input type="number" value={size} onChange={e => setSize(e.target.value)} placeholder="120" min={1} required className="input-field" /></div>
                <div><label className="label-field">Estacionamientos</label><input type="number" value={parking} onChange={e => setParking(e.target.value)} placeholder="1" min={0} className="input-field" /></div>
              </div>
              <div>
                <label className="label-field">Características</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVAILABLE_FEATURES.map(name => (
                    <button key={name} type="button" onClick={() => toggleFeature(name)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${selectedFeatures.includes(name) ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-200 text-slate-600 hover:border-brand-400 dark:border-slate-700 dark:text-slate-400'}`}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Marcar como destacado</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Aparecerá en la sección destacada del inicio</p>
                  <p className="mt-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    ${FEATURED_PRICE_USD} USD{' '}
                    <span className="font-normal text-slate-400">· ≈ RD${Math.round(FEATURED_PRICE_USD * DOP_RATE).toLocaleString('es-DO')}</span>
                  </p>
                </div>
                <button type="button" onClick={() => {
                  if (!isFeatured) { setShowFeaturedPayment(true); }
                  else { setIsFeatured(false); }
                }}
                  className={`relative h-6 w-11 rounded-full transition-colors ${isFeatured ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary"><span className="material-symbols-outlined text-base">arrow_back</span> Atrás</button>
                <button type="button" onClick={() => { if (!size) { setError('El área (m²) es requerida.'); return; } setError(''); setStep(3); }} className="btn-primary">Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span></button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><label className="label-field">Ciudad *</label><input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Santo Domingo" required className="input-field" /></div>
                <div><label className="label-field">Sector / Barrio</label><input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="Piantini" className="input-field" /></div>
              </div>
              <div><label className="label-field">Calle / Dirección</label><input type="text" value={street} onChange={e => setStreet(e.target.value)} placeholder="Av. Abraham Lincoln #123" className="input-field" /></div>
              <div>
                <label className="label-field">País</label>
                <select value={country} onChange={e => setCountry(e.target.value)} className="input-field">
                  <option value="DO">República Dominicana</option>
                  <option value="US">Estados Unidos</option>
                  <option value="ES">España</option>
                  <option value="MX">México</option>
                  <option value="CO">Colombia</option>
                  <option value="PA">Panamá</option>
                </select>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary"><span className="material-symbols-outlined text-base">arrow_back</span> Atrás</button>
                <button type="button" onClick={() => { if (!city) { setError('La ciudad es requerida.'); return; } setError(''); setStep(4); }} className="btn-primary">Siguiente <span className="material-symbols-outlined text-base">arrow_forward</span></button>
              </div>
            </div>
          )}

          {/* ── Step 4 – Fotos ── */}
          {step === 4 && (
            <div className="card p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Fotos de la propiedad
                  <span className="ml-2 text-xs font-normal text-slate-400">({images.length}/10 · mínimo 2)</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Cada foto pasa por un recortador · arrastra las miniaturas para reordenar
                </p>
              </div>

              {/* Drop zone */}
              {images.length < 10 && (
                <div
                  onDrop={handleDropZone}
                  onDragOver={e => e.preventDefault()}
                  className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-brand-600"
                >
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">add_photo_alternate</span>
                  <p className="text-xs text-slate-400">Arrastra una foto aquí o</p>
                  <label className="btn-primary cursor-pointer text-sm">
                    <span className="material-symbols-outlined text-base">upload</span>
                    Seleccionar foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                  </label>
                </div>
              )}

              {imageError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
                  <span className="material-symbols-outlined text-base">error</span>
                  {imageError}
                </div>
              )}

              {/* Draggable grid */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Arrastra para cambiar el orden · la primera es la foto principal
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        draggable
                        onDragStart={() => onDragStart(i)}
                        onDragEnter={() => onDragEnter(i)}
                        onDragOver={e => e.preventDefault()}
                        onDragEnd={onDragEnd}
                        className={`group relative aspect-square cursor-grab overflow-hidden rounded-xl transition-all active:cursor-grabbing ${
                          dragOverIdx === i ? 'ring-2 ring-brand-500 scale-95' : ''
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover pointer-events-none" />
                        {i === 0 && (
                          <div className="absolute bottom-1 left-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                            Principal
                          </div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button type="button" onClick={() => removeImage(i)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                        <div className="pointer-events-none absolute bottom-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="material-symbols-outlined text-sm text-white drop-shadow">drag_indicator</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirement indicator */}
              <div className={`flex items-center gap-2 text-sm font-medium ${images.length >= 2 ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: images.length >= 2 ? "'FILL' 1" : "'FILL' 0" }}>
                  {images.length >= 2 ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {images.length >= 2 ? `${images.length} fotos listas` : `Faltan ${2 - images.length} foto(s)`}
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-1 text-sm">
                <p className="font-semibold text-slate-900 dark:text-white">Resumen</p>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{title}</span>
                  <span className="font-medium">{currency} {Number(price).toLocaleString()}</span>
                </div>
                <p className="text-slate-400 text-xs">{PROPERTY_TYPE_LABELS[propertyType]} · {status === 'SALE' ? 'Venta' : 'Alquiler'} · {city}</p>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="btn-secondary"><span className="material-symbols-outlined text-base">arrow_back</span> Atrás</button>
                <button type="submit" disabled={isSubmitting || images.length < 2} className="btn-primary disabled:opacity-60">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Publicando…
                    </span>
                  ) : (
                    <><span className="material-symbols-outlined text-base">publish</span> Publicar propiedad</>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>

    {/* Crop modal */}
    {cropSrc && (
      <ImageCropModal
        src={cropSrc}
        shape="square"
        outputSize={800}
        onConfirm={handleCropConfirm}
        onClose={() => setCropSrc(null)}
      />
    )}

    <PaymentModal
      isOpen={showFeaturedPayment}
      onClose={() => setShowFeaturedPayment(false)}
      onSuccess={() => { setShowFeaturedPayment(false); setIsFeatured(true); }}
      amountUSD={FEATURED_PRICE_USD}
      title="Destacar propiedad"
      description="Tu propiedad aparecerá en la sección destacada del inicio"
    />

    <PaymentModal
      isOpen={showPublishPayment}
      onClose={() => setShowPublishPayment(false)}
      onSuccess={() => { setShowPublishPayment(false); setPublishPaid(true); doSubmit(); }}
      amountUSD={EXTRA_PROP_PRICE_USD}
      title="Publicación adicional"
      description={`Superaste el límite de ${FREE_PROP_LIMIT} propiedades gratuitas`}
    />
    </>
  );
}
