import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPropertyById, updateProperty, replacePropertyImages, deleteProperty, type CreatePropertyPayload } from '../services/api';
import ImageCropModal from '../components/ImageCropModal';

const PROPERTY_TYPES = ['APARTMENT','HOUSE','VILLA','LAND','COMMERCIAL','OFFICE'];
const PROPERTY_TYPE_LABELS: Record<string,string> = {
  APARTMENT:'Apartamento', HOUSE:'Casa', VILLA:'Villa',
  LAND:'Solar / Terreno', COMMERCIAL:'Local Comercial', OFFICE:'Oficina',
};
const AVAILABLE_FEATURES = [
  'Piscina','Balcón','Jardín','Terraza','Gym','Seguridad 24/7',
  'Lobby','Área social','Aire acondicionado','Cocina equipada','Closets','Amueblado',
];

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form fields
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('APARTMENT');
  const [status, setStatus]           = useState<'SALE'|'RENT'>('SALE');
  const [price, setPrice]             = useState('');
  const [currency, setCurrency]       = useState('USD');
  const [beds, setBeds]               = useState('');
  const [baths, setBaths]             = useState('');
  const [size, setSize]               = useState('');
  const [parking, setParking]         = useState('0');
  const [city, setCity]               = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet]           = useState('');
  const [isFeatured, setIsFeatured]   = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  // Photos — all photos unified (existing URLs + new cropped data URLs)
  const [photos, setPhotos]         = useState<string[]>([]);
  const [originalCount, setOriginalCount] = useState(0); // how many were pre-existing
  const [cropSrc, setCropSrc]       = useState<string | null>(null);
  const [cropTargetIdx, setCropTargetIdx] = useState<number | null>(null); // null = new photo, number = recrop existing
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchPropertyById(id).then(prop => {
      if (!prop) { navigate('/perfil'); return; }
      setTitle(prop.title);
      setDescription(prop.description ?? '');
      setPropertyType(prop.type ?? 'APARTMENT');
      setStatus(prop.status === 'rent' ? 'RENT' : 'SALE');
      setPrice(String(prop.price));
      setCurrency(prop.currency ?? 'USD');
      setBeds(String(prop.beds ?? ''));
      setBaths(String(prop.baths ?? ''));
      setSize(String(prop.size ?? ''));
      setCity(prop.location?.split(',')?.[0]?.trim() ?? '');
      setNeighborhood(prop.neighborhood ?? '');
      setIsFeatured(prop.featured ?? false);
      const imgs = prop.images ?? [];
      setPhotos(imgs);
      setOriginalCount(imgs.length);
      setLoading(false);
    }).catch(() => navigate('/perfil'));
  }, [id]);

  function toggleFeature(name: string) {
    setSelectedFeatures(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]);
  }

  // ── Photo handlers ──
  function openCropForFile(file: File, targetIdx: number | null = null) {
    const reader = new FileReader();
    reader.onload = () => {
      setCropTargetIdx(targetIdx);
      setCropSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    openCropForFile(file, null);
  }

  function handleDropZone(e: React.DragEvent) {
    e.preventDefault();
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (!file) return;
    openCropForFile(file, null);
  }

  function handleRecropClick(idx: number) {
    // Open the current photo in crop modal; on confirm it replaces the same slot
    setCropTargetIdx(idx);
    setCropSrc(photos[idx]);
  }

  function handleCropConfirm(dataUrl: string) {
    setCropSrc(null);
    if (cropTargetIdx !== null) {
      setPhotos(prev => prev.map((p, i) => i === cropTargetIdx ? dataUrl : p));
    } else {
      setPhotos(prev => [...prev, dataUrl]);
    }
    setCropTargetIdx(null);
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    if (index < originalCount) setOriginalCount(c => c - 1);
  }

  function onDragStart(i: number) { dragIdx.current = i; }
  function onDragEnter(i: number) { setDragOverIdx(i); }
  function onDragEnd() {
    if (dragIdx.current !== null && dragOverIdx !== null && dragIdx.current !== dragOverIdx) {
      setPhotos(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIdx.current!, 1);
        arr.splice(dragOverIdx, 0, moved);
        return arr;
      });
    }
    dragIdx.current = null;
    setDragOverIdx(null);
  }

  // ── Save ──
  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    if (photos.length < 1) { setError('La propiedad debe tener al menos 1 foto.'); return; }
    setError('');
    setSaving(true);
    try {
      const payload: Partial<CreatePropertyPayload> = {
        title, description,
        price: parseFloat(price), currency,
        status, propertyType,
        beds: parseInt(beds) || 0, baths: parseInt(baths) || 0,
        size: parseFloat(size) || 0,
        parkingSpaces: parseInt(parking) || 0,
        isFeatured,
        address: { city, neighborhood, street, country: 'DO' },
        features: selectedFeatures.map(name => ({ name, category: 'general' })),
      };
      await updateProperty(id!, payload);
      // Always replace all images: handles reorder, delete, and recrop without duplicates
      await replacePropertyImages(id!, photos);

      setSuccess(true);
      setTimeout(() => navigate(`/propiedad/${id}`), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteProperty(id!);
      navigate('/perfil');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );

  if (!isAuthenticated || user?.role === 'CLIENT') { navigate('/'); return null; }

  if (success) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <span className="material-symbols-outlined text-4xl text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">¡Cambios guardados!</h2>
    </div>
  );

  const totalPhotos = photos.length;

  return (
    <>
    <div className="min-h-screen bg-surface-light pb-20 dark:bg-surface-dark">
      <div className="mx-auto max-w-2xl px-4 py-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Editar propiedad</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Actualiza la información de tu listing</p>
          </div>
          <button onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950">
            <span className="material-symbols-outlined text-base">delete</span>
            Eliminar
          </button>
        </div>

        {error && <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">{error}</div>}

        <form onSubmit={handleSave} className="space-y-5">

          {/* ── Fotos ── */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading text-base font-bold text-slate-900 dark:text-white">Fotos</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {totalPhotos}/10 fotos · arrastra para reordenar · la primera es la principal
                </p>
              </div>
              {totalPhotos < 10 && (
                <label className="btn-secondary cursor-pointer text-xs py-2">
                  <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                  Agregar foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              )}
            </div>

            {/* Drop zone (shown when no photos) */}
            {totalPhotos === 0 && (
              <div
                onDrop={handleDropZone}
                onDragOver={e => e.preventDefault()}
                className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
              >
                <span className="material-symbols-outlined text-3xl text-slate-300">add_photo_alternate</span>
                <p className="text-xs text-slate-400">Arrastra una foto aquí o usa el botón "Agregar foto"</p>
              </div>
            )}

            {/* Photo grid */}
            {totalPhotos > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {photos.map((src, i) => (
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

                    {/* Principal badge */}
                    {i === 0 && (
                      <div className="absolute bottom-1 left-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                        Principal
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => handleRecropClick(i)}
                        title="Recortar foto"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white shadow backdrop-blur-sm transition-transform hover:scale-110 hover:bg-white/30"
                      >
                        <span className="material-symbols-outlined text-sm">crop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        title="Eliminar foto"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow transition-transform hover:scale-110"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>

                    {/* Drag handle hint */}
                    <div className="pointer-events-none absolute top-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="material-symbols-outlined text-sm text-white drop-shadow">drag_indicator</span>
                    </div>
                  </div>
                ))}

                {/* Add more inline */}
                {totalPhotos < 10 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800/50">
                    <span className="material-symbols-outlined text-2xl text-slate-300 dark:text-slate-600">add</span>
                    <span className="mt-1 text-[10px] text-slate-400">Agregar</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* ── Información básica ── */}
          <div className="card p-6 space-y-5">
            <p className="font-heading text-base font-bold text-slate-900 dark:text-white">Información básica</p>
            <div>
              <label className="label-field">Título</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="input-field" />
            </div>
            <div>
              <label className="label-field">Descripción</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} minLength={20} required className="input-field resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-field">Tipo</label>
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
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label-field">Precio</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} required min={1} className="input-field" />
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
          </div>

          {/* ── Detalles ── */}
          <div className="card p-6 space-y-5">
            <p className="font-heading text-base font-bold text-slate-900 dark:text-white">Detalles</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Habitaciones</label><input type="number" value={beds} onChange={e => setBeds(e.target.value)} min={0} className="input-field" /></div>
              <div><label className="label-field">Baños</label><input type="number" value={baths} onChange={e => setBaths(e.target.value)} min={0} className="input-field" /></div>
              <div><label className="label-field">Área (m²)</label><input type="number" value={size} onChange={e => setSize(e.target.value)} min={1} required className="input-field" /></div>
              <div><label className="label-field">Estacionamientos</label><input type="number" value={parking} onChange={e => setParking(e.target.value)} min={0} className="input-field" /></div>
            </div>
            <div>
              <label className="label-field">Características</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {AVAILABLE_FEATURES.map(name => (
                  <button key={name} type="button" onClick={() => toggleFeature(name)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedFeatures.includes(name)
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                    }`}>
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Marcar como destacado</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Aparece en la sección de destacadas</p>
              </div>
              <button type="button" onClick={() => setIsFeatured(!isFeatured)}
                className={`relative h-6 w-11 rounded-full transition-colors ${isFeatured ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isFeatured ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>

          {/* ── Ubicación ── */}
          <div className="card p-6 space-y-5">
            <p className="font-heading text-base font-bold text-slate-900 dark:text-white">Ubicación</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label-field">Ciudad</label><input type="text" value={city} onChange={e => setCity(e.target.value)} required className="input-field" /></div>
              <div><label className="label-field">Sector</label><input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="input-field" /></div>
            </div>
            <div><label className="label-field">Dirección</label><input type="text" value={street} onChange={e => setStreet(e.target.value)} className="input-field" /></div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving
                ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Guardando…</span>
                : <><span className="material-symbols-outlined text-base">save</span> Guardar cambios</>}
            </button>
          </div>
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

    {/* Delete confirm modal */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowDeleteConfirm(false)}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-card-dark" onClick={e => e.stopPropagation()}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950 mb-4">
            <span className="material-symbols-outlined text-2xl text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>delete_forever</span>
          </div>
          <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white">¿Eliminar propiedad?</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Esta acción no se puede deshacer. La publicación se eliminará permanentemente.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60">
              {deleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
