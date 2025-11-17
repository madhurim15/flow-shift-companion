import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeType = 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'warm';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('flowfocus-theme');
    return (saved as ThemeType) || 'default';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme attributes first
    root.removeAttribute('data-theme');
    
    // Apply new theme
    if (theme !== 'default') {
      root.setAttribute('data-theme', theme);
    }
    
    // Save to localStorage
    localStorage.setItem('flowfocus-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
