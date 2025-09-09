import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WaitlistFormProps {
  onSuccess: () => void;
}

export function WaitlistForm({ onSuccess }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !fullName) {
      toast({
        title: "Please fill in all fields",
        description: "We need your name and email to add you to the waitlist.",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email address",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([
          {
            email: email.toLowerCase().trim(),
            full_name: fullName.trim(),
            referral_source: 'landing_page'
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "You're already on the waitlist!",
            description: "Thanks for your enthusiasm. We'll be in touch soon!",
          });
        } else {
          throw error;
        }
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment. If the problem persists, contact support.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto soft-shadow gentle-hover">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-4">
          <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-foreground">Join the Waitlist</h3>
          <p className="text-sm text-muted-foreground">Be the first to experience gentle productivity</p>
        </div>
        
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full gentle-hover" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Joining waitlist...
            </>
          ) : (
            <>
              Join Waitlist
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          By joining, you agree to receive updates about FlowFocus. Unsubscribe anytime.
        </p>
      </form>
    </Card>
  );
}