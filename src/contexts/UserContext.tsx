import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserPreferences, UserContextType } from '@/types/user';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle auth errors by signing out
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsLoading(false);
        window.location.href = '/login';
        return;
      }
      
      if (event === 'TOKEN_REFRESHED' && !session) {
        // Token refresh failed, sign out
        await supabase.auth.signOut();
        window.location.href = '/login';
        return;
      }

      setSession(session);
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        await supabase.auth.signOut();
        setIsLoading(false);
        window.location.href = '/login';
        return;
      }

      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_stats (
            followers_count,
            following_count,
            posts_count,
            videos_count,
            replies_count,
            saves_count
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        // If profile fetch fails, it might be an auth issue
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          await supabase.auth.signOut();
          window.location.href = '/login';
          return;
        }
        throw error;
      }

      if (profile) {
        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          initials: profile.initials,
          avatar: profile.avatar_url || '',
          avatarColor: profile.avatar_color || '#4B164C',
          coverImage: profile.cover_image_url || '',
          bio: profile.bio || '',
          subtitle: profile.subtitle || '',
          location: profile.location || '',
          website: profile.website ? [profile.website] : [],
          joinedDate: profile.joined_date,
          isVerified: profile.is_verified,
          isOnline: profile.is_online,
          stats: {
            followers: profile.profile_stats?.[0]?.followers_count || 0,
            following: profile.profile_stats?.[0]?.following_count || 0,
            replies: profile.profile_stats?.[0]?.replies_count || 0,
            posts: profile.profile_stats?.[0]?.posts_count || 0,
            videos: profile.profile_stats?.[0]?.videos_count || 0,
            saves: profile.profile_stats?.[0]?.saves_count || 0,
          }
        };
        setUser(userProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          bio: updates.bio,
          subtitle: updates.subtitle,
          location: updates.location,
          website: Array.isArray(updates.website) ? updates.website[0] : updates.website,
          avatar_url: updates.avatar,
          cover_image_url: updates.coverImage,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
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
    if (!session?.user) return;
    
    try {
      setIsLoading(true);
      await fetchUserProfile(session.user.id);
      setError(null);
    } catch (err) {
      setError('Failed to refresh user data');
    } finally {
      setIsLoading(false);
    }
  };

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