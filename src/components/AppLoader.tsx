import { useEffect, useState } from 'react';
import { cacheManager } from '@/utils/cacheManager';

interface AppLoaderProps {
  onComplete: () => void;
}

export const AppLoader = ({ onComplete }: AppLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    const initializeApp = async () => {
      const startTime = Date.now();
      const minLoadTime = 1000; // Minimum 1 second
      const maxLoadTime = 5000; // Maximum 5 seconds

      try {
        // Progress stages
        setProgress(20);
        setStatus('Checking for updates...');
        
        // Check for updates in background (non-blocking)
        cacheManager.checkForUpdates().catch(console.error);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(40);
        setStatus('Loading features...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(60);
        setStatus('Preparing interface...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(80);
        setStatus('Almost ready...');
        
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(100);
        setStatus('Ready!');

        // Ensure minimum load time for smooth UX
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadTime - elapsed);
        
        await new Promise(resolve => setTimeout(resolve, remainingTime));
        
        // Prevent loading for more than max time
        if (Date.now() - startTime > maxLoadTime) {
          console.warn('App initialization took longer than expected');
        }
        
        onComplete();
      } catch (error) {
        console.error('Initialization error:', error);
        // Still complete loading even if there's an error
        onComplete();
      }
    };

    initializeApp();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      <div className="w-full max-w-md px-8 space-y-8">
        {/* App Logo/Name */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">M</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">MomsNest</h1>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center animate-pulse">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};
