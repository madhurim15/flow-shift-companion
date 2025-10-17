import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Square, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VoiceReflection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const prompt = searchParams.get("prompt") || "What am I really feeling right now?";

  useEffect(() => {
    document.title = "Voice Reflection - FlowLight";
  }, []);

  useEffect(() => {
    if (!isRecording) return;

    const timer = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const saveRecording = () => {
    toast({
      title: "Voice note saved ✨",
      description: "Your reflection has been recorded"
    });
    setTimeout(() => navigate("/"), 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        <div className="space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Voice Reflection</h1>
            <p className="text-muted-foreground mb-6">{prompt}</p>
          </div>

          <div className="space-y-6">
            {!isRecording && recordingTime === 0 && (
              <Button onClick={startRecording} size="lg" className="w-full max-w-md mx-auto">
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <div className="space-y-6">
                <div className="bg-primary/10 rounded-full w-32 h-32 mx-auto flex items-center justify-center animate-pulse">
                  <Mic className="h-16 w-16 text-primary" />
                </div>
                <div className="text-4xl font-bold text-foreground">{formatTime(recordingTime)}</div>
                <p className="text-muted-foreground">Recording... Speak your thoughts</p>
                <Button onClick={stopRecording} size="lg" variant="destructive">
                  <Square className="mr-2 h-5 w-5" />
                  Stop Recording
                </Button>
              </div>
            )}

            {!isRecording && recordingTime > 0 && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <div className="text-2xl font-bold text-foreground mb-2">Recording Complete</div>
                  <div className="text-muted-foreground">Duration: {formatTime(recordingTime)}</div>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={startRecording} variant="outline">
                    <Mic className="mr-2 h-5 w-5" />
                    Record Again
                  </Button>
                  <Button onClick={saveRecording} size="lg">
                    <Save className="mr-2 h-5 w-5" />
                    Save Reflection
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceReflection;
