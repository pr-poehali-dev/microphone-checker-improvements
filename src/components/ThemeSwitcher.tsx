import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'green';

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'green');
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'green') {
      root.classList.add('green');
    }
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const getThemeIcon = (themeName: Theme) => {
    switch (themeName) {
      case 'light':
        return 'Sun';
      case 'dark':
        return 'Moon';
      case 'green':
        return 'Leaf';
      default:
        return 'Sun';
    }
  };

  const getThemeLabel = (themeName: Theme) => {
    switch (themeName) {
      case 'light':
        return 'Светлая';
      case 'dark':
        return 'Темная';
      case 'green':
        return 'Зеленая';
      default:
        return 'Светлая';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            className="w-14 h-14 rounded-full shadow-lg border-2 hover:scale-110 transition-transform"
          >
            <Icon name={getThemeIcon(theme)} size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => changeTheme('light')}
            className="cursor-pointer gap-2"
          >
            <Icon name="Sun" size={18} />
            <span>Светлая</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeTheme('dark')}
            className="cursor-pointer gap-2"
          >
            <Icon name="Moon" size={18} />
            <span>Темная</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => changeTheme('green')}
            className="cursor-pointer gap-2"
          >
            <Icon name="Leaf" size={18} />
            <span>Зеленая</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
