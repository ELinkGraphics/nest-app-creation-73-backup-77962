import React, { useState } from 'react';
import { X, Camera, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [links, setLinks] = useState<string[]>(
    Array.isArray(user?.website) ? user.website : user?.website ? [user.website] : ['']
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !user) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addLink = () => {
    setLinks([...links, '']);
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      let avatarUrl = user.avatar;
      let coverUrl = user.coverImage;

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true, contentType: avatarFile.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        avatarUrl = publicUrl;
      }

      // Upload cover image if changed
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const filePath = `${user.id}/cover-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, coverFile, { upsert: true, contentType: coverFile.type });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        coverUrl = publicUrl;
      }

      // Update profile with all changes
      await updateProfile({
        name,
        bio,
        location,
        website: links.filter(link => link.trim() !== ''),
        avatar: avatarUrl,
        coverImage: coverUrl,
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="h-full w-full bg-background overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-muted/50"
            >
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Edit Profile</h1>
            <Button onClick={handleSave} size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Cover Image Section */}
        <div className="relative h-48 bg-muted">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${coverPreview || user.coverImage || 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?auto=format&fit=crop&w=1200&q=80'}')`
            }}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <label htmlFor="cover-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">Change cover</span>
              </div>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
            </label>
          </div>
        </div>

        {/* Avatar Section */}
        <div className="relative -mt-16 px-4 mb-4">
          <div className="relative w-32 h-32">
            <Avatar className="w-32 h-32 ring-4 ring-background">
              <AvatarImage 
                src={avatarPreview || user.avatar} 
                alt={user.name}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 cursor-pointer">
              <div className="p-2 bg-primary rounded-full border-2 border-background shadow-lg">
                <Camera className="h-4 w-4 text-primary-foreground" />
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 py-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
              maxLength={200}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {bio.length}/200
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              maxLength={100}
            />
          </div>

          {/* Links */}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Links
            </label>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                  {links.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLink(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {links.length < 5 && (
                <Button
                  variant="outline"
                  onClick={addLink}
                  className="w-full"
                >
                  Add Link
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
