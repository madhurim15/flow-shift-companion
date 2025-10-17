import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const QuickJournal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [entry, setEntry] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const prompt = searchParams.get("prompt") || "What was I avoiding just now?";

  useEffect(() => {
    document.title = "Quick Journal - FlowLight";
  }, []);

  const handleSave = async () => {
    if (!entry.trim()) {
      toast({
        title: "Entry required",
        description: "Please write something before saving",
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
        entry: entry.trim(),
        prompt
      });

      toast({
        title: "Saved ✨",
        description: "Your reflection has been saved"
      });

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Failed to save journal:", error);
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
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Quick Journal</h1>
            <p className="text-muted-foreground">{prompt}</p>
          </div>

          <Textarea
            placeholder="Start writing..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="min-h-[300px] text-base"
            autoFocus
          />

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickJournal;
