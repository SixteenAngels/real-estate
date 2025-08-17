import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, PropertyFilters } from '../types';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SearchContext {
  isSearching: boolean;
  searchResults: Property[];
  searchQuery: string;
  searchHistory: string[];
  recommendations: SearchRecommendations;
  highlightedResults: Property[];
  setSearchQuery: (query: string) => void;
  performSearch: (query: string, filters?: PropertyFilters, userId?: string) => Promise<void>;
  clearSearch: () => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  generateHighlights: (properties: Property[], query: string) => Property[];
  trackSearchBehavior: (userId: string, action: string, data?: any) => void;
  loadRecommendations: (userId: string) => void;
}

interface SearchRecommendations {
  popularLocations: string[];
  preferredTypes: string[];
  averagePriceRange: [number, number];
  recentQueries: string[];
}

const SearchContext = createContext<SearchContext | null>(null);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: React.ReactNode;
}

export function EnhancedSearchProvider({ children }: SearchProviderProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<SearchRecommendations>({
    popularLocations: [],
    preferredTypes: [],
    averagePriceRange: [0, 1000000],
    recentQueries: []
  });
  const [highlightedResults, setHighlightedResults] = useState<Property[]>([]);

  // Load search history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('propertyHub_searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.warn('Failed to parse search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('propertyHub_searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const performSearch = useCallback(async (
    query: string, 
    filters?: PropertyFilters, 
    userId?: string
  ) => {
    setIsSearching(true);
    
    try {
      // Build search params
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('search', query);
      if (userId) searchParams.append('userId', userId);
      
      if (filters) {
        if (filters.type?.length) searchParams.append('type', filters.type[0]);
        if (filters.location?.length) searchParams.append('location', filters.location[0]);
        if (filters.priceRange) {
          searchParams.append('minPrice', filters.priceRange[0].toString());
          searchParams.append('maxPrice', filters.priceRange[1].toString());
        }
        if (filters.bedrooms?.length) searchParams.append('bedrooms', filters.bedrooms[0]);
        if (filters.bathrooms?.length) searchParams.append('bathrooms', filters.bathrooms[0]);
        if (filters.amenities?.length) searchParams.append('amenities', filters.amenities.join(','));
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/properties?${searchParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.properties);
        
        // Generate highlighted results if query exists
        if (query) {
          const highlighted = generateHighlights(data.properties, query);
          setHighlightedResults(highlighted);
        } else {
          setHighlightedResults(data.properties);
        }

        // Track search behavior
        if (userId) {
          trackSearchBehavior(userId, 'search_performed', {
            query,
            filters,
            resultsCount: data.properties.length,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.error('Search API error:', data.error);
        // Don't show toast for preview environment network errors
      }
    } catch (error) {
      console.error('Search error:', error);
      // Only show error for non-network issues
      if (error instanceof TypeError && error.message.includes('NetworkError')) {
        console.warn('Network error in preview environment - this is expected');
      } else {
        toast.error('Search failed. Please check your connection and try again.');
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const generateHighlights = useCallback((properties: Property[], query: string): Property[] => {
    if (!query.trim()) return properties;

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return properties.map(property => {
      const highlightedProperty = { ...property };
      
      // Create highlighted snippets for title, description, and location
      const highlightText = (text: string, terms: string[]): string => {
        let highlighted = text;
        terms.forEach(term => {
          const regex = new RegExp(`(${term})`, 'gi');
          highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
        });
        return highlighted;
      };

      // Generate search snippets (first 150 characters around matches)
      const generateSnippet = (text: string, terms: string[]): string => {
        const lowerText = text.toLowerCase();
        let earliestMatch = text.length;
        
        terms.forEach(term => {
          const index = lowerText.indexOf(term.toLowerCase());
          if (index !== -1 && index < earliestMatch) {
            earliestMatch = index;
          }
        });

        if (earliestMatch < text.length) {
          const start = Math.max(0, earliestMatch - 50);
          const end = Math.min(text.length, earliestMatch + 100);
          let snippet = text.substring(start, end);
          
          if (start > 0) snippet = '...' + snippet;
          if (end < text.length) snippet = snippet + '...';
          
          return highlightText(snippet, terms);
        }
        
        return highlightText(text.substring(0, 150), terms);
      };

      // Add highlighted versions and snippets
      highlightedProperty.highlightedTitle = highlightText(property.title, searchTerms);
      highlightedProperty.highlightedLocation = highlightText(property.location, searchTerms);
      highlightedProperty.descriptionSnippet = generateSnippet(property.description, searchTerms);
      
      // Calculate relevance score
      let relevanceScore = 0;
      searchTerms.forEach(term => {
        if (property.title.toLowerCase().includes(term)) relevanceScore += 3;
        if (property.location.toLowerCase().includes(term)) relevanceScore += 2;
        if (property.description.toLowerCase().includes(term)) relevanceScore += 1;
        if (property.amenities.some(amenity => amenity.toLowerCase().includes(term))) relevanceScore += 1;
      });
      
      highlightedProperty.relevanceScore = relevanceScore;
      
      return highlightedProperty;
    }).sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10); // Keep only last 10 searches
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('propertyHub_searchHistory');
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setHighlightedResults([]);
  }, []);

  const trackSearchBehavior = useCallback(async (userId: string, action: string, data?: any) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/analytics/track`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            action,
            data
          })
        }
      );
    } catch (error) {
      console.warn('Failed to track search behavior:', error);
      // Don't show error for preview environment
    }
  }, []);

  const loadRecommendations = useCallback(async (userId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8669f8c6/search/recommendations/${userId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecommendations(data.recommendations);
        }
      }
    } catch (error) {
      console.warn('Failed to load search recommendations:', error);
      // Don't show error for preview environment
    }
  }, []);

  const contextValue: SearchContext = {
    isSearching,
    searchResults,
    searchQuery,
    searchHistory,
    recommendations,
    highlightedResults,
    setSearchQuery,
    performSearch,
    clearSearch,
    addToHistory,
    clearHistory,
    generateHighlights,
    trackSearchBehavior,
    loadRecommendations
  };

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  );
}

export default EnhancedSearchProvider;