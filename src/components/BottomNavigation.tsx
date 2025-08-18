import { useState } from 'react';
import { BookOpen, Mic, Camera, Flame, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MicroJournal } from './MicroJournal';
import { VoiceNotes } from './VoiceNotes';
import { PhotoCapture } from './PhotoCapture';
import { EnhancedStreakDisplay } from './EnhancedStreakDisplay';

type Tab = 'journal' | 'voice' | 'photo' | 'streak' | 'settings';

export const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  const tabs = [
    { id: 'journal' as Tab, icon: BookOpen, label: 'Journal', color: 'text-emerald-500' },
    { id: 'voice' as Tab, icon: Mic, label: 'Voice', color: 'text-blue-500' },
    { id: 'photo' as Tab, icon: Camera, label: 'Photo', color: 'text-purple-500' },
    { id: 'streak' as Tab, icon: Flame, label: 'Streak', color: 'text-orange-500' },
    { id: 'settings' as Tab, icon: Settings, label: 'Settings', color: 'text-muted-foreground' },
  ];

  const handleTabClick = (tabId: Tab) => {
    if (tabId === 'settings') return; // Disabled for MVP
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'journal':
        return <MicroJournal onClose={() => setActiveTab(null)} />;
      case 'voice':
        return <VoiceNotes onClose={() => setActiveTab(null)} />;
      case 'photo':
        return <PhotoCapture onClose={() => setActiveTab(null)} />;
      case 'streak':
        return <EnhancedStreakDisplay onClose={() => setActiveTab(null)} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Tab Content Overlay */}
      {activeTab && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="h-full overflow-auto pb-20">
            {renderTabContent()}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.id === 'settings';

            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isActive ? 'bg-muted' : ''
                } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted/50'}`}
                onClick={() => handleTabClick(tab.id)}
                disabled={isDisabled}
              >
                <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                <span className={`text-xs ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
                {isDisabled && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 text-xs px-1 py-0">
                    Soon
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
};