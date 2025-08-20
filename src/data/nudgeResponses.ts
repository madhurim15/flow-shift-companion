import { Heart, Sun, Brain, Coffee, Activity, Clock, BookOpen, Mic, Calendar, Wind } from 'lucide-react';

export type NudgeResponseType = 
  | 'mood_check' 
  | 'set_intention' 
  | 'quick_stretch' 
  | 'mini_journal' 
  | 'voice_note' 
  | 'energy_reset' 
  | 'reflect_day' 
  | 'plan_evening' 
  | 'gratitude_note' 
  | 'tomorrow_prep' 
  | 'wind_down';

export interface NudgeResponse {
  id: NudgeResponseType;
  title: string;
  description: string;
  icon: any;
  duration: string;
  actionType: 'modal' | 'navigate' | 'immediate';
  targetRoute?: string;
}

export const nudgeResponses: Record<string, NudgeResponse[]> = {
  morning: [
    {
      id: 'set_intention',
      title: 'Set daily intention',
      description: 'Quick text input for today\'s focus',
      icon: Sun,
      duration: '2 min',
      actionType: 'modal'
    },
    {
      id: 'quick_stretch',
      title: 'Quick morning stretch',
      description: '3-minute guided breathing/stretching',
      icon: Activity,
      duration: '3 min',
      actionType: 'modal'
    },
    {
      id: 'mood_check',
      title: 'Check my mood',
      description: 'Opens mood tracker for dice roll',
      icon: Heart,
      duration: '1 min',
      actionType: 'immediate'
    }
  ],
  afternoon: [
    {
      id: 'energy_reset',
      title: 'Quick energy reset',
      description: 'Desk stretches, water break, or deep breaths',
      icon: Coffee,
      duration: '2 min',
      actionType: 'modal'
    },
    {
      id: 'mood_check',
      title: 'Check my mood',
      description: 'Opens mood tracker for appropriate action',
      icon: Heart,
      duration: '1 min',
      actionType: 'immediate'
    },
    {
      id: 'mini_journal',
      title: 'Mini journal',
      description: 'Quick text: "Right now I\'m feeling..."',
      icon: BookOpen,
      duration: '2 min',
      actionType: 'modal'
    }
  ],
  evening: [
    {
      id: 'reflect_day',
      title: 'Reflect on my day',
      description: 'Journal prompt: "Today I..."',
      icon: BookOpen,
      duration: '5 min',
      actionType: 'navigate',
      targetRoute: '/focus'
    },
    {
      id: 'voice_note',
      title: 'Voice note',
      description: 'Record quick voice reflection',
      icon: Mic,
      duration: '3 min',
      actionType: 'modal'
    },
    {
      id: 'plan_evening',
      title: 'Plan evening',
      description: 'Set gentle intention for evening hours',
      icon: Calendar,
      duration: '2 min',
      actionType: 'modal'
    }
  ],
  night: [
    {
      id: 'gratitude_note',
      title: 'Gratitude note',
      description: 'Simple text: "Today I\'m grateful for..."',
      icon: Heart,
      duration: '2 min',
      actionType: 'modal'
    },
    {
      id: 'tomorrow_prep',
      title: 'Tomorrow prep',
      description: 'Set out clothes, plan morning, etc.',
      icon: Calendar,
      duration: '3 min',
      actionType: 'modal'
    },
    {
      id: 'wind_down',
      title: 'Wind-down activity',
      description: 'Gentle suggestions: tea, reading, stretching',
      icon: Wind,
      duration: '5 min',
      actionType: 'modal'
    }
  ]
};

export const enhancedReminderMessages = {
  morning: "Good morning! 🌅 What's one small thing that would make today feel meaningful?",
  afternoon: "Midday check-in 🌱 How's your energy? Want to try a 2-minute reset?",
  evening: "Day's winding down 🌆 How did you show up for yourself today?",
  night: "Before you rest 🌙 What's one thing you're proud of today?"
};