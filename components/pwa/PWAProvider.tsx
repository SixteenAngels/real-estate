import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Download, X, Smartphone, Wifi, WifiOff, RefreshCw, 
  Home, Share2, Settings, Bell
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { PWAInstallPrompt } from '../../types';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  showInstallPrompt: boolean;
  installApp: () => Promise<void>;
  dismissInstallPrompt: () => void;
  showInstallBanner: () => void;
  updateAvailable: boolean;
  updateApp: () => void;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    // Return safe defaults if PWA provider fails
    console.warn('usePWA called outside PWAProvider, returning safe defaults');
    return {
      isInstallable: false,
      isInstalled: false,
      isOnline: navigator?.onLine ?? true,
      showInstallPrompt: false,
      installApp: async () => {},
      dismissInstallPrompt: () => {},
      showInstallBanner: () => {},
      updateAvailable: false,
      updateApp: () => {}
    };
  }
  return context;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<PWAInstallPrompt | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Check if app is installed
  const checkIfInstalled = useCallback(() => {
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true ||
                        document.referrer.includes('android-app://');
    
    setIsInstalled(isStandalone);
  }, []);

  // Handle install prompt
  const handleInstallPrompt = useCallback((e: Event) => {
    e.preventDefault();
    setInstallPromptEvent(e as PWAInstallPrompt);
    setIsInstallable(true);
    
    // Show install banner after a short delay
    setTimeout(() => {
      setShowInstallPrompt(true);
    }, 2000);
  }, []);

  // Install the app
  const installApp = useCallback(async () => {
    if (!installPromptEvent) return;

    try {
      await installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success('PropertyHub installed successfully!');
        setIsInstalled(true);
      } else {
        toast.info('Installation cancelled');
      }
      
      setShowInstallPrompt(false);
      setInstallPromptEvent(null);
    } catch (error) {
      console.error('Installation failed:', error);
      toast.error('Installation failed');
    }
  }, [installPromptEvent]);

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    setShowInstallPrompt(false);
    // Remember user dismissed the prompt
    localStorage.setItem('pwa_install_dismissed', Date.now().toString());
  }, []);

  // Show install banner manually
  const showInstallBanner = useCallback(() => {
    if (isInstallable && !isInstalled) {
      setShowInstallPrompt(true);
    }
  }, [isInstallable, isInstalled]);

  // Update the app
  const updateApp = useCallback(() => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload the page to activate the new service worker
      window.location.reload();
    }
  }, [registration]);

  // Handle online/offline status
  const handleOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
    
    if (navigator.onLine) {
      toast.success('Connection restored');
    } else {
      toast.error('You are offline. Some features may be limited.');
    }
  }, []);

  // Register service worker and handle updates
  useEffect(() => {
    // Disable service worker registration in preview environments
    console.log('PWA Provider: Service worker disabled in preview environment');
    
    // Still check initial install state and handle other PWA features
    checkIfInstalled();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Listen for app install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      toast.success('PropertyHub has been installed!');
    });

    // Check if install prompt was previously dismissed
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Show prompt again after 7 days
      if (daysSinceDismissed > 7) {
        localStorage.removeItem('pwa_install_dismissed');
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [handleOnlineStatus, checkIfInstalled, updateApp]);

  const contextValue: PWAContextType = {
    isInstallable,
    isInstalled,
    isOnline,
    showInstallPrompt,
    installApp,
    dismissInstallPrompt,
    showInstallBanner,
    updateAvailable,
    updateApp
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      
      {/* Install Prompt Banner */}
      <AnimatePresence>
        {showInstallPrompt && !isInstalled && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          >
            <Card className="shadow-2xl border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">Install PropertyHub</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Get the full app experience with offline access, push notifications, and faster loading.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={installApp} className="h-8">
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={dismissInstallPrompt}
                        className="h-8"
                      >
                        Not now
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={dismissInstallPrompt}
                    className="w-8 h-8 p-0 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-sm text-center font-medium">
              <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4" />
                You are offline. Some features may be limited.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Banner */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80"
          >
            <Card className="shadow-2xl border-blue-500/20 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Update Available</h3>
                    <p className="text-xs text-muted-foreground">
                      New features and improvements are ready.
                    </p>
                  </div>
                  
                  <Button size="sm" onClick={updateApp}>
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </PWAContext.Provider>
  );
}

export default PWAProvider;