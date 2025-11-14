import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Target } from "lucide-react";

const IntentionReset = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [intention, setIntention] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "Intention Reset - FlowLight";
  }, []);

  const handleSave = async () => {
    if (!intention.trim()) {
      toast({
        title: "Set an intention",
        description: "What do you want from the next 30 minutes?",
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
        entry: `🎯 Intention reset: ${intention}`,
        prompt: "What do I want from the next 30 minutes?"
      });

      toast({
        title: "Intention set ✨",
        description: "Now go make it happen"
      });

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Failed to save intention:", error);
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
              <Target className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Intention Reset</h1>
            <p className="text-muted-foreground">What do you want from the next 30 minutes?</p>
          </div>

          <div className="space-y-4">
            <Textarea
              placeholder="In the next 30 minutes, I want to..."
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              className="min-h-[120px]"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {intention.length}/200 characters
            </p>

            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Make it specific and actionable:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Focus on one work task without distractions</li>
                <li>Connect with someone I care about</li>
                <li>Do something creative just for me</li>
                <li>Rest and recharge without guilt</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving || !intention.trim()}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Set Intention"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntentionReset;
