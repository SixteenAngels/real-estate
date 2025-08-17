import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface GeocodeResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  formattedAddress: string;
  components: {
    country: string;
    locality: string;
  };
}

interface GeocodingContextType {
  geocodeAddress: (address: string) => Promise<GeocodeResult | null>;
  reverseGeocode: (lat: number, lng: number) => Promise<GeocodeResult | null>;
  isGeocoding: boolean;
  recentSearches: string[];
  clearRecentSearches: () => void;
}

const GeocodingContext = createContext<GeocodingContextType | null>(null);

export function useGeocoding() {
  const context = useContext(GeocodingContext);
  if (!context) {
    throw new Error('useGeocoding must be used within a GeocodingProvider');
  }
  return context;
}

interface GeocodingProviderProps {
  children: React.ReactNode;
}

export function GeocodingProvider({ children }: GeocodingProviderProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('propertyHub_recentLocationSearches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveToRecentSearches = useCallback((address: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== address);
      const updated = [address, ...filtered].slice(0, 5);
      localStorage.setItem('propertyHub_recentLocationSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult | null> => {
    if (!address.trim()) {
      return null;
    }

    setIsGeocoding(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/geocode`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ address })
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        saveToRecentSearches(address);
        return {
          address: data.address,
          coordinates: data.coordinates,
          formattedAddress: data.formattedAddress,
          components: data.components
        };
      } else {
        console.error('Geocoding API error:', data.error);
        toast.error('Location not found. Please try a different search.');
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to find location. Please check your connection and try again.');
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, [saveToRecentSearches]);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<GeocodeResult | null> => {
    setIsGeocoding(true);
    
    try {
      // For reverse geocoding, we'll use mock data based on proximity to known locations
      const knownLocations = [
        { name: 'Accra, Ghana', lat: 5.6037, lng: -0.1870 },
        { name: 'Kumasi, Ghana', lat: 6.6885, lng: -1.6244 },
        { name: 'Tamale, Ghana', lat: 9.4034, lng: -0.8424 },
        { name: 'Cape Coast, Ghana', lat: 5.1317, lng: -1.2462 },
        { name: 'Tema, Ghana', lat: 5.6698, lng: 0.0166 },
        { name: 'Downtown', lat: 5.5600, lng: -0.2057 },
        { name: 'Airport Residential', lat: 5.6051, lng: -0.1677 },
        { name: 'East Legon', lat: 5.6308, lng: -0.1528 },
        { name: 'Cantonments', lat: 5.5735, lng: -0.1870 },
        { name: 'Labone', lat: 5.5525, lng: -0.1659 }
      ];

      // Find closest location
      let closestLocation = knownLocations[0];
      let minDistance = Math.sqrt(
        Math.pow(lat - closestLocation.lat, 2) + Math.pow(lng - closestLocation.lng, 2)
      );

      for (const location of knownLocations.slice(1)) {
        const distance = Math.sqrt(
          Math.pow(lat - location.lat, 2) + Math.pow(lng - location.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = location;
        }
      }

      return {
        address: closestLocation.name,
        coordinates: { lat, lng },
        formattedAddress: `${closestLocation.name}, Ghana`,
        components: {
          country: 'Ghana',
          locality: closestLocation.name.split(',')[0].trim()
        }
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error('Failed to get location details.');
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('propertyHub_recentLocationSearches');
  }, []);

  const contextValue: GeocodingContextType = {
    geocodeAddress,
    reverseGeocode,
    isGeocoding,
    recentSearches,
    clearRecentSearches
  };

  return (
    <GeocodingContext.Provider value={contextValue}>
      {children}
    </GeocodingContext.Provider>
  );
}

export default GeocodingProvider;