// Cache management utilities for force refresh and cache busting

const APP_VERSION_KEY = 'app_version';
const CURRENT_VERSION = Date.now().toString();

export const cacheManager = {
  // Force refresh the page and clear all caches
  async forceRefresh() {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
      }

      // Clear version tracking to force fresh load
      localStorage.removeItem(APP_VERSION_KEY);
      sessionStorage.clear();

      // Force reload with cache bypass (hard reload)
      window.location.reload();
    } catch (error) {
      console.error('Error during force refresh:', error);
      // Fallback to simple reload
      window.location.reload();
    }
  },

  // Check for app updates with active polling
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Actively check for updates
          await registration.update();
          return registration.waiting !== null;
        }
      } catch (error) {
        // Silently ignore check errors to avoid noisy logs
      }
    }
    return false;
  },

  // Apply pending updates
  async applyUpdate() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      } catch (error) {
        console.error('Error applying update:', error);
      }
    }
  },

  // Add cache busting query parameter
  bustCache(url: string): string {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}_t=${Date.now()}`;
  },

  // Check if app version has changed
  checkVersion(): boolean {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    const hasVersionChanged = storedVersion && storedVersion !== CURRENT_VERSION;
    
    if (!storedVersion) {
      localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
    }
    
    return hasVersionChanged;
  },

  // Update version tracking
  updateVersion() {
    localStorage.setItem(APP_VERSION_KEY, CURRENT_VERSION);
  },

  // Clear React Query cache (requires queryClient instance)
  async clearQueryCache(queryClient?: any) {
    if (queryClient) {
      queryClient.clear();
      console.log('React Query cache cleared');
    }
  }
};

// Add keyboard shortcut for force refresh in development
if (import.meta.env.DEV) {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+R or Cmd+Shift+R for force refresh
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      cacheManager.forceRefresh();
    }
  });
}