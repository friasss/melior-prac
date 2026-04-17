import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveIsDark(theme: Theme): boolean {
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('melior_theme') as Theme | null) ?? 'light';
  });

  const [isDark, setIsDark] = useState(() => resolveIsDark(
    (localStorage.getItem('melior_theme') as Theme | null) ?? 'light'
  ));

  useEffect(() => {
    const html = document.documentElement;
    const dark = resolveIsDark(theme);
    setIsDark(dark);
    if (dark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [theme]);

  // Re-evaluate when system preference changes (only matters if theme === 'system')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function onChange() {
      if (theme === 'system') {
        const dark = mq.matches;
        setIsDark(dark);
        if (dark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    }
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  function setTheme(t: Theme) {
    localStorage.setItem('melior_theme', t);
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
