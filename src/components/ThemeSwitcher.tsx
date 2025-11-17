import { useState } from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';

const themes = [
  { name: 'Default', value: 'default', colors: ['#a855f7', '#60a5fa', '#5eead4'] },
  { name: 'Ocean', value: 'ocean', colors: ['#3b82f6', '#06b6d4', '#14b8a6'] },
  { name: 'Sunset', value: 'sunset', colors: ['#f97316', '#ec4899', '#fb923c'] },
  { name: 'Forest', value: 'forest', colors: ['#22c55e', '#10b981', '#14b8a6'] },
  { name: 'Lavender', value: 'lavender', colors: ['#a855f7', '#c084fc', '#9333ea'] },
  { name: 'Warm', value: 'warm', colors: ['#f59e0b', '#fb923c', '#eab308'] },
];

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gentle-hover">
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Theme</DialogTitle>
          <DialogDescription>
            Personalize your FlowFocus experience with beautiful color themes
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              onClick={() => {
                setTheme(themeOption.value as any);
                setOpen(false);
              }}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                hover:scale-105 hover:shadow-lg
                ${theme === themeOption.value 
                  ? 'border-primary shadow-md' 
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-1">
                  {themeOption.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">{themeOption.name}</span>
              </div>
              {theme === themeOption.value && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
