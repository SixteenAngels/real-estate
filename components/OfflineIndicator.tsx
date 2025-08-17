import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Database,
  Sync
} from 'lucide-react';
import { offlineManager } from '../utils/offlineManager';
import { usePWA } from './pwa/PWAProvider';
import { toast } from 'sonner@2.0.3';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function OfflineIndicator({ 
  className = '', 
  showDetails = false,
  position = 'top-right'
}: OfflineIndicatorProps) {
  const { isOnline } = usePWA();
  const [syncStatus, setSyncStatus] = useState(offlineManager.getSyncStatus());
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ size: 0, lastUpdate: null });

  useEffect(() => {
    const unsubscribe = offlineManager.onSyncStatusChange(setSyncStatus);
    
    // Load cache info
    loadCacheInfo();

    return unsubscribe;
  }, []);

  const loadCacheInfo = async () => {
    try {
      const size = await offlineManager.getCacheSize();
      const lastSync = await offlineManager.getUserData('lastSync');
      setCacheInfo({
        size,
        lastUpdate: lastSync
      });
    } catch (error) {
      console.warn('Failed to load cache info:', error);
    }
  };

  const handleSync = async () => {
    try {
      toast.info('Synchronizing data...', {
        description: 'Updating your local data with the latest information.'
      });
      
      await offlineManager.performSync();
      await loadCacheInfo();
      
      toast.success('Sync completed!', {
        description: 'Your data has been updated successfully.'
      });
    } catch (error) {
      toast.error('Sync failed', {
        description: 'Unable to sync data. Please try again.'
      });
    }
  };

  const handleClearCache = async () => {
    try {
      await offlineManager.clearCache();
      await loadCacheInfo();
      
      toast.success('Cache cleared!', {
        description: 'Offline data has been removed to free up space.'
      });
    } catch (error) {
      toast.error('Failed to clear cache', {
        description: 'Unable to clear offline data. Please try again.'
      });
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-yellow-500';
    if (syncStatus.syncInProgress) return 'text-blue-500';
    if (syncStatus.pendingActions > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return WifiOff;
    if (syncStatus.syncInProgress) return Sync;
    if (syncStatus.pendingActions > 0) return Upload;
    return CheckCircle;
  };

  const StatusIcon = getStatusIcon();

  return (
    <>
      {/* Main Status Indicator */}
      <motion.div
        className={`fixed ${getPositionClasses()} z-50 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.button
          onClick={() => setShowDetailedStatus(true)}
          className={`relative p-2 rounded-full backdrop-blur-sm border transition-all duration-200 ${
            isOnline 
              ? 'bg-background/90 border-border hover:bg-background' 
              : 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={syncStatus.syncInProgress ? { rotate: 360 } : { rotate: 0 }}
            transition={{ 
              duration: syncStatus.syncInProgress ? 2 : 0.3, 
              repeat: syncStatus.syncInProgress ? Infinity : 0,
              ease: "linear"
            }}
          >
            <StatusIcon className={`w-5 h-5 ${getStatusColor()}`} />
          </motion.div>

          {/* Status indicators */}
          {syncStatus.pendingActions > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center"
            >
              <span className="text-[8px] font-bold text-white">
                {syncStatus.pendingActions > 9 ? '9+' : syncStatus.pendingActions}
              </span>
            </motion.div>
          )}

          {!isOnline && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      </motion.div>

      {/* Detailed Status Modal */}
      <AnimatePresence>
        {showDetailedStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailedStatus(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-full ${
                      isOnline ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      {isOnline ? (
                        <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {isOnline ? 'Connected' : 'Offline Mode'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isOnline 
                          ? 'All features available' 
                          : 'Limited functionality while offline'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Sync Status */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Last Sync</span>
                      </div>
                      <Badge variant="outline">
                        {formatLastSync(syncStatus.lastSyncTime)}
                      </Badge>
                    </div>

                    {syncStatus.pendingActions > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Upload className="w-4 h-4 text-orange-500" />
                          <span className="text-sm">Pending Actions</span>
                        </div>
                        <Badge variant="secondary">
                          {syncStatus.pendingActions}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Cached Items</span>
                      </div>
                      <Badge variant="outline">
                        {cacheInfo.size}
                      </Badge>
                    </div>

                    {syncStatus.lastError && (
                      <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-destructive">
                              Sync Error
                            </p>
                            <p className="text-xs text-destructive/80">
                              {syncStatus.lastError}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-6">
                    {isOnline && (
                      <Button 
                        onClick={handleSync}
                        disabled={syncStatus.syncInProgress}
                        className="w-full"
                      >
                        {syncStatus.syncInProgress ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync Now
                          </>
                        )}
                      </Button>
                    )}

                    <Button 
                      onClick={handleClearCache}
                      variant="outline"
                      size="sm"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>

                    <Button 
                      onClick={() => setShowDetailedStatus(false)}
                      variant="ghost"
                      size="sm"
                    >
                      Close
                    </Button>
                  </div>

                  {/* Info */}
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      {isOnline 
                        ? 'PropertyHub works offline. Your data is automatically synced when connected.'
                        : 'You can browse cached properties and use basic features while offline.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default OfflineIndicator;