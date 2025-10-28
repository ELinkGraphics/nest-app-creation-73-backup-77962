import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cacheManager } from './utils/cacheManager'

// Check version on app load
const versionChanged = cacheManager.checkVersion();
if (versionChanged) {
  console.log('App version changed, clearing caches...');
  cacheManager.forceRefresh();
} else {
  cacheManager.updateVersion();
}

// Initialize cache management (non-blocking)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service worker updated, reloading...');
    cacheManager.forceRefresh();
  });

  // Immediately check for updates on load
  navigator.serviceWorker.ready.then(async (registration) => {
    await registration.update();
  });

  // Check for updates periodically (in background)
  setTimeout(() => {
    setInterval(async () => {
      const hasUpdate = await cacheManager.checkForUpdates();
      if (hasUpdate) {
        console.log('App update available, applying...');
        await cacheManager.applyUpdate();
      }
    }, 60000); // Check every 60 seconds (increased from 30)
  }, 10000); // Start checking after 10 seconds
}

createRoot(document.getElementById("root")!).render(<App />);
