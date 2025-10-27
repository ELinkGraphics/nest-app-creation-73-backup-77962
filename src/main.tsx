import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cacheManager } from './utils/cacheManager'

// Aggressive cache clearing on app load
async function initializeApp() {
  // Clear all caches on every load to ensure fresh content
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => {
        // Keep only font caches, delete everything else
        if (!cacheName.includes('google-fonts') && !cacheName.includes('gstatic-fonts')) {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        }
      })
    );
  }

  // Check version on app load
  const versionChanged = cacheManager.checkVersion();
  if (versionChanged) {
    console.log('App version changed, forcing complete refresh...');
    cacheManager.forceRefresh();
  } else {
    cacheManager.updateVersion();
  }
}

// Initialize cache management
initializeApp();

if ('serviceWorker' in navigator) {
  // Unregister existing service workers and force fresh registration
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('Service worker unregistered');
    });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service worker updated, reloading...');
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(<App />);
