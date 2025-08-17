import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, ZoomIn, ZoomOut, Layers, Navigation, Home, Building2, Store, Maximize2, Minimize2 } from 'lucide-react';
import { Property } from '../../types';
import { useGeocoding } from '../geocoding/GeocodingProvider';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveMapProps {
  properties?: Property[];
  selectedProperty?: Property | null;
  onPropertySelect?: (property: Property) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  className?: string;
  showControls?: boolean;
  showPropertyFilters?: boolean;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
}

export function InteractiveMap({
  properties = [],
  selectedProperty,
  onPropertySelect,
  center = { lat: 5.6037, lng: -0.1870 }, // Default to Accra
  zoom = 12,
  height = '400px',
  className = '',
  showControls = true,
  showPropertyFilters = true,
  onLocationSelect
}: InteractiveMapProps) {
  const [currentCenter, setCurrentCenter] = useState(center);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [filteredProperties, setFilteredProperties] = useState(properties);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['house', 'apartment', 'land', 'commercial']);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const { reverseGeocode } = useGeocoding();

  // Filter properties by type
  useEffect(() => {
    const filtered = properties.filter(property => 
      selectedTypes.includes(property.type)
    );
    setFilteredProperties(filtered);
  }, [properties, selectedTypes]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Failed to get user location:', error);
        }
      );
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setCurrentZoom(prev => Math.min(prev + 1, 20));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCurrentZoom(prev => Math.max(prev - 1, 1));
  }, []);

  const handleMapClick = useCallback(async (event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current || !onLocationSelect) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (simplified calculation)
    const lat = currentCenter.lat + (rect.height / 2 - y) * (0.01 / currentZoom);
    const lng = currentCenter.lng + (x - rect.width / 2) * (0.01 / currentZoom);
    
    try {
      const geocodeResult = await reverseGeocode(lat, lng);
      if (geocodeResult) {
        onLocationSelect({
          lat,
          lng,
          address: geocodeResult.formattedAddress
        });
      }
    } catch (error) {
      console.warn('Failed to reverse geocode location:', error);
    }
  }, [currentCenter, currentZoom, onLocationSelect, reverseGeocode]);

  const handlePropertyTypeToggle = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case 'house':
        return <Home className="w-3 h-3" />;
      case 'apartment':
        return <Building2 className="w-3 h-3" />;
      case 'land':
        return <MapPin className="w-3 h-3" />;
      case 'commercial':
        return <Store className="w-3 h-3" />;
      default:
        return <MapPin className="w-3 h-3" />;
    }
  };

  const getPropertyColor = (property: Property) => {
    if (selectedProperty?.id === property.id) return 'bg-blue-500 border-blue-600';
    if (hoveredProperty?.id === property.id) return 'bg-green-500 border-green-600';
    
    switch (property.type) {
      case 'house':
        return 'bg-red-500 border-red-600';
      case 'apartment':
        return 'bg-blue-500 border-blue-600';
      case 'land':
        return 'bg-green-500 border-green-600';
      case 'commercial':
        return 'bg-purple-500 border-purple-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const calculatePropertyPosition = (property: Property) => {
    if (!property.coordinates) return { left: '50%', top: '50%' };
    
    const { lat, lng } = property.coordinates;
    
    // Simple mercator projection
    const x = ((lng - currentCenter.lng) * currentZoom * 10) + 50;
    const y = 50 - ((lat - currentCenter.lat) * currentZoom * 10);
    
    return {
      left: `${Math.max(0, Math.min(100, x))}%`,
      top: `${Math.max(0, Math.min(100, y))}%`
    };
  };

  const mapBackgroundStyle = () => {
    switch (mapStyle) {
      case 'satellite':
        return 'bg-gradient-to-br from-green-800 via-green-700 to-green-900';
      case 'terrain':
        return 'bg-gradient-to-br from-yellow-200 via-green-200 to-blue-200';
      default:
        return 'bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100';
    }
  };

  return (
    <motion.div 
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`relative overflow-hidden ${isFullscreen ? 'w-full h-full border-none rounded-none' : ''}`}
        style={{ height: isFullscreen ? '100vh' : height }}
      >
        {/* Map Canvas */}
        <div
          ref={mapRef}
          className={`w-full h-full relative cursor-crosshair ${mapBackgroundStyle()} transition-all duration-300`}
          onClick={handleMapClick}
        >
          {/* Grid overlay for map feel */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* User location marker */}
          {userLocation && (
            <motion.div
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-20"
              style={calculatePropertyPosition({ 
                coordinates: userLocation, 
                type: 'user'
              } as any)}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
            >
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
            </motion.div>
          )}

          {/* Property markers */}
          <AnimatePresence>
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                className={`absolute w-8 h-8 rounded-full border-2 cursor-pointer shadow-lg z-10 flex items-center justify-center text-white ${getPropertyColor(property)} hover:scale-110 transition-all duration-200`}
                style={calculatePropertyPosition(property)}
                onClick={(e) => {
                  e.stopPropagation();
                  onPropertySelect?.(property);
                }}
                onMouseEnter={() => setHoveredProperty(property)}
                onMouseLeave={() => setHoveredProperty(null)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                {getPropertyIcon(property.type)}
                
                {/* Property price badge */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    ${property.price.toLocaleString()}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Property hover tooltip */}
          <AnimatePresence>
            {hoveredProperty && (
              <motion.div
                className="absolute bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border z-30 max-w-xs"
                style={{
                  ...calculatePropertyPosition(hoveredProperty),
                  transform: 'translate(-50%, -100%)',
                  marginTop: '-10px'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <h4 className="font-semibold mb-1">{hoveredProperty.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">{hoveredProperty.location}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {hoveredProperty.type}
                  </Badge>
                  <span className="font-semibold text-sm">
                    ${hoveredProperty.price.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-8 h-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomIn}
              className="w-8 h-8 p-0"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={handleZoomOut}
              className="w-8 h-8 p-0"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const styles: Array<'standard' | 'satellite' | 'terrain'> = ['standard', 'satellite', 'terrain'];
                const currentIndex = styles.indexOf(mapStyle);
                const nextIndex = (currentIndex + 1) % styles.length;
                setMapStyle(styles[nextIndex]);
              }}
              className="w-8 h-8 p-0"
            >
              <Layers className="w-4 h-4" />
            </Button>

            {userLocation && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentCenter(userLocation)}
                className="w-8 h-8 p-0"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}

        {/* Property Type Filters */}
        {showPropertyFilters && (
          <div className="absolute bottom-4 left-4 flex gap-2 z-20">
            {[
              { type: 'house', label: 'Houses', icon: <Home className="w-3 h-3" /> },
              { type: 'apartment', label: 'Apartments', icon: <Building2 className="w-3 h-3" /> },
              { type: 'land', label: 'Land', icon: <MapPin className="w-3 h-3" /> },
              { type: 'commercial', label: 'Commercial', icon: <Store className="w-3 h-3" /> }
            ].map(({ type, label, icon }) => (
              <Button
                key={type}
                size="sm"
                variant={selectedTypes.includes(type) ? 'default' : 'outline'}
                onClick={() => handlePropertyTypeToggle(type)}
                className="flex items-center gap-1 text-xs"
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Zoom level indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs z-20">
          Zoom: {currentZoom}x
        </div>

        {/* Map style indicator */}
        <div className="absolute top-4 left-20 bg-black/50 text-white px-2 py-1 rounded text-xs z-20 capitalize">
          {mapStyle}
        </div>
      </Card>
    </motion.div>
  );
}

export default InteractiveMap;