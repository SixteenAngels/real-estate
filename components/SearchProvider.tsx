import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Property, PropertyFilters, User } from '../types';
import { applyPropertyFilters } from '../utils/propertyFiltering';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface SearchSuggestion {
  id: string;
  type: 'location' | 'property' | 'amenity' | 'recent';
  text: string;
  count?: number;
  icon?: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: PropertyFilters;
  searchTerm: string;
  createdAt: string;
  count: number;
}

interface SearchHistory {
  id: string;
  term: string;
  timestamp: string;
  resultsCount: number;
}

interface SearchContextType {
  // Search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  isSearching: boolean;
  
  // Search history
  searchHistory: SearchHistory[];
  clearSearchHistory: () => void;
  
  // Saved searches
  savedSearches: SavedSearch[];
  saveCurrentSearch: (name: string, filters: PropertyFilters, searchTerm: string, count: number) => void;
  deleteSavedSearch: (id: string) => void;
  applySavedSearch: (savedSearch: SavedSearch) => void;
  
  // Search functions
  performSearch: (term: string, properties: Property[], filters: PropertyFilters) => Property[];
  generateSuggestions: (term: string, properties: Property[]) => void;
  handleSearchSelect: (suggestion: SearchSuggestion) => void;
  
  // Voice search
  isVoiceSearchSupported: boolean;
  isListening: boolean;
  startVoiceSearch: () => void;
  stopVoiceSearch: () => void;
  
  // Quick filters
  quickFilters: Array<{ label: string; filter: Partial<PropertyFilters> }>;
  applyQuickFilter: (filter: Partial<PropertyFilters>) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: React.ReactNode;
  onFiltersChange: (filters: PropertyFilters) => void;
  currentFilters: PropertyFilters;
}

export function SearchProvider({ children, onFiltersChange, currentFilters }: SearchProviderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if speech recognition is supported
  const isVoiceSearchSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

  // Initialize speech recognition
  useEffect(() => {
    if (isVoiceSearchSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchTerm(transcript);
        setIsListening(false);
        toast.success(`Voice search: "${transcript}"`);
      };

      recognitionRef.current.onerror = (event) => {
        setIsListening(false);
        toast.error('Voice search error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [isVoiceSearchSupported]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('propertyHub_searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }

    const savedSearchesData = localStorage.getItem('propertyHub_savedSearches');
    if (savedSearchesData) {
      setSavedSearches(JSON.parse(savedSearchesData));
    }
  }, []);

  // Save search history and saved searches to localStorage
  useEffect(() => {
    localStorage.setItem('propertyHub_searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('propertyHub_savedSearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  // Quick filters for common searches
  const quickFilters = [
    { label: 'Houses under GHS 100k', filter: { type: ['house'], priceRange: [0, 100000] } },
    { label: 'Land for sale', filter: { type: ['land'] } },
    { label: 'Commercial shops', filter: { type: ['shop'] } },
    { label: '3+ Bedrooms', filter: { bedrooms: ['3', '4', '5+'] } },
    { label: 'With parking', filter: { amenities: ['Parking'] } },
    { label: 'Pet friendly', filter: { amenities: ['Pet Friendly'] } },
  ];

  const performSearch = useCallback((term: string, properties: Property[], filters: PropertyFilters): Property[] => {
    setIsSearching(true);
    
    let result = applyPropertyFilters(properties, filters);
    
    if (term.trim()) {
      const searchLower = term.toLowerCase();
      result = result.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.amenities.some(amenity => amenity.toLowerCase().includes(searchLower)) ||
        property.type.toLowerCase().includes(searchLower)
      );

      // Add to search history
      const historyEntry: SearchHistory = {
        id: Date.now().toString(),
        term: term.trim(),
        timestamp: new Date().toISOString(),
        resultsCount: result.length
      };

      setSearchHistory(prev => {
        const filtered = prev.filter(h => h.term.toLowerCase() !== term.toLowerCase());
        return [historyEntry, ...filtered].slice(0, 10); // Keep only last 10 searches
      });
    }
    
    setIsSearching(false);
    return result;
  }, []);

  const generateSuggestions = useCallback((term: string, properties: Property[]) => {
    if (!term.trim()) {
      // Show recent searches and popular suggestions when no term
      const recentSuggestions = searchHistory.slice(0, 5).map(h => ({
        id: `recent-${h.id}`,
        type: 'recent' as const,
        text: h.term,
        count: h.resultsCount,
        icon: '🕒'
      }));

      const popularSuggestions = [
        { id: 'pop-1', type: 'location' as const, text: 'Downtown', icon: '📍' },
        { id: 'pop-2', type: 'property' as const, text: 'Houses', icon: '🏠' },
        { id: 'pop-3', type: 'amenity' as const, text: 'Pool', icon: '🏊‍♂️' },
        { id: 'pop-4', type: 'amenity' as const, text: 'Parking', icon: '🚗' },
      ];

      setSuggestions([...recentSuggestions, ...popularSuggestions]);
      return;
    }

    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    suggestionsTimeoutRef.current = setTimeout(() => {
      const searchLower = term.toLowerCase();
      const newSuggestions: SearchSuggestion[] = [];

      // Location suggestions
      const locations = [...new Set(properties.map(p => p.location))];
      const matchingLocations = locations.filter(location => 
        location.toLowerCase().includes(searchLower)
      ).slice(0, 3);

      matchingLocations.forEach(location => {
        const count = properties.filter(p => p.location === location).length;
        newSuggestions.push({
          id: `location-${location}`,
          type: 'location',
          text: location,
          count,
          icon: '📍'
        });
      });

      // Property title suggestions
      const matchingProperties = properties.filter(p => 
        p.title.toLowerCase().includes(searchLower)
      ).slice(0, 3);

      matchingProperties.forEach(property => {
        newSuggestions.push({
          id: `property-${property.id}`,
          type: 'property',
          text: property.title,
          icon: property.type === 'house' ? '🏠' : property.type === 'land' ? '🌾' : '🏪'
        });
      });

      // Amenity suggestions
      const allAmenities = [...new Set(properties.flatMap(p => p.amenities))];
      const matchingAmenities = allAmenities.filter(amenity => 
        amenity.toLowerCase().includes(searchLower)
      ).slice(0, 3);

      matchingAmenities.forEach(amenity => {
        const count = properties.filter(p => p.amenities.includes(amenity)).length;
        newSuggestions.push({
          id: `amenity-${amenity}`,
          type: 'amenity',
          text: amenity,
          count,
          icon: '✨'
        });
      });

      setSuggestions(newSuggestions);
    }, 300);
  }, [properties, searchHistory]);

  const handleSearchSelect = useCallback((suggestion: SearchSuggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    
    // Apply appropriate filter based on suggestion type
    if (suggestion.type === 'location') {
      onFiltersChange({
        ...currentFilters,
        location: [suggestion.text]
      });
    } else if (suggestion.type === 'amenity') {
      const currentAmenities = Array.isArray(currentFilters.amenities) ? currentFilters.amenities : [];
      if (!currentAmenities.includes(suggestion.text)) {
        onFiltersChange({
          ...currentFilters,
          amenities: [...currentAmenities, suggestion.text]
        });
      }
    }
  }, [currentFilters, onFiltersChange]);

  const saveCurrentSearch = useCallback((name: string, filters: PropertyFilters, searchTerm: string, count: number) => {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      searchTerm,
      createdAt: new Date().toISOString(),
      count
    };

    setSavedSearches(prev => [savedSearch, ...prev].slice(0, 20)); // Keep max 20 saved searches
    toast.success(`Search "${name}" saved successfully!`);
  }, []);

  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches(prev => prev.filter(s => s.id !== id));
    toast.success('Saved search deleted');
  }, []);

  const applySavedSearch = useCallback((savedSearch: SavedSearch) => {
    setSearchTerm(savedSearch.searchTerm);
    onFiltersChange(savedSearch.filters);
    toast.success(`Applied saved search: ${savedSearch.name}`);
  }, [onFiltersChange]);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    toast.success('Search history cleared');
  }, []);

  const startVoiceSearch = useCallback(() => {
    if (recognitionRef.current && isVoiceSearchSupported && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      toast.info('Listening... Speak now!');
    }
  }, [isVoiceSearchSupported, isListening]);

  const stopVoiceSearch = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const applyQuickFilter = useCallback((filter: Partial<PropertyFilters>) => {
    onFiltersChange({ ...currentFilters, ...filter });
  }, [currentFilters, onFiltersChange]);

  const value: SearchContextType = {
    searchTerm,
    setSearchTerm,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    isSearching,
    searchHistory,
    clearSearchHistory,
    savedSearches,
    saveCurrentSearch,
    deleteSavedSearch,
    applySavedSearch,
    performSearch,
    generateSuggestions,
    handleSearchSelect,
    isVoiceSearchSupported,
    isListening,
    startVoiceSearch,
    stopVoiceSearch,
    quickFilters,
    applyQuickFilter
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

// Add speech recognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}