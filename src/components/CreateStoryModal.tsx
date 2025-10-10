import React, { useState, useRef } from 'react';
import { X, Camera, Image as ImageIcon, Video, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/hooks/use-toast';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStory: (storyData: any) => void;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose, onCreateStory }) => {
  const { user } = useUser();
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreateStory = async () => {
    if (!selectedMedia) {
      toast({
        title: "No media selected",
        description: "Please select an image or video for your story.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to create a story.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload media to Supabase storage
      const fileExt = selectedMedia.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading story to path:', filePath);
      
      const { error: uploadError } = await (await import('@/integrations/supabase/client')).supabase.storage
        .from('story-media')
        .upload(filePath, selectedMedia, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = (await import('@/integrations/supabase/client')).supabase.storage
        .from('story-media')
        .getPublicUrl(filePath);

      // Create story record in database
      console.log('Creating story record with URL:', publicUrl);
      
      const { error: dbError } = await (await import('@/integrations/supabase/client')).supabase
        .from('stories')
        .insert({
          user_id: user.id,
          media_url: publicUrl,
          media_type: selectedMedia.type.startsWith('video/') ? 'video' : 'image',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }
      
      // Notify parent to refresh stories
      onCreateStory(null);
      
      toast({
        title: "Story created!",
        description: "Your story has been shared successfully.",
      });
      
      // Reset form
      setSelectedMedia(null);
      setPreviewUrl('');
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Story creation error:', error);
      toast({
        title: "Upload failed",
        description: "Could not create your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Story</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
          {/* Media Selection */}
          {!selectedMedia ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="flex justify-center gap-4 mb-4">
                <Camera className="size-8 text-gray-400" />
                <ImageIcon className="size-8 text-gray-400" />
                <Video className="size-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Share a moment from your day</p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="size-4 mr-2" />
                Choose Photo or Video
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden">
                {selectedMedia.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    controls
                  />
                )}
                <button
                  onClick={() => {
                    setSelectedMedia(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Add a caption (optional)
                </label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What's on your mind?"
                  className="resize-none"
                  rows={3}
                  maxLength={150}
                />
                <p className="text-xs text-gray-500 text-right">
                  {caption.length}/150
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedMedia && (
          <div className="p-4 border-t bg-gray-50">
            <Button
              onClick={handleCreateStory}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Creating Story...' : 'Share Story'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStoryModal;