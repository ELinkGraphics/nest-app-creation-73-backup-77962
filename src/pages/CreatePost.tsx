import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, MapPin, Users, Globe, Image, Video, Mic, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { usePostMutations } from '@/hooks/usePostMutations';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createPost, isCreating } = usePostMutations();
  const [postText, setPostText] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_PHOTOS = 10;

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...selectedMedia, ...files].slice(0, MAX_PHOTOS);
    
    const previews = await Promise.all(
      newFiles.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );
    
    setSelectedMedia(newFiles);
    setMediaPreviews(previews);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await createPost(
        { content: postText, media: selectedMedia.length > 0 ? selectedMedia : undefined },
        user.id
      );
      navigate('/');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe },
    { value: 'friends', label: 'Friends', icon: Users },
  ];

  return (
    <div className="min-h-[100dvh] bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-lg font-semibold">Create Post</h1>
          <Button 
            onClick={handlePost}
            disabled={!postText.trim() || isCreating}
            className="px-6"
          >
            {isCreating ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">{user?.initials || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user?.name || 'Your Name'}</p>
            <div className="flex items-center space-x-2">
              {privacyOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => setPrivacy(option.value as 'public' | 'friends')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                      privacy === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Post Content */}
        <Textarea
          placeholder="What's on your mind?"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          className="min-h-[120px] border-none p-0 text-lg resize-none focus-visible:ring-0 placeholder:text-muted-foreground"
        />

        {/* Media Preview */}
        {mediaPreviews.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-1 -right-1 p-1 bg-black/70 rounded-full text-white hover:bg-black/90 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedMedia.length}/{MAX_PHOTOS} photos
            </p>
          </div>
        )}

        {/* Media Options */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleMediaSelect}
          className="hidden"
        />
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
          >
            <div className="text-center">
              <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Add Photo</span>
            </div>
          </button>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group"
          >
            <div className="text-center">
              <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Add Video</span>
            </div>
          </button>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Add location</span>
          </button>
          
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Mic className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Record voice note</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;