import { useState } from 'react';
import { BookOpen, Mic, Camera, Flame, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { MicroJournal } from './MicroJournal';
import { VoiceNotes } from './VoiceNotes';
import { PhotoCapture } from './PhotoCapture';
import { EnhancedStreakDisplay } from './EnhancedStreakDisplay';

type Tab = 'journal' | 'voice' | 'photo' | 'streak';

export const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const { toast } = useToast();

  const tabs = [
    { id: 'journal' as Tab, icon: BookOpen, label: 'Journal', color: 'text-emerald-500' },
    { id: 'voice' as Tab, icon: Mic, label: 'Voice', color: 'text-blue-500' },
    { id: 'photo' as Tab, icon: Camera, label: 'Photo', color: 'text-purple-500' },
    { id: 'streak' as Tab, icon: Flame, label: 'Streaks', color: 'text-orange-500' },
  ];

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(activeTab === tabId ? null : tabId);
  };

  const handleAdvancedSettings = () => {
    toast({
      title: "Coming Soon ✨",
      description: "Vision Board, Long-term Goals & More!",
      duration: 3000
    });
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
    <TooltipProvider>
      {/* Tab Content Overlay */}
      {activeTab && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in"
            onClick={() => setActiveTab(null)}
          />
          
      {/* Modal Content - Centered */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-md max-h-[80vh] bg-background/98 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 overflow-hidden pointer-events-auto animate-scale-in">
          <div 
            className="max-h-[80vh] overflow-y-auto"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 96px)' }}
          >
            {renderTabContent()}
          </div>
        </div>
      </div>
        </>
      )}

      {/* Bottom Navigation Bar - Hide when modal is open */}
      {!activeTab && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-md border-t border-border/50 shadow-lg">
          <div className="flex items-center justify-around px-2 py-3 max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-3 px-4 rounded-2xl transition-all duration-200 min-h-[60px] min-w-[60px] hover:bg-muted/50 hover:scale-105 active:scale-95 ${
                    isActive ? 'bg-primary/10 scale-105' : ''
                  }`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {tab.label}
                  </span>
                </Button>
              );
            })}
            
            {/* Advanced Settings Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex flex-col items-center gap-1 h-auto py-3 px-4 rounded-2xl transition-all duration-200 min-h-[60px] min-w-[60px] hover:bg-muted/50 hover:scale-105 active:scale-95 opacity-60"
                  onClick={handleAdvancedSettings}
                >
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming Soon: Vision Board, Goals & More!</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
    </TooltipProvider>
  );
};
