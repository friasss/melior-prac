/**
 * Melior API Service
 * Connects to the backend at VITE_API_URL (default: http://localhost:4000)
 * and maps backend responses to the frontend Property interface.
 */

import type { Property } from '../data/properties';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('melior_token');
}

export function setToken(token: string): void {
  localStorage.setItem('melior_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('melior_token');
  localStorage.removeItem('melior_refresh_token');
  localStorage.removeItem('melior_user');
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    // If the backend sent field-level errors, build a readable message
    if (data?.errors && typeof data.errors === 'object') {
      const details = Object.entries(data.errors as Record<string, string[]>)
        .map(([, msgs]) => msgs.join(', '))
        .join(' | ');
      throw new Error(details || data?.message || `Error ${res.status}`);
    }
    throw new Error(data?.message ?? `Error ${res.status}`);
  }

  return data as T;
}

// ─── Property mapper ──────────────────────────────────────────────────────────
// Converts the backend shape (PascalCase enums, nested objects) to
// the flat Property interface the frontend components expect.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapProperty(raw: any): Property {
  const primaryImg =
    raw.images?.find((i: any) => i.isPrimary)?.url ?? raw.images?.[0]?.url ?? '';

  const location = [raw.address?.city, raw.address?.neighborhood]
    .filter(Boolean)
    .join(', ');

  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    currency: raw.currency ?? 'USD',
    location,
    neighborhood: raw.address?.neighborhood ?? '',
    beds: raw.beds ?? 0,
    baths: raw.baths ?? 0,
    size: raw.size ?? 0,
    type: raw.propertyType ?? raw.type ?? '',
    // Backend stores "SALE"/"RENT"; frontend expects "sale"/"rent"
    status: (raw.status as string).toLowerCase() as 'sale' | 'rent',
    featured: raw.isFeatured ?? false,
    image: primaryImg,
    images: (raw.images ?? []).map((i: any) => i.url),
    description: raw.description ?? '',
    agent: {
      name: `${raw.agent?.user?.firstName ?? ''} ${raw.agent?.user?.lastName ?? ''}`.trim(),
      company: raw.agent?.company ?? 'Melior Properties',
      image: raw.agent?.user?.avatarUrl ?? '',
      phone: raw.agent?.user?.phone ?? '',
    },
  };
}

// ─── API response types ───────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PropertyListResponse {
  success: boolean;
  data: Property[];
  meta: PaginationMeta;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CLIENT' | 'AGENT' | 'ADMIN';
  avatarUrl: string | null;
  emailVerified?: boolean;
}

// ─── Properties ───────────────────────────────────────────────────────────────

export interface PropertyFilters {
  search?: string;
  /** 'SALE' | 'RENT' — backend uses uppercase */
  status?: 'SALE' | 'RENT';
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  city?: string;
  neighborhood?: string;
  page?: number;
  limit?: number;
}

export async function fetchProperties(
  filters: PropertyFilters = {}
): Promise<PropertyListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) params.set(k, String(v));
  });
  const qs = params.toString();
  const res = await apiFetch<any>(`/api/properties${qs ? `?${qs}` : ''}`);
  return {
    ...res,
    data: (res.data ?? []).map(mapProperty),
  };
}

export async function fetchFeaturedProperties(limit = 4): Promise<Property[]> {
  const res = await apiFetch<any>(`/api/properties/featured?limit=${limit}`);
  return (res.data ?? []).map(mapProperty);
}

export async function fetchPropertyById(id: string): Promise<Property | null> {
  try {
    const res = await apiFetch<any>(`/api/properties/${id}`);
    return mapProperty(res.data);
  } catch {
    return null;
  }
}

export async function fetchSimilarProperties(id: string): Promise<Property[]> {
  try {
    const res = await apiFetch<any>(`/api/properties/${id}/similar`);
    return (res.data ?? []).map(mapProperty);
  } catch {
    return [];
  }
}

export async function fetchPropertyStats(): Promise<{
  total: number;
  forSale: number;
  forRent: number;
  byType: { type: string; count: number }[];
} | null> {
  try {
    const res = await apiFetch<any>('/api/properties/stats');
    return res.data;
  } catch {
    return null;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginUser(email: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}> {
  const res = await apiFetch<any>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  role?: 'CLIENT' | 'AGENT';
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}> {
  const res = await apiFetch<any>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: data.role ?? 'CLIENT' }),
  });
  return res.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiFetch('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export async function fetchMyProfile(): Promise<AuthUser | null> {
  try {
    const res = await apiFetch<any>('/api/auth/profile');
    return res.data;
  } catch {
    return null;
  }
}

export async function completeOAuthProfile(data: {
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CLIENT' | 'AGENT';
}): Promise<AuthUser> {
  const res = await apiFetch<any>('/api/auth/complete-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function upgradeToAgent(): Promise<{ user: AuthUser; accessToken: string; refreshToken: string }> {
  const res = await apiFetch<any>('/api/auth/upgrade-to-agent', { method: 'POST' });
  return res.data;
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function fetchFavorites(): Promise<Property[]> {
  const res = await apiFetch<any>('/api/favorites');
  return (res.data ?? []).map((fav: any) => mapProperty(fav.property));
}

export async function toggleFavorite(propertyId: string): Promise<boolean> {
  const res = await apiFetch<any>(`/api/favorites/${propertyId}`, {
    method: 'POST',
  });
  return res.data?.isFavorite ?? false;
}

export async function checkIsFavorite(propertyId: string): Promise<boolean> {
  try {
    const res = await apiFetch<any>(`/api/favorites/${propertyId}/check`);
    return res.data?.isFavorite ?? false;
  } catch {
    return false;
  }
}

// ─── Inquiries / Contact ──────────────────────────────────────────────────────

export interface InquiryPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  propertyId?: string;
}

export async function submitInquiry(payload: InquiryPayload): Promise<void> {
  await apiFetch('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface MyInquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subject?: string;
  message: string;
  status: string;
  createdAt: string;
  property?: { id: string; title: string; slug: string } | null;
}

export async function fetchMyInquiries(): Promise<MyInquiry[]> {
  const res = await apiFetch<any>('/api/inquiries/mine');
  return res.data ?? [];
}

// ─── Propiedades (agente) ─────────────────────────────────────────────────────

export interface CreatePropertyPayload {
  title: string;
  description: string;
  price: number;
  currency: string;
  status: 'SALE' | 'RENT';
  condition: 'NEW' | 'USED' | 'UNDER_CONSTRUCTION';
  propertyType: string;
  beds: number;
  baths: number;
  size: number;
  parkingSpaces: number;
  isFeatured: boolean;
  address: {
    city: string;
    neighborhood?: string;
    street?: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  features: { name: string; category: string }[];
}

export async function createProperty(payload: CreatePropertyPayload): Promise<string> {
  const res = await apiFetch<any>('/api/properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data?.id;
}

export async function addPropertyImageUrls(propertyId: string, urls: string[]): Promise<void> {
  await apiFetch(`/api/properties/${propertyId}/images/urls`, {
    method: 'POST',
    body: JSON.stringify({ urls }),
  });
}

export async function replacePropertyImages(propertyId: string, urls: string[]): Promise<void> {
  await apiFetch(`/api/properties/${propertyId}/images/urls`, {
    method: 'PUT',
    body: JSON.stringify({ urls }),
  });
}

export async function updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<void> {
  await apiFetch(`/api/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyProperties(): Promise<Property[]> {
  const res = await apiFetch<any>('/api/properties/mine');
  return (res.data ?? []).map(mapProperty);
}

export async function deleteProperty(id: string): Promise<void> {
  await apiFetch(`/api/properties/${id}`, { method: 'DELETE' });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminDashboardData {
  stats: {
    totalProperties: number;
    propertiesForSale: number;
    propertiesForRent: number;
    totalClients: number;
    totalAgents: number;
    totalInquiries: number;
    pendingAppointments: number;
  };
  topFavorited: { id: string; title: string; price: number; currency: string; image: string; favorites: number; views: number }[];
  topViewed:    { id: string; title: string; price: number; currency: string; image: string; favorites: number; views: number }[];
  allProperties: {
    id: string; title: string; price: number; currency: string;
    status: string; listingStatus: string; propertyType: string;
    viewCount: number; createdAt: string; image: string;
    favorites: number; agentName: string;
  }[];
  allUsers: {
    id: string; firstName: string; lastName: string; email: string;
    phone: string | null; role: string; avatarUrl: string | null;
    createdAt: string; emailVerified: boolean; isActive: boolean;
    agentInfo: {
      company: string | null; rating: number; totalSales: number;
      isVerified: boolean; yearsExperience: number; propertyCount: number;
    } | null;
  }[];
  recentInquiries: {
    id: string; firstName: string; lastName: string; email: string;
    subject?: string; message: string; status: string; createdAt: string;
  }[];
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const res = await apiFetch<any>('/api/dashboard/admin');
  return res.data;
}

export interface AdminInquiry {
  id: string; firstName: string; lastName: string; email: string;
  subject?: string; message: string; status: string; createdAt: string;
  property?: { id: string; title: string } | null;
}

export async function fetchAllInquiries(): Promise<AdminInquiry[]> {
  const res = await apiFetch<any>('/api/inquiries');
  return res.data ?? [];
}

export async function deleteInquiry(id: string): Promise<void> {
  await apiFetch(`/api/inquiries/${id}`, { method: 'DELETE' });
}

export async function updateInquiryStatus(id: string, status: string): Promise<void> {
  await apiFetch(`/api/inquiries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TrafficStats {
  daily:  { day: string; visits: number }[];
  hourly: { hour: number; visits: number }[];
}

export async function fetchTrafficStats(): Promise<TrafficStats> {
  const res = await apiFetch<any>('/api/analytics/traffic');
  return res.data;
}

// ─── Site / Founders ──────────────────────────────────────────────────────────

export interface Founder {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string | null;
}

export async function fetchFounders(): Promise<Founder[]> {
  const res = await apiFetch<any>('/api/site/founders');
  return res.data ?? [];
}

export async function updateFounder(
  id: string,
  patch: Partial<Pick<Founder, 'name' | 'role' | 'bio' | 'photo'>>
): Promise<Founder> {
  const res = await apiFetch<any>(`/api/site/founders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return res.data;
}
