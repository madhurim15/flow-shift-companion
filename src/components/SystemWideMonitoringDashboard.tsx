import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemWideMonitoring } from '@/hooks/useSystemWideMonitoring';
import { SystemWideInterventionDialog } from './SystemWideInterventionDialog';
import { getInterventionInsights } from '@/utils/systemWideInterventionUtils';
import { 
  Smartphone, 
  Brain, 
  TrendingUp, 
  Clock, 
  Heart,
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const SystemWideMonitoringDashboard: React.FC = () => {
  const { 
    isMonitoring, 
    dailyUsageStats, 
    activeInterventions, 
    detectedPatterns,
    respondToIntervention 
  } = useSystemWideMonitoring();

  const [interventionDialogOpen, setInterventionDialogOpen] = useState(false);
  const [currentIntervention, setCurrentIntervention] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<number>(0);

  // Load intervention insights
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await getInterventionInsights(7);
        setInsights(data || []);
        
        // Calculate weekly progress (interventions accepted vs dismissed)
        const accepted = data?.filter(i => i.user_response === 'accepted_alternative').length || 0;
        const total = data?.length || 1;
        setWeeklyProgress((accepted / total) * 100);
      } catch (error) {
        console.error('Error loading insights:', error);
      }
    };

    loadInsights();
  }, []);

  // Show intervention dialog when new intervention is active
  useEffect(() => {
    if (activeInterventions.length > 0 && !interventionDialogOpen) {
      const latest = activeInterventions[activeInterventions.length - 1];
      setCurrentIntervention(latest);
      setInterventionDialogOpen(true);
    }
  }, [activeInterventions, interventionDialogOpen]);

  const formatUsageTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPatternSeverity = (pattern: any) => {
    if (pattern.detected_frequency > 10) return 'high';
    if (pattern.detected_frequency > 5) return 'medium';
    return 'low';
  };

  const handleInterventionResponse = async (alternative: any) => {
    // Legacy method - now handled by enhanced intervention system
    console.log('Alternative chosen:', alternative);
    setInterventionDialogOpen(false);
  };

  const handleInterventionDismiss = async () => {
    // Legacy method - now handled by enhanced intervention system
    console.log('Intervention dismissed');
    setInterventionDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Digital Wellness Guardian</h2>
          <p className="text-muted-foreground">
            Your psychology-first companion for mindful device usage
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Interventions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.filter(i => {
              const today = new Date().toDateString();
              return new Date(i.created_at).toDateString() === today;
            }).length}</div>
            <p className="text-xs text-muted-foreground">
              Gentle nudges provided
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(weeklyProgress)}%</div>
            <p className="text-xs text-muted-foreground">
              Mindful choices made
            </p>
            <Progress value={weeklyProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Patterns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{detectedPatterns.length}</div>
            <p className="text-xs text-muted-foreground">
              Behavioral patterns detected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apps Monitored</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(dailyUsageStats).length}</div>
            <p className="text-xs text-muted-foreground">
              Apps tracked today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Activity</TabsTrigger>
          <TabsTrigger value="patterns">Behavioral Patterns</TabsTrigger>
          <TabsTrigger value="insights">Weekly Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's App Usage</CardTitle>
              <CardDescription>
                Time spent across monitored apps with psychological context
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(dailyUsageStats).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(dailyUsageStats).map(([app, seconds]) => (
                    <div key={app} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">
                          {app.split('.').pop()?.replace('android', '') || app}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatUsageTime(seconds as number)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No app usage recorded yet today
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detected Behavioral Patterns</CardTitle>
              <CardDescription>
                Psychology-first analysis of your digital habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              {detectedPatterns.length > 0 ? (
                <div className="space-y-4">
                  {detectedPatterns.map((pattern, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Brain className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium capitalize">
                            {pattern.pattern_type.replace('_', ' ')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Detected {pattern.detected_frequency} times
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={getPatternSeverity(pattern) === 'high' ? 'destructive' : 
                                  getPatternSeverity(pattern) === 'medium' ? 'default' : 'secondary'}
                        >
                          {getPatternSeverity(pattern)}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {pattern.successful_interventions} helped
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No behavioral patterns detected yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress & Insights</CardTitle>
              <CardDescription>
                How your mindful digital habits are developing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Interventions This Week</div>
                    <div className="text-2xl font-bold">{insights.length}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Mindful Choices Made</div>
                    <div className="text-2xl font-bold">
                      {insights.filter(i => i.user_response === 'accepted_alternative').length}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Interventions</h4>
                  {insights.slice(0, 5).map((insight, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-4 w-4 text-muted-foreground" />
                        <div className="text-sm">
                          {insight.detected_state.replace('_', ' ')} → {insight.intervention_type.replace('_', ' ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {insight.user_response === 'accepted_alternative' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {insight.user_response?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Intervention Dialog */}
      {currentIntervention && (
        <SystemWideInterventionDialog
          isOpen={interventionDialogOpen}
          onClose={() => setInterventionDialogOpen(false)}
          message={currentIntervention.intervention_message}
          appName={currentIntervention.app_package_name}
          psychologicalState={currentIntervention.detected_state}
          onAlternativeChosen={handleInterventionResponse}
          onDismiss={handleInterventionDismiss}
        />
      )}
    </div>
  );
};