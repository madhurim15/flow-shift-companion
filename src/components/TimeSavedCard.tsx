import { useEffect, useState } from "react";
import { calculateTimeSaved, formatTimeSaved } from "@/utils/timeSaved";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp } from "lucide-react";

export const TimeSavedCard = () => {
  const [timeSaved, setTimeSaved] = useState({
    timeSavedThisWeek: 0,
    timeSavedTotal: 0,
    actionsThisWeek: 0,
    actionsTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimeSaved = async () => {
      try {
        const data = await calculateTimeSaved();
        setTimeSaved(data);
      } catch (error) {
        console.error('Error fetching time saved:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSaved();
  }, []);

  if (loading) {
    return null;
  }

  if (timeSaved.actionsTotal === 0) {
    return null;
  }

  return (
    <Card className="soft-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          Time Saved
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatTimeSaved(timeSaved.timeSavedThisWeek)}
            </p>
            <p className="text-sm text-muted-foreground">This week</p>
          </div>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total saved</span>
            <span className="font-semibold text-foreground">
              {formatTimeSaved(timeSaved.timeSavedTotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Actions completed</span>
            <span className="font-semibold text-foreground">
              {timeSaved.actionsTotal}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
