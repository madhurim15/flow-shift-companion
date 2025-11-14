import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trophy } from "lucide-react";

const WinLog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [win, setWin] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "Win Log - FlowLight";
  }, []);

  const handleSave = async () => {
    if (!win.trim()) {
      toast({
        title: "Add your win",
        description: "What's something you accomplished?",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await supabase.from("daily_journals").insert({
        user_id: user.id,
        entry: `🏆 Today's win: ${win}`,
        prompt: "What's one win from today?"
      });

      toast({
        title: "Win logged! 🎉",
        description: "Celebrate this achievement"
      });

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Failed to save win:", error);
      toast({
        title: "Failed to save",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Daily Win</h1>
            <p className="text-muted-foreground">What's one thing you accomplished today?</p>
          </div>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="I completed..."
                value={win}
                onChange={(e) => setWin(e.target.value)}
                className="text-base"
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {win.length}/150 characters
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Examples of wins:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Had a difficult conversation</li>
                <li>Completed a task I've been avoiding</li>
                <li>Took time for self-care</li>
                <li>Made progress on a project</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !win.trim()}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Log Win"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WinLog;
