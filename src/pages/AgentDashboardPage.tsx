import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchMyPropertiesRaw, fetchAgentInquiries,
  updateListingStatus, deleteProperty, updateInquiryStatus,
  type AgentProperty, type AgentInquiry,
} from '../services/api';

const LISTING_STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Activa',      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { value: 'SOLD',     label: 'Vendida',     color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { value: 'RENTED',   label: 'Alquilada',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'ARCHIVED', label: 'Desactivada', color: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
];

const INQUIRY_STATUS_OPTIONS = [
  { value: 'NEW',         label: 'Nueva',       color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  { value: 'IN_PROGRESS', label: 'En proceso',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  { value: 'RESOLVED',    label: 'Resuelta',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  { value: 'CLOSED',      label: 'Cerrada',     color: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' },
];

function formatPrice(price: number, currency: string) {
  return currency === 'USD'
    ? `US$${price.toLocaleString()}`
    : `RD$${price.toLocaleString()}`;
}

function StatusBadge({ value, options }: { value: string; options: typeof LISTING_STATUS_OPTIONS }) {
  const opt = options.find(o => o.value === value) ?? options[options.length - 1];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${opt.color}`}>
      {opt.label}
    </span>
  );
}

/* ── Inquiries grouped by property ── */
function InquiryCard({
  inq,
  onStatusChange,
}: {
  inq: AgentInquiry;
  onStatusChange: (id: string, status: string) => void;
}) {
  const statusOpt = INQUIRY_STATUS_OPTIONS.find(o => o.value === inq.status) ?? INQUIRY_STATUS_OPTIONS[0];
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-700 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
            {inq.firstName[0]}{inq.lastName[0]}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              {inq.firstName} {inq.lastName}
            </p>
            <p className="text-xs text-slate-400">{inq.email}{inq.phone ? ` · ${inq.phone}` : ''}</p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusOpt.color}`}>
            {statusOpt.label}
          </span>
        </div>
        {inq.subject && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{inq.subject}</p>
        )}
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{inq.message}</p>
        <p className="mt-2 text-xs text-slate-400">
          {new Date(inq.createdAt).toLocaleDateString('es-DO', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
        <Link
          to="/mensajes"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <span className="material-symbols-outlined text-sm">chat</span>
          Abrir chat
        </Link>
        <a
          href={`mailto:${inq.email}`}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined text-sm">mail</span>
          Email
        </a>
        {(inq.status === 'NEW' || inq.status === 'IN_PROGRESS') && (
          <button
            onClick={() => onStatusChange(inq.id, 'RESOLVED')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Resuelta
          </button>
        )}
        {inq.status === 'NEW' && (
          <button
            onClick={() => onStatusChange(inq.id, 'IN_PROGRESS')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-sm">schedule</span>
            En proceso
          </button>
        )}
        {inq.status !== 'CLOSED' && (
          <button
            onClick={() => onStatusChange(inq.id, 'CLOSED')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

function InquiriesGrouped({
  inquiries,
  properties,
  onStatusChange,
}: {
  inquiries: AgentInquiry[];
  properties: AgentProperty[];
  onStatusChange: (id: string, status: string) => void;
}) {
  if (inquiries.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 py-16 text-center">
        <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">mail</span>
        <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">No hay consultas todavía</p>
        <p className="text-sm text-slate-500">Cuando los clientes envíen mensajes sobre tus propiedades, aparecerán aquí.</p>
      </div>
    );
  }

  // Group inquiries by property id; null/undefined goes to "general"
  const groups = new Map<string, { label: string; image: string; propId: string | null; items: AgentInquiry[] }>();

  for (const inq of inquiries) {
    const key = inq.property?.id ?? '__general__';
    if (!groups.has(key)) {
      const prop = properties.find(p => p.id === key);
      groups.set(key, {
        label: inq.property?.title ?? prop?.title ?? 'Consulta general',
        image: prop?.image ?? '',
        propId: inq.property?.id ?? null,
        items: [],
      });
    }
    groups.get(key)!.items.push(inq);
  }

  return (
    <div className="space-y-8">
      {[...groups.entries()].map(([key, group]) => (
        <div key={key}>
          {/* Property header */}
          <div className="mb-3 flex items-center gap-3">
            {group.image ? (
              <img src={group.image} alt="" className="h-10 w-14 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950">
                <span className="material-symbols-outlined text-brand-400 text-xl">home</span>
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-heading font-bold text-slate-900 dark:text-white truncate">{group.label}</p>
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                  {group.items.length} consulta{group.items.length !== 1 ? 's' : ''}
                </span>
              </div>
              {group.propId && (
                <Link
                  to={`/propiedad/${group.propId}`}
                  className="text-xs text-brand-600 hover:underline dark:text-brand-400"
                >
                  Ver publicación →
                </Link>
              )}
            </div>
          </div>

          {/* Inquiries under this property */}
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {group.items
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(inq => (
                  <div key={inq.id} className="p-4">
                    <InquiryCard inq={inq} onStatusChange={onStatusChange} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const AgentDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'properties' | 'inquiries'>('properties');

  const [properties, setProperties] = useState<AgentProperty[]>([]);
  const [inquiries, setInquiries]   = useState<AgentInquiry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const [statusChanging, setStatusChanging] = useState<string | null>(null);
  const [deleting, setDeleting]             = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [props, inqs] = await Promise.all([
        fetchMyPropertiesRaw(),
        fetchAgentInquiries(),
      ]);
      setProperties(props);
      setInquiries(inqs);
    } catch {
      setError('No se pudo cargar la información. Asegúrate de estar conectado.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'AGENT' && user?.role !== 'ADMIN') { navigate('/'); return; }
    load();
  }, [isAuthenticated, user, navigate, load]);

  async function handleStatusChange(id: string, newStatus: string) {
    setStatusChanging(id);
    try {
      await updateListingStatus(id, newStatus);
      setProperties(prev => prev.map(p => p.id === id ? { ...p, listingStatus: newStatus } : p));
    } catch {
      // silently ignore — state already in sync
    } finally {
      setStatusChanging(null);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch {
      // silently ignore
    } finally {
      setDeleting(null);
    }
  }

  async function handleInquiryStatus(id: string, newStatus: string) {
    try {
      await updateInquiryStatus(id, newStatus);
      setInquiries(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    } catch {
      // silently ignore
    }
  }

  // Stats
  const totalViews    = properties.reduce((s, p) => s + p.viewCount, 0);
  const activeCount   = properties.filter(p => p.listingStatus === 'ACTIVE').length;
  const pendingInqs   = inquiries.filter(i => i.status === 'NEW' || i.status === 'IN_PROGRESS').length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
          <p className="text-sm text-slate-500">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Mi Panel de Agente
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestiona tus propiedades y consultas
          </p>
        </div>
        <Link to="/publicar" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-base">add_home</span>
          Nueva Propiedad
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { icon: 'home_work',    label: 'Propiedades',     value: properties.length,  color: 'text-brand-600 dark:text-brand-400',   bg: 'bg-brand-50 dark:bg-brand-950' },
          { icon: 'check_circle', label: 'Activas',          value: activeCount,        color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { icon: 'visibility',   label: 'Visitas totales',  value: totalViews,         color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-50 dark:bg-violet-900/30' },
          { icon: 'mail',         label: 'Citas pendientes', value: pendingInqs,        color: 'text-amber-600 dark:text-amber-400',    bg: 'bg-amber-50 dark:bg-amber-900/30' },
        ].map(stat => (
          <div key={stat.label} className="card flex items-center gap-4 p-5">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.bg}`}>
              <span className={`material-symbols-outlined text-2xl ${stat.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {([
          { key: 'properties', label: 'Mis Propiedades', icon: 'home_work', count: properties.length },
          { key: 'inquiries',  label: 'Citas y Consultas', icon: 'mail',    count: inquiries.length },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
              tab === t.key ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/60 dark:text-brand-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* ── PROPERTIES TAB ── */}
      {tab === 'properties' && (
        <div>
          {properties.length === 0 ? (
            <div className="card flex flex-col items-center gap-4 py-16 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">home_work</span>
              <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">Aún no tienes propiedades publicadas</p>
              <p className="text-sm text-slate-500">Publica tu primera propiedad y empieza a recibir consultas.</p>
              <Link to="/publicar" className="btn-primary mt-2">Publicar propiedad</Link>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 text-left">
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Propiedad</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Precio</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-center">
                        <span className="flex items-center gap-1 justify-center">
                          <span className="material-symbols-outlined text-base">visibility</span>
                          Visitas
                        </span>
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
                      <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {properties.map(prop => (
                      <tr key={prop.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        {/* Property info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prop.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&q=80'}
                              alt={prop.title}
                              className="h-12 w-16 shrink-0 rounded-lg object-cover"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{prop.title}</p>
                              <p className="text-xs text-slate-400">{prop.city} · {prop.propertyType}</p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatPrice(prop.price, prop.currency)}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            {prop.status === 'SALE' ? 'venta' : 'alquiler'}
                          </span>
                        </td>

                        {/* Views */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                            <span className="material-symbols-outlined text-sm text-slate-400">visibility</span>
                            {prop.viewCount.toLocaleString()}
                          </span>
                        </td>

                        {/* Status dropdown */}
                        <td className="px-4 py-3">
                          <div className="relative">
                            <select
                              value={prop.listingStatus}
                              disabled={statusChanging === prop.id}
                              onChange={e => handleStatusChange(prop.id, e.target.value)}
                              className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold shadow-sm transition-colors hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                            >
                              {LISTING_STATUS_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            {statusChanging === prop.id && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/70 dark:bg-slate-800/70">
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/propiedad/${prop.id}`}
                              title="Ver publicación"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-white"
                            >
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </Link>
                            <Link
                              to={`/editar/${prop.id}`}
                              title="Editar"
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950 dark:hover:text-brand-400"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>
                            {deleteConfirm === prop.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(prop.id)}
                                  disabled={deleting === prop.id}
                                  className="rounded-lg bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400"
                                >
                                  {deleting === prop.id ? '...' : 'Confirmar'}
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(prop.id)}
                                title="Eliminar"
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── INQUIRIES TAB ── */}
      {tab === 'inquiries' && (
        <InquiriesGrouped
          inquiries={inquiries}
          properties={properties}
          onStatusChange={handleInquiryStatus}
        />
      )}
    </div>
  );
};

export default AgentDashboardPage;
