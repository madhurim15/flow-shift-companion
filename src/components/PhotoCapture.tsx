import { useState, useEffect, useRef } from 'react';
import { X, Camera, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhotoCaptureProps {
  onClose: () => void;
}

interface DailyPhoto {
  id: string;
  file_path: string;
  caption: string | null;
  created_at: string;
}

export const PhotoCapture = ({ onClose }: PhotoCaptureProps) => {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<DailyPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxCaptionLength = 150;

  useEffect(() => {
    fetchRecentPhotos();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const fetchRecentPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_photos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || loading) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('daily-photos')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('daily_photos')
        .insert({
          user_id: user.id,
          file_path: fileName,
          caption: caption.trim() || null,
          file_size: selectedFile.size,
        });

      if (dbError) throw dbError;

      toast({
        title: "Beautiful moment captured! 📸",
        description: "Your photo and reflection have been saved.",
      });

      setSelectedFile(null);
      setCaption('');
      fetchRecentPhotos();
    } catch (error) {
      toast({
        title: "Couldn't save photo",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photo: DailyPhoto) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('daily-photos')
        .remove([photo.file_path]);

      // Delete from database
      const { error } = await supabase
        .from('daily_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      toast({
        title: "Photo deleted",
        description: "Your photo has been removed.",
      });

      fetchRecentPhotos();
    } catch (error) {
      toast({
        title: "Couldn't delete photo",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getPhotoUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from('daily-photos')
      .download(filePath);
    
    return data ? URL.createObjectURL(data) : null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-4 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Daily Photos</h2>
            <p className="text-xs text-muted-foreground">Capture mindful moments</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-bounce">
        <div className="p-4 space-y-4 pb-28">
          {/* Upload Interface */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Capture a mindful moment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Input */}
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {selectedFile ? 'Change Photo' : 'Select Photo'}
                </Button>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Caption Input */}
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, maxCaptionLength))}
                placeholder="What made this moment special? (optional)"
                className="resize-none min-h-[60px] text-sm"
                maxLength={maxCaptionLength}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {caption.length}/{maxCaptionLength}
                </span>
                
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  size="sm"
                  className="gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Moment'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Photos */}
          {recentPhotos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Moments</h3>
              <div className="grid grid-cols-2 gap-3">
                {recentPhotos.map((photo) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    onDelete={deletePhoto}
                    getPhotoUrl={getPhotoUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PhotoCardProps {
  photo: DailyPhoto;
  onDelete: (photo: DailyPhoto) => void;
  getPhotoUrl: (filePath: string) => Promise<string | null>;
}

const PhotoCard = ({ photo, onDelete, getPhotoUrl }: PhotoCardProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    getPhotoUrl(photo.file_path).then(setImageUrl);
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [photo.file_path]);

  return (
    <Card className="border-muted overflow-hidden">
      <div className="relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Daily moment"
            className="w-full h-24 object-cover"
          />
        ) : (
          <div className="w-full h-24 bg-muted flex items-center justify-center">
            <Camera className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(photo)}
          className="absolute top-1 right-1 w-6 h-6 p-0 bg-background/80 hover:bg-background"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      
      <CardContent className="p-2">
        {photo.caption && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {photo.caption}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(photo.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};