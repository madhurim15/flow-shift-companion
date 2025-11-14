import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Save } from "lucide-react";

const PhotoCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "Photo of the Day - FlowLight";
  }, []);

  const handleSave = async () => {
    if (!caption.trim() && !photoNote.trim()) {
      toast({
        title: "Add a caption or note",
        description: "Describe your moment",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const entry = `📸 Photo of the day\nCaption: ${caption}\n\n${photoNote}`;
      await supabase.from("daily_journals").insert({
        user_id: user.id,
        entry,
        prompt: "What moment do you want to capture today?"
      });

      toast({
        title: "Moment captured ✨",
        description: "Your memory has been saved"
      });

      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Failed to save photo note:", error);
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
              <Camera className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Photo of the Day</h1>
            <p className="text-muted-foreground">Capture a moment that represents right now</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Take a photo with your camera app</p>
            <p className="text-sm text-muted-foreground/80">Then come back here to add context</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quick Caption
              </label>
              <Input
                placeholder="What's happening in this moment?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Optional Note
              </label>
              <Textarea
                placeholder="How are you feeling? What do you want to remember?"
                value={photoNote}
                onChange={(e) => setPhotoNote(e.target.value)}
                className="min-h-[100px]"
                maxLength={300}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Saving..." : "Save Moment"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCapture;
