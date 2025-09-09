import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WaitlistForm } from '@/components/WaitlistForm';
import { WaitlistSuccess } from '@/components/WaitlistSuccess';
import { CheckCircle, Target, Timer, Brain, Star, ArrowRight, Sparkles } from 'lucide-react';

interface LandingProps {
  onShowAuth: () => void;
}

export default function Landing({ onShowAuth }: LandingProps) {
  const [showWaitlistSuccess, setShowWaitlistSuccess] = useState(false);

  const features = [
    {
      icon: <Timer className="h-6 w-6 text-primary" />,
      title: "Gentle Productivity",
      description: "No harsh deadlines. Just mindful action and progress at your own pace."
    },
    {
      icon: <Brain className="h-6 w-6 text-primary" />,
      title: "Mood-Aware Flow",
      description: "Actions that adapt to how you feel, making productivity sustainable and enjoyable."
    },
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: "Bite-Sized Actions",
      description: "Break overwhelm into manageable moments. Small steps, meaningful progress."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Creative Professional",
      content: "FlowFocus helped me rediscover my love for creating without the burnout.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Software Developer",
      content: "Finally, a productivity app that respects my mental health and energy levels.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Graduate Student",
      content: "The mood-based approach changed how I tackle my studies completely.",
      rating: 5
    }
  ];

  if (showWaitlistSuccess) {
    return <WaitlistSuccess onClose={() => setShowWaitlistSuccess(false)} />;
  }

  return (
    <div className="min-h-screen nature-sunrise">
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
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 animate-fade-in-up">
            🌱 Gentle Productivity for Modern Life
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
            Productivity that 
            <span className="flow-gradient"> flows </span>
            with your mood
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up">
            Stop fighting your energy. Start flowing with it. FlowFocus adapts to how you feel, 
            turning productivity into a sustainable, enjoyable practice.
          </p>

          <div className="animate-fade-in-up">
            <WaitlistForm onSuccess={() => setShowWaitlistSuccess(true)} />
          </div>

          <p className="text-sm text-muted-foreground mt-4">
            Join 2,500+ mindful achievers. No spam, just gentle nudges.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Productivity without the pressure
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            FlowFocus respects your natural rhythms and energy levels, making progress feel effortless.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 soft-shadow gentle-hover animate-fade-in-up">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Tired of productivity apps that ignore how you feel?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                  <p>Rigid schedules that don't account for low energy days</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                  <p>Overwhelming task lists that create more anxiety</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 rounded-full bg-destructive mt-2 flex-shrink-0"></div>
                  <p>Guilt when you can't stick to impossible standards</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                FlowFocus works with your natural rhythms
              </h3>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>Mood-aware suggestions that match your energy</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>Gentle nudges that support, never pressure</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <p>Progress tracking that celebrates small wins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16 bg-card/30 backdrop-blur-sm rounded-lg mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Loved by mindful achievers everywhere
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 soft-shadow gentle-hover">
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "{testimonial.content}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to find your flow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join the waitlist for early access to gentle, sustainable productivity.
          </p>
          
          <WaitlistForm onSuccess={() => setShowWaitlistSuccess(true)} />
          
          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>14-day free trial</span>
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
          <p>&copy; 2024 FlowFocus. Gentle productivity for mindful achievers.</p>
        </div>
      </footer>
    </div>
  );
}