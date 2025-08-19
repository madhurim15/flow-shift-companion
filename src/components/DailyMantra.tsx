import { Sparkles } from 'lucide-react';

const mantras = [
  "Every small step counts towards your bigger dreams ✨",
  "Progress over perfection, always 🌱",
  "You have the power to change your day, one moment at a time 💫",
  "Trust the process, embrace the journey 🌟",
  "Your potential is limitless, start where you are 🚀",
  "Small actions create big transformations 🌸",
  "Today is full of possibilities waiting for you 🌅",
  "You are stronger than you think, braver than you feel 💪",
  "Focus on progress, not perfection 📈",
  "Every moment is a fresh start 🔄",
  "You have everything within you to succeed 🎯",
  "Believe in your ability to figure things out 🧠",
  "Take it one breath, one step, one moment at a time 🫧",
  "Your consistency creates your destiny 🌊",
  "Small wins lead to big victories 🏆",
  "You are exactly where you need to be right now 🗺️",
  "Growth happens outside your comfort zone 🌳",
  "Your mindset shapes your reality 🎨",
  "Every challenge is an opportunity in disguise 💎",
  "You are writing your story, one day at a time 📖",
  "Be patient with yourself, change takes time 🕰️",
  "Your energy flows where your attention goes 🌈",
  "Start before you're ready, learn as you go 🎪",
  "You are capable of amazing things 🎭",
  "Today's small actions are tomorrow's big results 🎁",
  "Your journey is unique, honor your pace 🛤️",
  "Every ending is a new beginning 🌙",
  "You have survived 100% of your difficult days 💝",
  "Focus on what you can control, release what you cannot 🍃",
  "Your dreams are valid and achievable 🌌",
  "Celebrate how far you've come 🎉"
];

export const DailyMantra = () => {
  // Get consistent daily mantra based on date
  const getDailyMantra = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    return mantras[dayOfYear % mantras.length];
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border/50">
      <div className="container py-4">
        <div className="flex items-center justify-center gap-3 text-center">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground leading-relaxed max-w-2xl">
            {getDailyMantra()}
          </p>
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
        </div>
      </div>
    </div>
  );
};