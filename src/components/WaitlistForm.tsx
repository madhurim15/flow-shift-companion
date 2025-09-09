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
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !firstName) {
      toast({
        title: "Please fill in all fields",
        description: "We need your first name and email to add you to the waitlist.",
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
            first_name: firstName.trim(),
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
    <Card className="p-8 max-w-lg mx-auto soft-shadow gentle-hover lavender-gradient border-primary/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Join Waitlist</h3>
          <p className="text-muted-foreground">Get early access to gentle productivity</p>
        </div>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
              className="w-full h-12 px-4 text-lg"
            />
          </div>
          
          <div className="relative">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full h-12 px-4 text-lg"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          size="lg"
          className="w-full h-12 text-lg gentle-hover bg-primary hover:bg-primary/90" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              Securing your spot...
            </>
          ) : (
            <>
              Secure My Spot
              <ArrowRight className="h-5 w-5 ml-3" />
            </>
          )}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          By joining, you'll get first access to FlowFocus and gentle productivity updates. 
          <br />
          Unsubscribe anytime. We respect your inbox.
        </p>
      </form>
    </Card>
  );
}