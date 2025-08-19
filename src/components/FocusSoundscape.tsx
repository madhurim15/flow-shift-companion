import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Waves, Cloud, Flame, Coffee, TreePine, Radio, Heart, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Sound {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  isActive: boolean;
  volume: number;
  audio?: HTMLAudioElement;
}

interface FocusSoundscapeProps {
  isTimerRunning: boolean;
  onSoundToggle?: () => void;
}

const FocusSoundscape = ({ isTimerRunning, onSoundToggle }: FocusSoundscapeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [masterVolume, setMasterVolume] = useState([50]);
  const [sounds, setSounds] = useState<Sound[]>([
    {
      id: 'ocean',
      name: 'Ocean Waves',
      icon: Waves,
      url: 'https://www.soundjay.com/misc/sounds/ocean-waves.mp3', // Placeholder - would use actual audio files
      isActive: false,
      volume: 70
    },
    {
      id: 'rain',
      name: 'Rain',
      icon: Cloud,
      url: 'https://example.com/rain.mp3', // Placeholder
      isActive: false,
      volume: 60
    },
    {
      id: 'campfire',
      name: 'Campfire',
      icon: Flame,
      url: 'https://example.com/campfire.mp3', // Placeholder
      isActive: false,
      volume: 50
    },
    {
      id: 'cafe',
      name: 'Café',
      icon: Coffee,
      url: 'https://example.com/cafe.mp3', // Placeholder
      isActive: false,
      volume: 40
    },
    {
      id: 'forest',
      name: 'Forest',
      icon: TreePine,
      url: 'https://example.com/forest.mp3', // Placeholder
      isActive: false,
      volume: 55
    },
    {
      id: 'whitenoise',
      name: 'White Noise',
      icon: Radio,
      url: 'https://example.com/whitenoise.mp3', // Placeholder
      isActive: false,
      volume: 45
    },
    {
      id: 'binaural',
      name: 'Binaural',
      icon: Heart,
      url: 'https://example.com/binaural.mp3', // Placeholder
      isActive: false,
      volume: 35
    },
    {
      id: 'nature',
      name: 'Garden',
      icon: Leaf,
      url: 'https://example.com/garden.mp3', // Placeholder
      isActive: false,
      volume: 50
    }
  ]);

  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Initialize audio elements
  useEffect(() => {
    sounds.forEach(sound => {
      if (!audioRefs.current.has(sound.id)) {
        const audio = new Audio();
        audio.loop = true;
        audio.preload = 'none'; // Only load when needed
        
        // Handle audio loading errors gracefully
        audio.addEventListener('error', () => {
          console.warn(`Could not load audio for ${sound.name}`);
        });
        
        audioRefs.current.set(sound.id, audio);
      }
    });

    return () => {
      // Cleanup audio elements
      audioRefs.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      audioRefs.current.clear();
    };
  }, []);

  // Stop all sounds when timer stops
  useEffect(() => {
    if (!isTimerRunning) {
      stopAllSounds();
    }
  }, [isTimerRunning]);

  const toggleSound = (soundId: string) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const audio = audioRefs.current.get(soundId);
        if (audio) {
          if (!sound.isActive) {
            // Start playing
            audio.src = sound.url;
            audio.volume = (sound.volume / 100) * (masterVolume[0] / 100);
            audio.play().catch(err => {
              console.warn(`Could not play ${sound.name}:`, err);
            });
          } else {
            // Stop playing
            audio.pause();
            audio.currentTime = 0;
          }
        }
        onSoundToggle?.();
        return { ...sound, isActive: !sound.isActive };
      }
      return sound;
    }));
  };

  const updateSoundVolume = (soundId: string, newVolume: number) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const audio = audioRefs.current.get(soundId);
        if (audio && sound.isActive) {
          audio.volume = (newVolume / 100) * (masterVolume[0] / 100);
        }
        return { ...sound, volume: newVolume };
      }
      return sound;
    }));
  };

  const updateMasterVolume = (newVolume: number[]) => {
    setMasterVolume(newVolume);
    
    // Update all active sounds
    sounds.forEach(sound => {
      if (sound.isActive) {
        const audio = audioRefs.current.get(sound.id);
        if (audio) {
          audio.volume = (sound.volume / 100) * (newVolume[0] / 100);
        }
      }
    });
  };

  const stopAllSounds = () => {
    setSounds(prev => prev.map(sound => {
      if (sound.isActive) {
        const audio = audioRefs.current.get(sound.id);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
      return { ...sound, isActive: false };
    }));
  };

  const activeSoundsCount = sounds.filter(s => s.isActive).length;

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto font-normal"
          >
            <div className="flex items-center gap-3">
              {activeSoundsCount > 0 ? (
                <Volume2 className="h-4 w-4 text-primary" />
              ) : (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm">
                Ambient Sounds {activeSoundsCount > 0 && `(${activeSoundsCount} active)`}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {isOpen ? 'Hide' : 'Show'}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4">
          <div className="space-y-4">
            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Master Volume</label>
                <span className="text-xs text-muted-foreground">{masterVolume[0]}%</span>
              </div>
              <Slider
                value={masterVolume}
                onValueChange={updateMasterVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Sound Grid */}
            <div className="grid grid-cols-4 gap-2">
              {sounds.map((sound) => {
                const IconComponent = sound.icon;
                return (
                  <Button
                    key={sound.id}
                    variant={sound.isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSound(sound.id)}
                    className="h-12 flex flex-col gap-1 p-2 text-xs"
                    disabled={!isTimerRunning && sound.isActive} // Prevent starting sounds when timer is off
                  >
                    <IconComponent className="h-3 w-3" />
                    <span className="text-[10px] leading-none">{sound.name}</span>
                  </Button>
                );
              })}
            </div>

            {/* Individual Volume Controls for Active Sounds */}
            {sounds.some(s => s.isActive) && (
              <div className="space-y-3 pt-2 border-t">
                {sounds
                  .filter(sound => sound.isActive)
                  .map((sound) => (
                    <div key={`volume-${sound.id}`} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <sound.icon className="h-3 w-3" />
                          {sound.name}
                        </label>
                        <span className="text-xs text-muted-foreground">{sound.volume}%</span>
                      </div>
                      <Slider
                        value={[sound.volume]}
                        onValueChange={(value) => updateSoundVolume(sound.id, value[0])}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ))}
              </div>
            )}

            {activeSoundsCount > 0 && (
              <Button
                onClick={stopAllSounds}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Stop All Sounds
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default FocusSoundscape;