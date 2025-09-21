import React, { useState } from 'react';
import { ArrowLeft, Camera, MapPin, Users, Globe, Image, Video, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [postText, setPostText] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  const handlePost = () => {
    // Handle post creation logic here
    console.log('Creating post:', { text: postText, privacy });
    navigate('/');
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
            disabled={!postText.trim()}
            className="px-6"
          >
            Post
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Your Name</p>
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

        {/* Media Options */}
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group">
            <div className="text-center">
              <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Add Photo</span>
            </div>
          </button>
          
          <button className="flex items-center justify-center p-4 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors group">
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