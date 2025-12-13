import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Square, Save, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const VoiceReflection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const prompt = searchParams.get("prompt") || "What am I really feeling right now?";
  const maxDuration = 120; // 2 minutes max

  useEffect(() => {
    document.title = "Voice Reflection - FlowFocus";
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setAudioBlob(null);
      setAudioUrl(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      toast({
        title: "Microphone access needed",
        description: "Please allow microphone access to record voice notes.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const saveRecording = async () => {
    if (!audioBlob) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/${Date.now()}.webm`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const title = `Reflection: ${prompt.substring(0, 40)}${prompt.length > 40 ? '...' : ''}`;
      const { error: dbError } = await supabase
        .from('voice_notes')
        .insert({
          user_id: user.id,
          file_path: fileName,
          duration_seconds: recordingTime,
          file_size: audioBlob.size,
          title: title,
        });

      if (dbError) throw dbError;

      toast({
        title: "Voice reflection saved! 🎙️",
        description: `Captured ${formatTime(recordingTime)} of your thoughts.`,
      });
      
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error('Error saving voice note:', error);
      toast({
        title: "Couldn't save recording",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
            {!isRecording && !audioBlob && (
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

            {!isRecording && audioBlob && (
              <div className="space-y-6">
                <div className="bg-card border rounded-lg p-6">
                  <div className="text-2xl font-bold text-foreground mb-2">Recording Complete</div>
                  <div className="text-muted-foreground mb-4">Duration: {formatTime(recordingTime)}</div>
                  
                  {/* Playback preview */}
                  <Button 
                    onClick={togglePlayback} 
                    variant="outline" 
                    size="sm"
                    className="mb-2"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Preview
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Play Preview
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <Button onClick={startRecording} variant="outline">
                    <Mic className="mr-2 h-5 w-5" />
                    Record Again
                  </Button>
                  <Button onClick={saveRecording} size="lg" disabled={isSaving}>
                    <Save className="mr-2 h-5 w-5" />
                    {isSaving ? 'Saving...' : 'Save Reflection'}
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
