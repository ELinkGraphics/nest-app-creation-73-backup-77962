import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Users, Globe, Lock, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCircleMutations } from '@/hooks/useCircleMutations';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

const CreateCircle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createCircle, isCreating } = useCircleMutations();
  const [circleName, setCircleName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!user) {
      toast.error('You must be logged in to create a circle');
      return;
    }

    if (!circleName.trim()) {
      toast.error('Please enter a circle name');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    try {
      const circle = await createCircle({
        name: circleName,
        description: description,
        category: category,
        location: location || undefined,
        is_private: privacy === 'private',
        avatar: avatarFile || undefined,
      }, user.id);

      toast.success('Circle created successfully!');
      navigate(`/circle/${circle.id}`);
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const categories = [
    'Community',
    'Sports',
    'Education',
    'Technology',
    'Art & Design',
    'Music',
    'Business',
    'Health & Wellness',
    'Travel',
    'Food & Cooking',
    'Gaming',
    'Other'
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
          <h1 className="text-lg font-semibold">Create Circle</h1>
          <Button 
            onClick={handleCreate}
            disabled={!circleName.trim() || !description.trim() || !category || isCreating}
            className="px-6"
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Circle Image */}
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 mx-auto rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group overflow-hidden"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Circle avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {avatarPreview ? 'Change circle photo' : 'Add circle photo (optional)'}
          </p>
        </div>

        {/* Circle Name */}
        <div className="space-y-2">
          <Label htmlFor="circle-name">Circle Name</Label>
          <Input
            id="circle-name"
            placeholder="Enter circle name"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what your circle is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="e.g., San Francisco, CA or Online"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Privacy Settings */}
        <div className="space-y-2">
          <Label>Privacy</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPrivacy('public')}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                privacy === 'public'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Globe className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Public</p>
                <p className="text-xs text-muted-foreground">Anyone can join</p>
              </div>
            </button>
            
            <button
              onClick={() => setPrivacy('private')}
              className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                privacy === 'private'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Lock className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Private</p>
                <p className="text-xs text-muted-foreground">Invite only</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCircle;
