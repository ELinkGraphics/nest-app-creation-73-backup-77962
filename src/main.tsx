import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { cacheManager } from './utils/cacheManager'

// Initialize cache management
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

  // Check for updates periodically
  setInterval(async () => {
    const hasUpdate = await cacheManager.checkForUpdates();
    if (hasUpdate) {
      console.log('App update available');
    }
  }, 30000); // Check every 30 seconds
}

createRoot(document.getElementById("root")!).render(<App />);
