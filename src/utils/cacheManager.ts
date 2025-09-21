// Cache management utilities for force refresh and cache busting

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

      // Clear local storage (optional - preserving user data for now)
      // localStorage.clear();
      // sessionStorage.clear();

      // Force reload with cache bypass
      window.location.reload();
    } catch (error) {
      console.error('Error during force refresh:', error);
      // Fallback to simple reload
      window.location.reload();
    }
  },

  // Check for app updates
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          return registration.waiting !== null;
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
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