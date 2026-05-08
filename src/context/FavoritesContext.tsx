import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { fetchFavorites, toggleFavorite } from '../services/api';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorited: (id: string) => boolean;
  toggle: (id: string) => Promise<boolean>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    setIsLoading(true);
    fetchFavorites()
      .then((props) => setFavoriteIds(new Set(props.map((p) => p.id))))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const toggle = useCallback(async (propertyId: string): Promise<boolean> => {
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });
    try {
      const isFav = await toggleFavorite(propertyId);
      // Sync with server result
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
      return isFav;
    } catch {
      // Revert on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(propertyId)) next.delete(propertyId);
        else next.add(propertyId);
        return next;
      });
      return false;
    }
  }, []);

  const isFavorited = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds]
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorited, toggle, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
}
