import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { cacheManager } from '@/utils/cacheManager';

const UpdateNotifier: React.FC = () => {
  const queryClient = useQueryClient();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const checkForUpdates = async () => {
      try {
        const hasUpdate = await cacheManager.checkForUpdates();
        if (hasUpdate && !updateAvailable) {
          setUpdateAvailable(true);
          setShowNotification(true);
        }
      } catch (error) {
        console.error('Update check failed:', error);
      }
    };

    // Initial check
    checkForUpdates();

    // Check every 5 seconds for immediate updates
    checkInterval = setInterval(checkForUpdates, 5000);

    // Also check on page visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkForUpdates();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateAvailable]);

  const handleUpdate = async () => {
    try {
      // Clear React Query cache first
      await cacheManager.clearQueryCache(queryClient);
      await cacheManager.applyUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      // Fallback to force refresh
      await cacheManager.forceRefresh();
    }
  };

  const handleForceRefresh = async () => {
    // Clear React Query cache before force refresh
    await cacheManager.clearQueryCache(queryClient);
    await cacheManager.forceRefresh();
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-primary text-primary-foreground p-4 rounded-xl shadow-2xl max-w-sm w-[calc(100%-2rem)] animate-slide-down">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-base">🎉 New Update Available!</h4>
          <p className="text-xs opacity-95 mt-1.5 leading-relaxed">
            We've made improvements to MomsNest. Update now to get the latest features and fixes.
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUpdate}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium active:scale-95 transition-transform"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Update Now
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowNotification(false)}
          className="text-xs text-primary-foreground/80 hover:bg-primary-foreground/10 px-3"
        >
          Later
        </Button>
      </div>
    </div>
  );
};

export default UpdateNotifier;