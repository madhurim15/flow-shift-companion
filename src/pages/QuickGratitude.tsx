import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Sparkles } from "lucide-react";

const QuickGratitude = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState(["", "", ""]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "Gratitude - FlowFocus";
  }, []);

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
    const filledItems = items.filter(item => item.trim());
    if (filledItems.length === 0) {
      toast({
        title: "Add at least one item",
        description: "Write something you're grateful for",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const gratitudeEntry = filledItems.join("\n• ");
      await supabase.from("daily_journals").insert({
        user_id: user.id,
        entry: `Gratitude list:\n• ${gratitudeEntry}`,
        prompt: "What am I grateful for today?"
      });

      toast({
        title: "Saved ✨",
        description: "Your gratitude has been recorded"
      });

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Failed to save gratitude:", error);
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
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gratitude List</h1>
            <p className="text-muted-foreground">Name 3 things you're grateful for right now</p>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-2xl font-bold text-muted-foreground">{index + 1}.</span>
                <Input
                  placeholder="Something you're grateful for..."
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  className="text-base"
                />
              </div>
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Save Gratitude"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickGratitude;
