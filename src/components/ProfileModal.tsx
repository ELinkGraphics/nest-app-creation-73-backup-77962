import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserProfile from '@/components/UserProfile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleMessageClick = () => {
    // Handle message action
    console.log('Message clicked');
  };

  const handleSettingsClick = () => {
    // Handle settings action
    console.log('Settings clicked');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-fade-in safe-area-full">
      <div className="h-full w-full bg-background overflow-y-auto scroll-optimized scrollbar-thin overscroll-behavior-contain animate-scale-in">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <h1 className="text-xl font-bold text-foreground">Profile</h1>
            
            <div className="w-10" /> {/* Spacer for center alignment */}
          </div>
        </div>

        {/* Profile Content */}
        <UserProfile 
          showHeader={false}
          onMessageClick={handleMessageClick}
          onSettingsClick={handleSettingsClick}
        />
      </div>
    </div>
  );
};

export default ProfileModal;