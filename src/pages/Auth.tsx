
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with zod
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'Invalid input';
      toast({
        title: "Please check your input",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    // Check network connectivity
    if (!navigator.onLine) {
      toast({
        title: "No internet connection",
        description: "Please check your network and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        console.error('Auth error:', result.error);
        toast({
          title: "Oops, something went wrong",
          description: result.error.message || "Please try again in a moment.",
          variant: "destructive"
        });
      } else {
        if (isSignUp) {
          toast({
            title: "Welcome to Flowlight! ✨",
            description: "Check your email to confirm your account, then come back to start flowing."
          });
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Something unexpected happened",
        description: "Please try again. We're here when you're ready.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(250,60%,95%)] to-[hsl(280,55%,93%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Geometric Shapes */}
      <div className="floating-shape w-48 h-48 bg-gradient-to-br from-[hsl(270,60%,75%)] to-[hsl(270,60%,85%)] top-20 left-10 animate-float-gentle" style={{ animationDelay: '0s' }} />
      <div className="floating-shape w-40 h-40 bg-gradient-to-br from-[hsl(210,65%,75%)] to-[hsl(210,65%,85%)] bottom-32 right-20 animate-float-slow" style={{ animationDelay: '1.5s' }} />
      <div className="floating-shape w-36 h-36 bg-gradient-to-br from-[hsl(180,55%,75%)] to-[hsl(180,55%,85%)] top-1/2 right-10 animate-float-drift" style={{ animationDelay: '3s' }} />
      
      <Card className="max-w-md mx-auto p-8 shadow-xl border border-border/50 bg-background relative z-10 animate-scale-in">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div>
              <Sparkles className="h-10 w-10 text-primary mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {isSignUp ? 'Join Flowlight' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp 
                ? 'Create your safe space for gentle progress'
                : 'Ready to check in with yourself?'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2 text-left">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Your name (optional)
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="What should we call you?"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
                />
              </div>
            )}
            
            <div className="space-y-2 text-left">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
              />
            </div>

            <div className="space-y-2 text-left">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? "Choose a secure password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-300 focus:scale-[1.02] focus:shadow-lg focus:shadow-primary/20"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isSignUp ? 'Creating your space...' : 'Signing you in...'}</span>
                </div>
              ) : (
                <>
                  {isSignUp ? 'Create my account' : 'Sign in'} 
                  <Heart className="ml-2 h-4 w-4 animate-soft-pulse" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "New here? Let's get you started"
              }
            </button>
          </div>

          {isSignUp && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your data is private and secure. We're here to support your journey, 
              not to judge it. 💙
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Auth;
