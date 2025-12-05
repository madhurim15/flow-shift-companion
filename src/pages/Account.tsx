import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialContext } from '@/contexts/TrialContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, MessageSquare, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import UserMenu from '@/components/UserMenu';
import ReminderSystem from '@/components/ReminderSystem';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Account = () => {
  const { user } = useAuth();
  const { isInTrial, daysRemaining, trialEnded } = useTrialContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [preferredName, setPreferredName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Fetch user profile
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('preferred_name, full_name')
        .eq('id', user.id)
        .single();
      
      if (data) {
        const name = data.preferred_name || data.full_name?.split(' ')[0] || '';
        setPreferredName(name);
        setNameInput(name);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  const handleSaveName = async () => {
    if (!user || !nameInput.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          preferred_name: nameInput.trim(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setPreferredName(nameInput.trim());
      setIsEditingName(false);
      toast({
        title: 'Name updated',
        description: 'Nudges will now address you by this name.'
      });
    } catch (error) {
      toast({
        title: 'Failed to save',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  const trialProgress = isInTrial ? ((14 - daysRemaining) / 14) * 100 : 100;

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)'
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-xl">✨</span>
            <span className="font-medium">Flowlight</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Account Settings
            </div>
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile Info with Name Editing */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          
          {/* Preferred Name */}
          <div className="border-t border-border pt-4 mt-4">
            <label className="text-sm font-medium text-foreground">Preferred Name</label>
            <p className="text-xs text-muted-foreground mb-2">
              This is how nudges will address you
            </p>
            
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1"
                  autoFocus
                />
                <Button 
                  size="sm" 
                  onClick={handleSaveName}
                  disabled={isSaving || !nameInput.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    setIsEditingName(false);
                    setNameInput(preferredName);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-foreground">
                  {preferredName || 'Not set'}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsEditingName(true)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Trial Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Beta Access</h3>
          </div>
          
          {isInTrial ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trial period</span>
                <span className="font-medium text-foreground">{daysRemaining} days left</span>
              </div>
              <Progress value={trialProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Thanks for being a beta tester! Your feedback shapes FlowLight.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Beta testing period complete
              </p>
              <p className="text-xs text-muted-foreground">
                As a valued beta tester, you have continued access. Thank you!
              </p>
            </div>
          )}
        </Card>

        {/* Feedback */}
        <Card 
          className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate('/feedback')}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Share Feedback</h3>
              <p className="text-xs text-muted-foreground">Help us improve FlowLight</p>
            </div>
            <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
          </div>
        </Card>

        {/* Notification Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
          <ReminderSystem />
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Taking care of your wellbeing, one mindful moment at a time ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Account;
