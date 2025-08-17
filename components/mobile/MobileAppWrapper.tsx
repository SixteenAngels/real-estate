import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Property, User } from '../../types';
import { SwipeableCard, PullToRefresh, BottomSheet, TouchGestures } from './MobileOptimizations';
import { usePWA } from '../pwa/PWAProvider';
import { useWebSocket } from '../realtime/WebSocketProvider';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Heart, Share2, MapPin, Star, Eye, Wifi, WifiOff, 
  Download, Filter, Search, Grid, List
} from 'lucide-react';

interface MobilePropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onFavorite?: (property: Property) => void;
  onShare?: (property: Property) => void;
  isFavorited?: boolean;
}

export function MobilePropertyCard({ 
  property, 
  onSelect, 
  onFavorite, 
  onShare, 
  isFavorited = false 
}: MobilePropertyCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <SwipeableCard
      onSwipeLeft={() => onFavorite?.(property)}
      onSwipeRight={() => onShare?.(property)}
      className="mb-4"
    >
      <TouchGestures
        onDoubleTap={() => onFavorite?.(property)}
        className="w-full"
      >
        <Card className="mobile-card overflow-hidden shadow-lg">
          <div className="relative">
            {/* Property Image */}
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              <img
                src={property.images[0]}
                alt={property.title}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              
              {!imageLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Property badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                <Badge className="text-xs bg-white/90 text-black">
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </Badge>
                {property.featured && (
                  <Badge className="text-xs bg-yellow-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Action buttons */}
              <div className="absolute top-3 right-3 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm ${
                    isFavorited 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white/20 text-white'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite?.(property);
                  }}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.(property);
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Price tag */}
              <div className="absolute bottom-3 left-3">
                <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                  <span className="font-bold">GHS {property.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Rating */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded-lg">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{property.rating}</span>
              </div>
            </div>

            {/* Property Details */}
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Title and Location */}
                <div>
                  {property.highlightedTitle ? (
                    <h3 
                      className="font-semibold text-base mb-1 line-clamp-2" 
                      dangerouslySetInnerHTML={{ __html: property.highlightedTitle }}
                    />
                  ) : (
                    <h3 className="font-semibold text-base mb-1 line-clamp-2">{property.title}</h3>
                  )}
                  
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {property.highlightedLocation ? (
                        <span dangerouslySetInnerHTML={{ __html: property.highlightedLocation }} />
                      ) : (
                        property.location
                      )}
                    </span>
                  </div>
                </div>

                {/* Property specs */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    {property.bedrooms && <span>{property.bedrooms} bed</span>}
                    {property.bathrooms && <span>{property.bathrooms} bath</span>}
                    {property.size && <span>{property.size} sqft</span>}
                  </div>
                  
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{property.views || 0}</span>
                  </div>
                </div>

                {/* Description snippet */}
                {property.descriptionSnippet && (
                  <p 
                    className="text-sm text-muted-foreground line-clamp-2" 
                    dangerouslySetInnerHTML={{ __html: property.descriptionSnippet }}
                  />
                )}

                {/* CTA Button */}
                <Button 
                  onClick={() => onSelect(property)}
                  className="w-full mt-3 touch-target"
                >\n                  View Details\n                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </TouchGestures>
    </SwipeableCard>
  );
}

interface MobileAppWrapperProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export function MobileAppWrapper({ children, onRefresh, className = '' }: MobileAppWrapperProps) {
  const { isOnline, isInstalled } = usePWA();
  const { isConnected, connectionState } = useWebSocket();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
      const timer = setTimeout(() => setShowOfflineMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    } else {
      // Default refresh behavior
      window.location.reload();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Connection Status Bar */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-sm text-center font-medium safe-area-inset"
          >
            <div className="flex items-center justify-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>You're offline. Some features may be limited.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WebSocket Connection Indicator */}
      <div className="fixed top-4 left-4 z-40">
        <div className={`w-3 h-3 rounded-full ${
          connectionState === 'connected' ? 'bg-green-500 connection-pulse' :
          connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse' :
          'bg-red-500'
        }`} />
      </div>

      {/* Main Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
        <div className={`${isInstalled ? 'pwa-safe-area' : 'safe-area-inset'}`}>
          {children}
        </div>
      </PullToRefresh>

      {/* Offline Message */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-20 left-4 right-4 z-40"
          >
            <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <WifiOff className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm text-yellow-800 dark:text-yellow-200">
                      Working Offline
                    </h3>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      Your data will sync when connection is restored.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowOfflineMessage(false)}
                  >
                    OK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MobilePropertyListProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  emptyMessage?: string;
  currentUser?: User | null;
}

export function MobilePropertyList({ 
  properties, 
  onPropertySelect, 
  onRefresh, 
  loading = false,
  emptyMessage = "No properties found",
  currentUser
}: MobilePropertyListProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Load favorites from localStorage
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`favorites_${currentUser.id}`);
      if (saved) {
        try {
          setFavorites(new Set(JSON.parse(saved)));
        } catch (error) {
          console.warn('Failed to load favorites:', error);
        }
      }
    }
  }, [currentUser]);

  const handleFavorite = (property: Property) => {
    if (!currentUser) return;

    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(property.id)) {
        newFavorites.delete(property.id);
      } else {
        newFavorites.add(property.id);
      }
      
      localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const handleShare = async (property: Property) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title} in ${property.location}`,
          url: `${window.location.origin}/?property=${property.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard?.writeText(`${property.title} - ${window.location.origin}/?property=${property.id}`);
      }
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard?.writeText(`${property.title} - ${window.location.origin}/?property=${property.id}`);
    }
  };

  return (
    <MobileAppWrapper onRefresh={onRefresh}>
      <div className="container-mobile py-6">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="mobile-headline">
            Properties ({properties.length})
          </h2>
          
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="w-8 h-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="w-8 h-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="mobile-card bg-muted animate-pulse">
                <div className="aspect-[4/3] bg-muted-foreground/20" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-3/4" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Properties List/Grid */}
        {!loading && properties.length > 0 && (
          <div className={viewMode === 'grid' ? 
            'grid grid-cols-2 gap-4' : 
            'space-y-4'
          }>
            {properties.map((property) => (
              <MobilePropertyCard
                key={property.id}
                property={property}
                onSelect={onPropertySelect}
                onFavorite={handleFavorite}
                onShare={handleShare}
                isFavorited={favorites.has(property.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="mobile-headline mb-2">{emptyMessage}</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search criteria or check back later.
            </p>
            <Button onClick={onRefresh}>
              <Search className="w-4 h-4 mr-2" />
              Search Again
            </Button>
          </div>
        )}
      </div>
    </MobileAppWrapper>
  );
}

export default MobileAppWrapper;