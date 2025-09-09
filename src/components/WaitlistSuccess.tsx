import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Twitter, Share2, ArrowLeft, Sparkles } from 'lucide-react';

interface WaitlistSuccessProps {
  onClose: () => void;
}

export function WaitlistSuccess({ onClose }: WaitlistSuccessProps) {
  const shareText = "Just joined the FlowFocus waitlist! 🌱 Finally, a gentle accountability partner that understands chronic procrastination and works WITH your brain, not against it. No more doomscrolling guilt! #FlowFocus #GentleProductivity";
  const shareUrl = "https://flowfocus.app"; // Update with actual URL

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast here to confirm copy
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="min-h-screen lavender-gradient flex items-center justify-center p-4">
      <Card className="max-w-lg w-full p-8 soft-shadow animate-fade-in-up text-center">
        <div className="mb-6">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Welcome to FlowFocus
          </Badge>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            You're on the waitlist! 🎉
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Thank you for joining our community of mindful achievers. We'll notify you as soon as 
            your early access is ready.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
            <Mail className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">Check your email</p>
              <p className="text-sm text-muted-foreground">We've sent you a confirmation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
            <CheckCircle className="h-5 w-5 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">Early access secured</p>
              <p className="text-sm text-muted-foreground">You'll be among the first to try FlowFocus</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-muted-foreground">
            Help us spread gentle productivity by sharing with friends:
          </p>
          
          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTwitterShare}
              className="gentle-hover"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Share on Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gentle-hover"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={onClose}
            className="gentle-hover"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Homepage
          </Button>
        </div>
      </Card>
    </div>
  );
}