import React, { useState } from 'react';
import { ArrowLeft, Camera, Users, Globe, Lock, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const CreateCircle: React.FC = () => {
  const navigate = useNavigate();
  const [circleName, setCircleName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [category, setCategory] = useState('');

  const handleCreate = () => {
    // Handle circle creation logic here
    console.log('Creating circle:', { name: circleName, description, privacy, category });
    navigate('/');
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
            disabled={!circleName.trim() || !description.trim()}
            className="px-6"
          >
            Create
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Circle Image */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors group">
            <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Add circle photo</p>
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

        {/* Additional Options */}
        <div className="space-y-3">
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <MapPin className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Add location</span>
          </button>
          
          <button className="w-full flex items-center p-3 rounded-lg hover:bg-muted/50 transition-colors">
            <Calendar className="w-5 h-5 text-muted-foreground mr-3" />
            <span className="text-muted-foreground">Schedule events</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCircle;