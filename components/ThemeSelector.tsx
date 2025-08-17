import React from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Palette, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Theme } from '../types';

interface ThemeSelectorProps {
  currentTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  const themes = [
    { id: 'light', name: 'Light', icon: Sun },
    { id: 'dark', name: 'Dark', icon: Moon },
    { id: 'blue', name: 'Blue', icon: Palette },
    { id: 'green', name: 'Green', icon: Palette },
    { id: 'purple', name: 'Purple', icon: Palette },
    { id: 'orange', name: 'Orange', icon: Palette },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button variant="ghost" size="sm">
            <Palette className="h-4 w-4" />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.id}
            onClick={() => handleThemeChange(themeOption.id as Theme)}
            className={theme === themeOption.id ? 'bg-accent' : ''}
          >
            <themeOption.icon className="mr-2 h-4 w-4" />
            {themeOption.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}