import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BetaTesterBadgeProps {
  showDays?: boolean;
  size?: 'sm' | 'md';
}

const BetaTesterBadge = ({ showDays = false, size = 'sm' }: BetaTesterBadgeProps) => {
  const { user } = useAuth();
  
  const daysSinceJoined = user?.created_at 
    ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs gap-1' 
    : 'px-3 py-1.5 text-sm gap-1.5';
  
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  
  return (
    <div className={`inline-flex items-center ${sizeClasses} rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30`}>
      <Sparkles className={`${iconSize} text-primary animate-pulse`} />
      <span className="font-medium text-primary">Beta Tester</span>
      {showDays && daysSinceJoined > 0 && (
        <span className="text-muted-foreground">• {daysSinceJoined}d</span>
      )}
    </div>
  );
};

export default BetaTesterBadge;
