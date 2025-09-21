import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserPreferences, UserContextType } from '@/types/user';
import { toast } from '@/hooks/use-toast';

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data - in a real app, this would come from your backend/Supabase
const mockUser: UserProfile = {
  id: "user_1",
  name: "Bezawit",
  username: "beza",
  email: "bezawit@example.com",
  initials: "BZ",
  avatar: "https://images.unsplash.com/photo-1494790108755-2616c90db5f3?auto=format&fit=crop&w=300&h=300&q=80",
  coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=60",
  bio: "Passionate about preserving nature and ensuring a sustainable future for the next generation.",
  subtitle: "Preserve Nature, Ensure Future",
  location: "San Francisco, CA",
  website: [
    "https://bezawit.dev",
    "https://github.com/bezawit",
    "https://linkedin.com/in/bezawit",
    "https://twitter.com/bezawit"
  ],
  joinedDate: "2023-01-15",
  isVerified: true,
  isOnline: true,
  stats: {
    followers: 501,
    following: 163,
    replies: 353,
    posts: 24,
    videos: 8,
    saves: 45
  }
};

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  notifications: {
    posts: true,
    comments: true,
    followers: true,
    messages: true,
  },
  privacy: {
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: true,
  }
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Load persisted user data from localStorage or use mock data
  const getInitialUser = () => {
    try {
      const persistedUser = localStorage.getItem('account_owner_profile');
      if (persistedUser) {
        const parsed = JSON.parse(persistedUser);
        console.log('Loaded persisted user:', parsed);
        // Force refresh with new mock data if website is still string
        if (typeof parsed.website === 'string') {
          console.log('Outdated user data found, using fresh mock data');
          localStorage.removeItem('account_owner_profile');
          return mockUser;
        }
        return parsed;
      }
    } catch (error) {
      console.warn('Failed to parse persisted user data:', error);
    }
    console.log('Using fresh mock user data:', mockUser);
    return mockUser;
  };

  const [user, setUser] = useState<UserProfile | null>(getInitialUser());
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading user data (optional for demo purposes)
  useEffect(() => {
    const loadUser = async () => {
      try {
        // For demo purposes, user is already loaded
        // In a real app, this would be an actual API call
        console.log('User context initialized with mock data');
      } catch (err) {
        setError('Failed to load user data');
        console.error('Error loading user:', err);
      }
    };

    loadUser();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Persist account owner's profile data
      localStorage.setItem('account_owner_profile', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (err) {
      setError('Failed to update profile');
      toast({
        title: "Update failed",
        description: "Could not update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setPreferences(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been saved.",
      });
    } catch (err) {
      setError('Failed to update preferences');
      toast({
        title: "Update failed",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      // Keep persisted user data on refresh - don't reset to mock data
      const currentUser = user || getInitialUser();
      setUser(currentUser);
      setError(null);
    } catch (err) {
      setError('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Persist user data whenever it changes
  React.useEffect(() => {
    if (user) {
      localStorage.setItem('account_owner_profile', JSON.stringify(user));
    }
  }, [user]);

  const value: UserContextType = {
    user,
    preferences,
    isLoading,
    error,
    updateProfile,
    updatePreferences,
    refreshUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};