'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'celestial';

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function CelestialThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('rosaline-theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'celestial')) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'celestial') {
      root.classList.add('celestial-night');
    } else {
      root.classList.remove('celestial-night');
    }
    localStorage.setItem('rosaline-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'celestial' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useCelestialTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useCelestialTheme must be used within CelestialThemeProvider');
  return context;
}
