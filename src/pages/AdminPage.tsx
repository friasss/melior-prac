import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchAdminDashboard, fetchAllInquiries, deleteInquiry, deleteProperty,
  updateInquiryStatus, fetchTrafficStats, fetchFounders, updateFounder,
  type AdminDashboardData, type AdminInquiry, type TrafficStats, type Founder,
} from '../services/api';
import { useTheme } from '../context/ThemeContext';
import TrafficCharts from '../components/TrafficCharts';
import ImageCropModal from '../components/ImageCropModal';

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartamento', HOUSE: 'Casa', VILLA: 'Villa',
  LAND: 'Solar', COMMERCIAL: 'Local', OFFICE: 'Oficina',
};
const STATUS_LABELS: Record<string, string> = {
  SALE: 'Venta', RENT: 'Alquiler',
};
const INQUIRY_STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CLOSED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  AGENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  CLIENT: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
};

type Tab = 'overview' | 'properties' | 'users' | 'inquiries' | 'founders';

function fmt(n: number, cur = 'USD') {
  const symbols: Record<string, string> = { USD: 'US$', DOP: 'RD$', EUR: '€' };
  const symbol = symbols[cur] ?? cur;
  const number = new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(n);
  return cur === 'EUR' ? `${number} ${symbol}` : `${symbol} ${number}`;
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [traffic, setTraffic] = useState<TrafficStats | null>(null);
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [editingFounder, setEditingFounder] = useState<Founder | null>(null);
  const [founderSaving, setFounderSaving] = useState(false);
  const [founderCropSrc, setFounderCropSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [deletingProp, setDeletingProp] = useState<string | null>(null);
  const [deletingInq, setDeletingInq] = useState<string | null>(null);
  const [propSearch, setPropSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [inqSearch, setInqSearch] = useState('');
  const [viewUser, setViewUser] = useState<NonNullable<AdminDashboardData>['allUsers'][0] | null>(null);

  // Force dark mode while on this page; restore user's theme on exit
  const { isDark } = useTheme();
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      if (!isDark) document.documentElement.classList.remove('dark');
    };
  }, [isDark]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    Promise.all([
      fetchAdminDashboard(),
      fetchAllInquiries(),
      fetchTrafficStats().catch(() => null),
      fetchFounders().catch(() => []),
    ])
      .then(([d, inq, t, f]) => { setData(d); setInquiries(inq); setTraffic(t); setFounders(f); })
      .catch(err => setFetchError(err instanceof Error ? err.message : 'Error cargando datos'))
      .finally(() => setLoading(false));
  }, [authLoading, user]);

  async function handleDeleteProperty(id: string) {
    if (!confirm('¿Eliminar esta propiedad permanentemente?')) return;
    setDeletingProp(id);
    try {
      await deleteProperty(id);
      setData(prev => prev ? { ...prev, allProperties: prev.allProperties.filter(p => p.id !== id) } : prev);
    } finally { setDeletingProp(null); }
  }

  async function handleSaveFounder() {
    if (!editingFounder) return;
    setFounderSaving(true);
    try {
      const updated = await updateFounder(editingFounder.id, {
        name: editingFounder.name,
        role: editingFounder.role,
        bio: editingFounder.bio,
        photo: editingFounder.photo,
      });
      setFounders(prev => prev.map(f => f.id === updated.id ? updated : f));
      setEditingFounder(null);
    } finally {
      setFounderSaving(false);
    }
  }

  function handleFounderPhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = () => setFounderCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleDeleteInquiry(id: string) {
    if (!confirm('¿Eliminar esta consulta?')) return;
    setDeletingInq(id);
    try {
      await deleteInquiry(id);
      setInquiries(prev => prev.filter(i => i.id !== id));
    } finally { setDeletingInq(null); }
  }

  async function handleInquiryStatus(id: string, status: string) {
    await updateInquiryStatus(id, status);
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, status } : i));
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
    </div>
  );

  if (fetchError) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-dark">
      <span className="material-symbols-outlined text-4xl text-red-400">error</span>
      <p className="text-sm text-red-400">{fetchError}</p>
      <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Reintentar</button>
    </div>
  );

  if (!data) return null;

  const { stats, topFavorited, topViewed, allProperties, allUsers } = data;

  const filteredProps = allProperties.filter(p =>
    p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
    p.agentName.toLowerCase().includes(propSearch.toLowerCase())
  );
  const filteredUsers = allUsers.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.phone ?? ''}`.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredInq = inquiries.filter(i =>
    `${i.firstName} ${i.lastName} ${i.email} ${i.subject ?? ''}`.toLowerCase().includes(inqSearch.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',    label: 'Resumen',     icon: 'dashboard' },
    { id: 'properties',  label: 'Propiedades', icon: 'home_work' },
    { id: 'users',       label: 'Usuarios',    icon: 'group' },
    { id: 'inquiries',   label: 'Consultas',   icon: 'forum' },
    { id: 'founders',    label: 'Fundadores',  icon: 'diversity_3' },
  ];

  return (
    <>
    <div className="min-h-screen bg-surface-light pb-20 dark:bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
              <span className="material-symbols-outlined text-xl text-red-600 dark:text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">Panel de administración</h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 ml-13">Vista completa del sistema</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/60 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-white text-slate-900 shadow dark:bg-card-dark dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}>
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-8">

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Propiedades activas', value: stats.totalProperties, icon: 'home_work', color: 'text-brand-600' },
                { label: 'En venta',            value: stats.propertiesForSale, icon: 'sell', color: 'text-green-600' },
                { label: 'En alquiler',          value: stats.propertiesForRent, icon: 'key', color: 'text-amber-600' },
                { label: 'Agentes',             value: stats.totalAgents, icon: 'badge', color: 'text-amber-600' },
                { label: 'Clientes',            value: stats.totalClients, icon: 'group', color: 'text-brand-600' },
                { label: 'Consultas nuevas',    value: stats.totalInquiries, icon: 'forum', color: 'text-blue-600' },
                { label: 'Citas pendientes',    value: stats.pendingAppointments, icon: 'event', color: 'text-purple-600' },
                { label: 'Total usuarios',      value: stats.totalClients + stats.totalAgents, icon: 'people', color: 'text-slate-600' },
              ].map(s => (
                <div key={s.label} className="card p-5">
                  <span className={`material-symbols-outlined text-2xl ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Traffic charts */}
            {traffic && (
              <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-6">
                <div className="mb-5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
                  <h2 className="font-heading text-base font-bold text-white">Flujo de visitas</h2>
                </div>
                <TrafficCharts data={traffic} />
              </div>
            )}

            {/* Top favorited */}
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-red-500" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">Más guardadas en favoritos</h2>
              </div>
              <div className="space-y-3">
                {topFavorited.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                    <img src={p.image || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=+'} alt="" className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{p.title}</p>
                      <p className="text-xs text-slate-400">{fmt(p.price, p.currency)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>{p.favorites}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{p.views}</span>
                    </div>
                    <button onClick={() => navigate(`/propiedad/${p.id}`)} className="rounded-lg px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950">Ver</button>
                  </div>
                ))}
                {topFavorited.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin datos aún</p>}
              </div>
            </div>

            {/* Top viewed */}
            <div className="card p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-brand-600">visibility</span>
                <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">Más vistas</h2>
              </div>
              <div className="space-y-3">
                {topViewed.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                    <img src={p.image || 'https://placehold.co/48x48/e2e8f0/94a3b8?text=+'} alt="" className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{p.title}</p>
                      <p className="text-xs text-slate-400">{fmt(p.price, p.currency)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{p.views}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm text-red-400" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>{p.favorites}</span>
                    </div>
                    <button onClick={() => navigate(`/propiedad/${p.id}`)} className="rounded-lg px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950">Ver</button>
                  </div>
                ))}
                {topViewed.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin datos aún</p>}
              </div>
            </div>

            {/* Recent inquiries preview */}
            <div className="card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-blue-500">forum</span>
                  <h2 className="font-heading text-base font-bold text-slate-900 dark:text-white">Consultas recientes</h2>
                </div>
                <button onClick={() => setTab('inquiries')} className="text-xs text-brand-600 hover:underline">Ver todas</button>
              </div>
              <div className="space-y-3">
                {data.recentInquiries.slice(0, 5).map(inq => (
                  <div key={inq.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800">
                      {inq.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{inq.firstName} {inq.lastName}</p>
                      <p className="truncate text-xs text-slate-400">{inq.subject || inq.message}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${INQUIRY_STATUS_COLORS[inq.status] ?? ''}`}>{inq.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PROPERTIES ── */}
        {tab === 'properties' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400">search</span>
                <input
                  type="text" placeholder="Buscar por título o agente…"
                  value={propSearch} onChange={e => setPropSearch(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <span className="text-sm text-slate-500 whitespace-nowrap">{filteredProps.length} propiedades</span>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Propiedad', 'Agente', 'Tipo', 'Estado', 'Precio', 'Vistas', 'Favoritos', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProps.map(p => (
                      <tr key={p.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image || 'https://placehold.co/40x40/e2e8f0/94a3b8?text=+'} alt="" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                            <span className="max-w-[180px] truncate font-medium text-slate-800 dark:text-slate-200">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.agentName}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{TYPE_LABELS[p.propertyType] ?? p.propertyType}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            p.listingStatus === 'ACTIVE'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}>{p.listingStatus}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{fmt(p.price, p.currency)}</td>
                        <td className="px-4 py-3 text-slate-500">{p.viewCount}</td>
                        <td className="px-4 py-3 text-slate-500">{p.favorites}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/propiedad/${p.id}`)} title="Ver"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                              <span className="material-symbols-outlined text-base">open_in_new</span>
                            </button>
                            <button onClick={() => navigate(`/editar/${p.id}`)} title="Editar"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950">
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button onClick={() => handleDeleteProperty(p.id)} disabled={deletingProp === p.id} title="Eliminar"
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 disabled:opacity-40">
                              {deletingProp === p.id
                                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                : <span className="material-symbols-outlined text-base">delete</span>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProps.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-400">No se encontraron propiedades</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400">search</span>
                <input
                  type="text" placeholder="Buscar por nombre, correo o teléfono…"
                  value={userSearch} onChange={e => setUserSearch(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <span className="text-sm text-slate-500 whitespace-nowrap">{filteredUsers.length} usuarios</span>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      {['Usuario', 'Contacto', 'Rol', 'Info agente', 'Estado', 'Registrado', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {u.avatarUrl
                              ? <img src={u.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                              : (
                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                  {u.firstName[0]}{u.lastName[0]}
                                </div>
                              )
                            }
                            <span className="font-medium text-slate-800 dark:text-slate-200">{u.firstName} {u.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-slate-500 dark:text-slate-400">{u.email}</p>
                          {u.phone && <p className="text-xs text-slate-400 mt-0.5">{u.phone}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_COLORS[u.role] ?? ''}`}>
                            {u.role === 'ADMIN' ? 'Admin' : u.role === 'AGENT' ? 'Agente' : 'Cliente'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.agentInfo ? (
                            <div className="text-xs text-slate-400 space-y-0.5">
                              {u.agentInfo.company && <p className="font-medium text-slate-300">{u.agentInfo.company}</p>}
                              <p>{u.agentInfo.propertyCount} propiedad{u.agentInfo.propertyCount !== 1 ? 'es' : ''}</p>
                              <p>⭐ {u.agentInfo.rating.toFixed(1)} · {u.agentInfo.totalSales} ventas</p>
                              {u.agentInfo.isVerified && <span className="text-green-400">✓ Verificado</span>}
                            </div>
                          ) : <span className="text-xs text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`flex items-center gap-1 text-xs ${u.emailVerified ? 'text-green-400' : 'text-slate-500'}`}>
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {u.emailVerified ? 'mark_email_read' : 'mail'}
                              </span>
                              {u.emailVerified ? 'Email verificado' : 'Sin verificar'}
                            </span>
                            <span className={`flex items-center gap-1 text-xs ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {u.isActive ? 'check_circle' : 'block'}
                              </span>
                              {u.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setViewUser(u)}
                            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="py-10 text-center text-sm text-slate-400">No se encontraron usuarios</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── INQUIRIES ── */}
        {tab === 'inquiries' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-slate-400">search</span>
                <input
                  type="text" placeholder="Buscar por nombre, correo o asunto…"
                  value={inqSearch} onChange={e => setInqSearch(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <span className="text-sm text-slate-500 whitespace-nowrap">{filteredInq.length} consultas</span>
            </div>

            <div className="space-y-3">
              {filteredInq.map(inq => (
                <div key={inq.id} className="card p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800">
                      {inq.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-slate-900 dark:text-white">{inq.firstName} {inq.lastName}</span>
                        <span className="text-xs text-slate-400">{inq.email}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${INQUIRY_STATUS_COLORS[inq.status] ?? ''}`}>{inq.status}</span>
                      </div>
                      {inq.subject && <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{inq.subject}</p>}
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{inq.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(inq.createdAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <select
                        value={inq.status}
                        onChange={e => handleInquiryStatus(inq.id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <option value="NEW">NEW</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                      <button onClick={() => handleDeleteInquiry(inq.id)} disabled={deletingInq === inq.id}
                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40">
                        {deletingInq === inq.id
                          ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                          : <span className="material-symbols-outlined text-sm">delete</span>}
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredInq.length === 0 && (
                <div className="card py-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-300">forum</span>
                  <p className="mt-2 text-sm text-slate-400">No hay consultas</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOUNDERS ── */}
        {tab === 'founders' && (
          <div className="space-y-6">
            <p className="text-sm text-slate-400">Edita el nombre, cargo, bio y foto de cada fundador. Los cambios se reflejan inmediatamente en la página de inicio.</p>

            {founders.map(founder => (
              <div key={founder.id} className="card p-6">
                {editingFounder?.id === founder.id ? (
                  /* ── Edit mode ── */
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      {/* Photo preview + upload */}
                      <div className="relative flex-shrink-0">
                        {editingFounder.photo ? (
                          <img src={editingFounder.photo} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-500/30" />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white">
                            {editingFounder.name.split(' ').filter((_,i)=>i===0||i===2).map(w=>w[0]).join('')}
                          </div>
                        )}
                        <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow hover:bg-brand-700">
                          <span className="material-symbols-outlined text-sm">photo_camera</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleFounderPhotoFile} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="label-field">Nombre</label>
                          <input type="text" value={editingFounder.name}
                            onChange={e => setEditingFounder(p => p ? { ...p, name: e.target.value } : p)}
                            className="input-field" />
                        </div>
                        <div>
                          <label className="label-field">Cargo</label>
                          <input type="text" value={editingFounder.role}
                            onChange={e => setEditingFounder(p => p ? { ...p, role: e.target.value } : p)}
                            className="input-field" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="label-field">Biografía</label>
                      <textarea
                        value={editingFounder.bio}
                        onChange={e => setEditingFounder(p => p ? { ...p, bio: e.target.value } : p)}
                        rows={4}
                        className="input-field resize-none"
                      />
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setEditingFounder(null)} className="btn-secondary">Cancelar</button>
                      <button onClick={handleSaveFounder} disabled={founderSaving} className="btn-primary disabled:opacity-60">
                        {founderSaving
                          ? <span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Guardando…</span>
                          : <><span className="material-symbols-outlined text-base">save</span>Guardar</>}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View mode ── */
                  <div className="flex items-start gap-5">
                    {founder.photo ? (
                      <img src={founder.photo} alt={founder.name} className="h-20 w-20 flex-shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-xl font-bold text-white">
                        {founder.name.split(' ').filter((_,i)=>i===0||i===2).map(w=>w[0]).join('')}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-heading text-base font-bold text-slate-900 dark:text-white">{founder.name}</p>
                          <span className="text-xs text-brand-400">{founder.role}</span>
                        </div>
                        <button onClick={() => setEditingFounder({ ...founder })}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 flex-shrink-0">
                          <span className="material-symbols-outlined text-sm">edit</span>
                          Editar
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{founder.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>

    {/* ── User profile modal ── */}
    {viewUser && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewUser(null)}>
        <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-card-dark shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
          {/* Header gradient */}
          <div className="h-24 bg-gradient-to-r from-brand-600 to-brand-800" />
          <button onClick={() => setViewUser(null)} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40">
            <span className="material-symbols-outlined text-base">close</span>
          </button>

          {/* Avatar */}
          <div className="relative -mt-12 flex justify-center">
            {viewUser.avatarUrl ? (
              <img src={viewUser.avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-card-dark shadow-lg" />
            ) : (
              <div className={`flex h-24 w-24 items-center justify-center rounded-full ring-4 ring-white dark:ring-card-dark shadow-lg text-2xl font-bold text-white ${
                viewUser.role === 'ADMIN' ? 'bg-red-500' : viewUser.role === 'AGENT' ? 'bg-amber-500' : 'bg-brand-600'
              }`}>
                {viewUser.firstName[0]}{viewUser.lastName[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-6 pb-6 pt-3 space-y-4">
            <div className="text-center">
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white">{viewUser.firstName} {viewUser.lastName}</h3>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${ROLE_COLORS[viewUser.role] ?? ''}`}>
                {viewUser.role === 'ADMIN' ? 'Administrador' : viewUser.role === 'AGENT' ? 'Agente' : 'Cliente'}
              </span>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-400 flex-shrink-0">mail</span>
                <span className="text-sm text-slate-700 dark:text-slate-300 break-all">{viewUser.email}</span>
                {viewUser.emailVerified && <span className="material-symbols-outlined text-sm text-green-500 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
              </div>
              {viewUser.phone && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-slate-400 flex-shrink-0">phone</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{viewUser.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-slate-400 flex-shrink-0">calendar_today</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Registrado {new Date(viewUser.createdAt).toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[18px] flex-shrink-0 ${viewUser.isActive ? 'text-green-500' : 'text-red-400'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {viewUser.isActive ? 'check_circle' : 'block'}
                </span>
                <span className={`text-sm ${viewUser.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  Cuenta {viewUser.isActive ? 'activa' : 'inactiva'}
                </span>
              </div>
            </div>

            {viewUser.agentInfo && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Información de Agente</p>
                {viewUser.agentInfo.company && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-amber-500">business</span>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{viewUser.agentInfo.company}</span>
                    {viewUser.agentInfo.isVerified && <span className="material-symbols-outlined text-sm text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="text-center rounded-lg bg-white dark:bg-slate-800 p-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{viewUser.agentInfo.propertyCount}</p>
                    <p className="text-[10px] text-slate-400">Propiedades</p>
                  </div>
                  <div className="text-center rounded-lg bg-white dark:bg-slate-800 p-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{viewUser.agentInfo.rating.toFixed(1)}</p>
                    <p className="text-[10px] text-slate-400">Rating ⭐</p>
                  </div>
                  <div className="text-center rounded-lg bg-white dark:bg-slate-800 p-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{viewUser.agentInfo.totalSales}</p>
                    <p className="text-[10px] text-slate-400">Ventas</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Founder photo crop modal */}
    {founderCropSrc && editingFounder && (
      <ImageCropModal
        src={founderCropSrc}
        shape="circle"
        outputSize={400}
        onConfirm={dataUrl => {
          setEditingFounder(p => p ? { ...p, photo: dataUrl } : p);
          setFounderCropSrc(null);
        }}
        onClose={() => setFounderCropSrc(null)}
      />
    )}
  </>
  );
}
