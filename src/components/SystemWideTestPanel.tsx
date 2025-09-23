import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSystemWideMonitoring } from '@/hooks/useSystemWideMonitoring';
import { SystemWideInterventionDialog } from './SystemWideInterventionDialog';
import { getInterventionMessage, type PsychologicalState } from '@/utils/systemWideInterventionUtils';
import { Smartphone, TestTube, Zap, Brain, AlertCircle } from 'lucide-react';

export const SystemWideTestPanel: React.FC = () => {
  const { isMonitoring } = useSystemWideMonitoring();
  const [selectedApp, setSelectedApp] = useState<string>('com.instagram.android');
  const [selectedState, setSelectedState] = useState<PsychologicalState>('seeking_stimulation');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [currentSession, setCurrentSession] = useState<any>(null);

  const testApps = [
    { package: 'com.instagram.android', name: 'Instagram', category: 'Social Media' },
    { package: 'com.google.android.youtube', name: 'YouTube', category: 'Entertainment' },
    { package: 'com.android.chrome', name: 'Chrome', category: 'Browsing' },
    { package: 'com.amazon.mShop.android.shopping', name: 'Amazon', category: 'Shopping' },
    { package: 'com.zhiliaoapp.musically', name: 'TikTok', category: 'Social Media' }
  ];

  const psychologicalStates: { value: PsychologicalState; label: string; description: string }[] = [
    { 
      value: 'seeking_stimulation', 
      label: 'Seeking Stimulation', 
      description: 'Mind is restless, looking for mental engagement' 
    },
    { 
      value: 'avoidance', 
      label: 'Avoidance Behavior', 
      description: 'Using apps to avoid difficult tasks or emotions' 
    },
    { 
      value: 'emotional_regulation', 
      label: 'Emotional Regulation', 
      description: 'Using technology to manage big feelings' 
    },
    { 
      value: 'impulse_driven', 
      label: 'Impulse-Driven', 
      description: 'Acting on immediate urges without reflection' 
    }
  ];

  const handleStartSession = async () => {
    // Legacy method - now handled by enhanced intervention system
    console.log('Starting session for:', selectedApp);
    setCurrentSession({ app_package_name: selectedApp });
  };

  const handleEndSession = async () => {
    // Legacy method - now handled by enhanced intervention system
    console.log('Ending session for:', selectedApp);
    setCurrentSession(null);
  };

  const handleTestIntervention = async () => {
    const message = getInterventionMessage(selectedState, 'gentle_nudge', selectedApp.split('.').pop(), new Date().getHours());
    setTestMessage(message);
    setTestDialogOpen(true);
    
    // Log test intervention
    console.log('Testing intervention for:', selectedApp, selectedState);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>System-Wide Monitoring Test Panel</span>
          </CardTitle>
          <CardDescription>
            Test the psychology-first intervention system with different apps and scenarios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Monitoring Status */}
          <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                System-Wide Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {!isMonitoring && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <AlertCircle className="h-3 w-3" />
                <span>Enable on mobile for full functionality</span>
              </Badge>
            )}
          </div>

          {/* App Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select App to Test</label>
              <Select value={selectedApp} onValueChange={setSelectedApp}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {testApps.map(app => (
                    <SelectItem key={app.package} value={app.package}>
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4" />
                        <span>{app.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {app.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Psychological State</label>
              <Select value={selectedState} onValueChange={(value: PsychologicalState) => setSelectedState(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {psychologicalStates.map(state => (
                    <SelectItem key={state.value} value={state.value}>
                      <div className="flex items-center space-x-2">
                        <Brain className="h-4 w-4" />
                        <div>
                          <div>{state.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {state.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Controls */}
          <div className="space-y-4">
            <h4 className="font-medium">App Session Simulation</h4>
            <div className="flex space-x-3">
              <Button 
                onClick={handleStartSession}
                disabled={currentSession !== null}
                variant="outline"
              >
                Start App Session
              </Button>
              
              <Button 
                onClick={handleEndSession}
                disabled={currentSession === null}
                variant="outline"
              >
                End App Session
              </Button>
              
              {currentSession && (
                <Badge variant="default" className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Session Active</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Intervention Testing */}
          <div className="space-y-4">
            <h4 className="font-medium">Psychology-First Intervention Testing</h4>
            <div className="p-4 border rounded-lg space-y-3">
              <div className="text-sm text-muted-foreground">
                Test how FlowLight would gently intervene based on the selected psychological state
              </div>
              
              <Button 
                onClick={handleTestIntervention}
                className="w-full"
                variant="default"
              >
                <Zap className="mr-2 h-4 w-4" />
                Test Psychology-First Intervention
              </Button>
            </div>
          </div>

          {/* Information */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              How it Works
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Monitors app usage across your entire device (on mobile)</li>
              <li>• Detects psychological states behind app usage patterns</li>
              <li>• Provides gentle, non-judgmental interventions</li>
              <li>• Offers mindful alternatives instead of blocking</li>
              <li>• Tracks behavioral improvements over time</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Intervention Dialog */}
      <SystemWideInterventionDialog
        isOpen={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        message={testMessage}
        appName={testApps.find(app => app.package === selectedApp)?.name}
        psychologicalState={selectedState}
        onAlternativeChosen={(alternative) => {
          console.log('User chose alternative:', alternative);
          setTestDialogOpen(false);
        }}
        onDismiss={() => {
          console.log('User dismissed intervention');
          setTestDialogOpen(false);
        }}
      />
    </div>
  );
};