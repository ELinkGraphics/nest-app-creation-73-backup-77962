import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cacheManager } from './utils/cacheManager'

// Initialize cache management (non-blocking)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

  // Check for updates periodically (in background)
  setTimeout(() => {
    setInterval(async () => {
      const hasUpdate = await cacheManager.checkForUpdates();
      if (hasUpdate) {
        console.log('App update available');
      }
    }, 30000); // Check every 30 seconds
  }, 5000); // Start checking after 5 seconds (after initial load)
}

createRoot(document.getElementById("root")!).render(<App />);
