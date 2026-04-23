import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchMyProfile,
  completeOAuthProfile,
  upgradeToAgent as apiUpgradeToAgent,
  setToken,
  removeToken,
  getToken,
  type AuthUser,
} from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    role?: 'CLIENT' | 'AGENT';
  }) => Promise<void>;
  loginWithOAuth: (accessToken: string, refreshToken: string) => Promise<{ needsProfileCompletion: boolean }>;
  completeProfile: (data: { firstName: string; lastName: string; phone?: string; role: 'CLIENT' | 'AGENT' }) => Promise<void>;
  upgradeToAgent: () => Promise<void>;
  logout: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchMyProfile()
      .then((profile) => setUser(profile))
      .catch(() => removeToken())
      .finally(() => setIsLoading(false));
  }, []);

  // Listen for avatar updates from ProfilePage
  useEffect(() => {
    function onAvatarUpdate() {
      const stored = localStorage.getItem('melior_user');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
      }
    }
    window.addEventListener('melior_avatar_updated', onAvatarUpdate);
    return () => window.removeEventListener('melior_avatar_updated', onAvatarUpdate);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    setToken(result.accessToken);
    localStorage.setItem('melior_refresh_token', result.refreshToken);
    localStorage.setItem('melior_user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      password: string;
      confirmPassword: string;
      role?: 'CLIENT' | 'AGENT';
    }) => {
      const result = await registerUser(data);
      setToken(result.accessToken);
      localStorage.setItem('melior_refresh_token', result.refreshToken);
      localStorage.setItem('melior_user', JSON.stringify(result.user));
      setUser(result.user);
    },
    []
  );

  const loginWithOAuth = useCallback(async (accessToken: string, refreshToken: string) => {
    setToken(accessToken);
    localStorage.setItem('melior_refresh_token', refreshToken);
    const profile = await fetchMyProfile();
    if (profile) {
      localStorage.setItem('melior_user', JSON.stringify(profile));
      setUser(profile);
    }
    const needsProfileCompletion = !!(profile as any)?.needsProfileCompletion;
    return { needsProfileCompletion };
  }, []);

  const completeProfile = useCallback(async (data: { firstName: string; lastName: string; phone?: string; role: 'CLIENT' | 'AGENT' }) => {
    const updated = await completeOAuthProfile(data);
    localStorage.setItem('melior_user', JSON.stringify(updated));
    setUser(updated);
  }, []);

  const upgradeToAgent = useCallback(async () => {
    const result = await apiUpgradeToAgent();
    setToken(result.accessToken);
    localStorage.setItem('melior_refresh_token', result.refreshToken);
    localStorage.setItem('melior_user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('melior_refresh_token') ?? '';
    try {
      await logoutUser(refreshToken);
    } catch {
      // Ignore errors — clear local state regardless
    }
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithOAuth,
        completeProfile,
        upgradeToAgent,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
