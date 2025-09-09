import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WaitlistForm } from '@/components/WaitlistForm';
import { WaitlistSuccess } from '@/components/WaitlistSuccess';
import { 
  CheckCircle, 
  Target, 
  Timer, 
  Brain, 
  ArrowRight, 
  Sparkles, 
  Smartphone,
  Heart,
  Zap,
  TrendingUp,
  Clock,
  Smile
} from 'lucide-react';

interface LandingProps {
  onShowAuth: () => void;
}

export default function Landing({ onShowAuth }: LandingProps) {
  const [showWaitlistSuccess, setShowWaitlistSuccess] = useState(false);

  if (showWaitlistSuccess) {
    return <WaitlistSuccess onClose={() => setShowWaitlistSuccess(false)} />;
  }

  return (
    <div className="min-h-screen lavender-gradient">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">FlowFocus</span>
        </div>
        <Button variant="outline" onClick={onShowAuth} className="gentle-hover">
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 animate-fade-in floating-animation">
            🌱 Gentle Productivity Companion
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 animate-fade-in">
            An accountability partner that{' '}
            <span className="flow-gradient">understands you</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            FlowFocus is a gentle productivity companion that works with your brain—not against it. 
            <br className="hidden md:block" />
            <strong>No guilt. No shame. Just smart nudges at the right time.</strong>
          </p>

          <div className="animate-fade-in mb-8">
            <WaitlistForm onSuccess={() => setShowWaitlistSuccess(true)} />
          </div>

          <p className="text-sm text-muted-foreground">
            Join 2,500+ people breaking the procrastination cycle. No spam, just gentle progress.
          </p>
        </div>
      </section>

      {/* Pain Point Section - NEW */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12">
            Still stuck in the <span className="text-primary">doomscroll spiral?</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-8 soft-shadow gentle-hover">
              <Smartphone className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3 text-foreground">The "5 Minute" Trap</h3>
              <p className="text-muted-foreground">
                You open your phone for "5 minutes" and lose an hour to endless scrolling.
              </p>
            </Card>
            
            <Card className="p-8 soft-shadow gentle-hover">
              <Heart className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3 text-foreground">Guilt Cycle</h3>
              <p className="text-muted-foreground">
                You feel guilty but can't break the cycle. The shame just makes it worse.
              </p>
            </Card>
            
            <Card className="p-8 soft-shadow gentle-hover">
              <Timer className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-3 text-foreground">App Burnout</h3>
              <p className="text-muted-foreground">
                You've tried harsh productivity apps—only to uninstall them within days.
              </p>
            </Card>
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-6 py-2">
              💜 How FlowFocus helps
            </Badge>
          </div>
        </div>
      </section>

      {/* Solution & Features Section - NEW 4-Card Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Why FlowFocus is Different
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Most apps demand discipline. FlowFocus builds it gently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 soft-shadow gentle-hover group">
            <div className="mb-4">
              <Zap className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Personalized Nudges
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sent at key moments when you need them most
            </p>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>

          <Card className="p-6 soft-shadow gentle-hover group">
            <div className="mb-4">
              <TrendingUp className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Dopamine Trade-Offs
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Replace mindless scrolling with tiny wins
            </p>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>

          <Card className="p-6 soft-shadow gentle-hover group">
            <div className="mb-4">
              <Smile className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Mood & Energy Tracker
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Understand your patterns, not punish yourself
            </p>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>

          <Card className="p-6 soft-shadow gentle-hover group">
            <div className="mb-4">
              <Target className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Long-term Goal Tracking
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay inspired with all-in-one simplicity
            </p>
            <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
          </Card>
        </div>
      </section>

      {/* Pricing Section - NEW */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Try FlowFocus Free
          </h2>
          
          <Card className="p-8 soft-shadow">
            <div className="mb-6">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">
                ✅ Join Waitlist → Be first to try our 14-day free trial
              </h3>
              <p className="text-muted-foreground">No credit card required</p>
            </div>
            
            <div className="border-t pt-6">
              <p className="text-lg text-muted-foreground mb-6">
                After launch: just <strong>₹199/month (India)</strong> or <strong>$4.99/month (Global)</strong>
              </p>
              
              <WaitlistForm onSuccess={() => setShowWaitlistSuccess(true)} />
            </div>
          </Card>
        </div>
      </section>

      {/* Gentle Accountability Section - NEW */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Your gentle accountability partner for chronic procrastination
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>Break long-term goal paralysis with bite-sized daily actions</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>Combat phone addiction with mindful intervention nudges</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>Transform doomscrolling into intentional progress</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>No shame, no guilt - just supportive guidance</p>
                </div>
              </div>
            </div>
            
            <Card className="p-8 soft-shadow floating-animation">
              <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-4 text-center">
                Built for your brain, not against it
              </h3>
              <p className="text-muted-foreground text-center">
                FlowFocus understands that productivity isn't about forcing yourself into rigid systems. 
                It's about working with your natural rhythms and energy patterns.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <blockquote className="text-3xl md:text-4xl font-bold text-foreground mb-12 italic">
            "Don't fight procrastination alone. Let FlowFocus be your calm guide."
          </blockquote>
          
          <div className="mb-8">
            <WaitlistForm onSuccess={() => setShowWaitlistSuccess(true)} />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>14-day free trial after launch</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/20">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2025 FlowFocus. Built with 💜 and care.</p>
        </div>
      </footer>
    </div>
  );
}