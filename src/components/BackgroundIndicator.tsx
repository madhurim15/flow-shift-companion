import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Palette } from 'lucide-react';

export const BackgroundIndicator = () => {
  const [currentBackground, setCurrentBackground] = useState('');

  const getDailyBackground = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const backgrounds = [
      { class: 'nature-sunrise', name: 'Golden Sunrise' },
      { class: 'nature-forest', name: 'Forest Canopy' },
      { class: 'nature-ocean', name: 'Ocean Breeze' },
      { class: 'nature-mountain', name: 'Mountain Mist' },
      { class: 'nature-meadow', name: 'Spring Meadow' },
      { class: 'nature-sunset', name: 'Purple Sunset' }
    ];
    return backgrounds[dayOfYear % backgrounds.length];
  };

  useEffect(() => {
    const bg = getDailyBackground();
    setCurrentBackground(bg.name);
  }, []);

  return (
    <div className="fixed top-20 right-4 z-30">
      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border border-border/50 text-xs px-2 py-1 flex items-center gap-1">
        <Palette className="w-3 h-3" />
        {currentBackground}
      </Badge>
    </div>
  );
};