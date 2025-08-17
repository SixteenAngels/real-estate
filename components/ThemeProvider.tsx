import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  availableThemes: { value: Theme; label: string; preview: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const themes = [
  { value: 'light' as Theme, label: 'Light', preview: '#ffffff' },
  { value: 'dark' as Theme, label: 'Dark', preview: '#020617' },
  { value: 'blue' as Theme, label: 'Ocean Blue', preview: '#1e40af' },
  { value: 'green' as Theme, label: 'Forest Green', preview: '#166534' },
  { value: 'purple' as Theme, label: 'Royal Purple', preview: '#7c3aed' },
  { value: 'orange' as Theme, label: 'Sunset Orange', preview: '#ea580c' },
];

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('propertyHubTheme') as Theme;
    if (savedTheme && themes.find(t => t.value === savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'blue', 'green', 'purple', 'orange');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Apply theme-specific CSS variables
    switch (theme) {
      case 'light':
        // Default light theme variables are already set in globals.css
        break;
      case 'dark':
        // Dark theme variables are already set in globals.css
        break;
      case 'blue':
        root.style.setProperty('--primary', '#1e40af');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--accent', '#dbeafe');
        root.style.setProperty('--accent-foreground', '#1e40af');
        root.style.setProperty('--secondary', '#f1f5f9');
        root.style.setProperty('--secondary-foreground', '#1e40af');
        break;
      case 'green':
        root.style.setProperty('--primary', '#166534');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--accent', '#dcfce7');
        root.style.setProperty('--accent-foreground', '#166534');
        root.style.setProperty('--secondary', '#f0fdf4');
        root.style.setProperty('--secondary-foreground', '#166534');
        break;
      case 'purple':
        root.style.setProperty('--primary', '#7c3aed');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--accent', '#ede9fe');
        root.style.setProperty('--accent-foreground', '#7c3aed');
        root.style.setProperty('--secondary', '#faf5ff');
        root.style.setProperty('--secondary-foreground', '#7c3aed');
        break;
      case 'orange':
        root.style.setProperty('--primary', '#ea580c');
        root.style.setProperty('--primary-foreground', '#ffffff');
        root.style.setProperty('--accent', '#fed7aa');
        root.style.setProperty('--accent-foreground', '#ea580c');
        root.style.setProperty('--secondary', '#fff7ed');
        root.style.setProperty('--secondary-foreground', '#ea580c');
        break;
    }
    
    // Save theme to localStorage
    localStorage.setItem('propertyHubTheme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  );
}