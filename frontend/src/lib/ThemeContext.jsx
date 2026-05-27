import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/**
 * ThemeProvider — wraps the app and manages dark/light mode.
 *
 * Strategy:
 *  - Dark theme  → no class on <html>           (`:root` CSS vars)
 *  - Light theme → adds `.light` class to <html> (`.light` CSS vars override)
 *
 * Preference order:
 *  1. localStorage  ('theme' key → 'dark' | 'light')
 *  2. OS system preference (prefers-color-scheme)
 *  3. Default → 'dark'
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (_) {}
    // Fallback to system preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  // Apply class to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (_) {}
  }, [theme]);

  // Listen to system preference changes (only if no saved preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e) => {
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setThemeState(e.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    const body = document.body;
    body.classList.add('theme-transition');
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
    setTimeout(() => {
      body.classList.remove('theme-transition');
    }, 500);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
