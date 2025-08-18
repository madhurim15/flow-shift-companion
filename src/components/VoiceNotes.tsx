import { useState, useEffect, useRef } from 'react';
import { X, Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';

interface VoiceNotesProps {
  onClose: () => void;
}

interface VoiceNote {
  id: string;
  title: string | null;
  duration_seconds: number | null;
  file_path: string;
  created_at: string;
}

export const VoiceNotes = ({ onClose }: VoiceNotesProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recentNotes, setRecentNotes] = useState<VoiceNote[]>([]);
  const [playingNote, setPlayingNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { toast } = useToast();
  const maxDuration = 60; // 60 seconds max

  useEffect(() => {
    fetchRecentNotes();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchRecentNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentNotes(data || []);
    } catch (error) {
      console.error('Error fetching voice notes:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = handleRecordingStop;

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
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

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const fileName = `${user.id}/${Date.now()}.webm`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('voice_notes')
        .insert({
          user_id: user.id,
          file_path: fileName,
          duration_seconds: recordingTime,
          file_size: audioBlob.size,
          title: `Voice note ${new Date().toLocaleDateString()}`,
        });

      if (dbError) throw dbError;

      toast({
        title: "Voice note saved! 🎙️",
        description: `Captured ${recordingTime}s of your thoughts.`,
      });

      fetchRecentNotes();
    } catch (error) {
      toast({
        title: "Couldn't save voice note",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const playNote = async (note: VoiceNote) => {
    try {
      if (playingNote === note.id) {
        audioRef.current?.pause();
        setPlayingNote(null);
        return;
      }

      const { data } = await supabase.storage
        .from('voice-notes')
        .download(note.file_path);

      if (data) {
        const url = URL.createObjectURL(data);
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setPlayingNote(null);
        audioRef.current.play();
        setPlayingNote(note.id);
      }
    } catch (error) {
      toast({
        title: "Couldn't play voice note",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteNote = async (note: VoiceNote) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('voice-notes')
        .remove([note.file_path]);

      // Delete from database
      const { error } = await supabase
        .from('voice_notes')
        .delete()
        .eq('id', note.id);

      if (error) throw error;

      toast({
        title: "Voice note deleted",
        description: "Your voice note has been removed.",
      });

      fetchRecentNotes();
    } catch (error) {
      toast({
        title: "Couldn't delete note",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-medium">Voice Notes</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Recording Interface */}
      <Card>
        <CardContent className="p-4 text-center space-y-4">
          <div className="flex flex-col items-center gap-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-100 animate-pulse' : 'bg-muted'
            }`}>
              {isRecording ? (
                <Square 
                  className="w-6 h-6 text-red-600 cursor-pointer" 
                  onClick={stopRecording}
                />
              ) : (
                <Mic 
                  className="w-6 h-6 text-blue-500 cursor-pointer" 
                  onClick={startRecording}
                />
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {isRecording ? (
                <>Recording... {formatTime(recordingTime)}</>
              ) : (
                'Tap to record (max 60s)'
              )}
            </div>
          </div>

          {loading && (
            <Badge variant="secondary">Saving your voice note...</Badge>
          )}
        </CardContent>
      </Card>

      {/* Recent Voice Notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Voice Notes</h3>
          {recentNotes.map((note) => (
            <Card key={note.id} className="border-muted">
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {note.duration_seconds ? formatTime(note.duration_seconds) : '0:00'} • {' '}
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playNote(note)}
                  >
                    {playingNote === note.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNote(note)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};