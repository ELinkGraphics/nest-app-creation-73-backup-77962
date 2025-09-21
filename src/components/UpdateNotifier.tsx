import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { cacheManager } from '@/utils/cacheManager';

const UpdateNotifier: React.FC = () => {
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

    // Check every 30 seconds
    checkInterval = setInterval(checkForUpdates, 30000);

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [updateAvailable]);

  const handleUpdate = async () => {
    try {
      await cacheManager.applyUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      // Fallback to force refresh
      await cacheManager.forceRefresh();
    }
  };

  const handleForceRefresh = async () => {
    await cacheManager.forceRefresh();
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">Update Available</h4>
          <p className="text-xs opacity-90 mt-1">
            A new version of the app is ready. Refresh to get the latest features.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary-foreground hover:bg-primary-foreground/20 h-6 w-6"
          onClick={() => setShowNotification(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUpdate}
          className="flex items-center gap-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Update
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleForceRefresh}
          className="text-xs bg-primary-foreground/10 border-primary-foreground/30 hover:bg-primary-foreground/20"
        >
          Force Refresh
        </Button>
      </div>
    </div>
  );
};

export default UpdateNotifier;