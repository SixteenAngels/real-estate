import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Property, PropertyFilters, User } from '../types';
import { applyPropertyFilters } from '../utils/propertyFiltering';
import { useMobile } from '../hooks/useMobile';
import { useSearch } from './EnhancedSearchProvider';
import { useGeocoding } from './geocoding/GeocodingProvider';
import { InteractiveMap } from './map/InteractiveMap';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { 
  Search, 
  MapPin, 
  Grid3X3, 
  List, 
  Filter, 
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Heart,
  Eye,
  Share2
} from 'lucide-react';

interface MarketplaceProps {
  properties: Property[];
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  onPropertySelect: (property: Property) => void;
  currentUser: User | null;
}

export function Marketplace({ 
  properties, 
  filters, 
  setFilters, 
  onPropertySelect, 
  currentUser
}: MarketplaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [selectedMapProperty, setSelectedMapProperty] = useState<Property | null>(null);
  const isMobile = useMobile();

  const { 
    isSearching,
    searchResults,
    searchQuery,
    searchHistory,
    recommendations,
    performSearch,
    addToHistory,
    trackSearchBehavior,
    loadRecommendations
  } = useSearch();

  const { geocodeAddress } = useGeocoding();

  // Load user recommendations on mount
  useEffect(() => {
    if (currentUser) {
      loadRecommendations(currentUser.id);
    }
  }, [currentUser, loadRecommendations]);

  // Use search results if available, otherwise use filtered properties
  const displayProperties = searchQuery ? searchResults : properties;

  const filteredProperties = useMemo(() => {
    let result = applyPropertyFilters(displayProperties, filters);
    
    // Apply search filter for local search (when not using backend search)
    if (searchTerm.trim() && !searchQuery) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(property => 
        property.title.toLowerCase().includes(searchLower) ||
        property.location.toLowerCase().includes(searchLower) ||
        property.description.toLowerCase().includes(searchLower) ||
        property.amenities.some(amenity => amenity.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          // Fix date parsing - use fallback for properties without createdAt
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id) || 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id) || 0;
          return bDate - aDate;
        case 'relevance':
          return (b.relevanceScore || 0) - (a.relevanceScore || 0);
        case 'featured':
        default:
          // Featured properties first, then by rating
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
      }
    });
    
    return result;
  }, [displayProperties, filters, searchTerm, sortBy, searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Add to search history
    addToHistory(searchTerm);

    // Track search behavior
    if (currentUser) {
      trackSearchBehavior(currentUser.id, 'search_initiated', {
        query: searchTerm,
        filters,
        source: 'marketplace_search'
      });
    }

    // Perform backend search
    await performSearch(searchTerm, filters, currentUser?.id);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleQuickSearch = (query: string) => {
    setSearchTerm(query);
    if (currentUser) {
      performSearch(query, filters, currentUser.id);
    }
  };

  const handleLocationSearch = async (location: string) => {
    const result = await geocodeAddress(location);
    if (result) {
      // Update filters with the geocoded location
      setFilters({
        ...filters,
        location: [result.formattedAddress]
      });
      
      // Also perform a search
      await performSearch(location, { ...filters, location: [result.formattedAddress] }, currentUser?.id);
    }
  };

  const renderPropertyCard = (property: Property, index: number) => (
    <motion.div
      key={property.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={() => onPropertySelect(property)}
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
        <div className="aspect-video bg-muted relative overflow-hidden">
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Property badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/90 text-black">
              {property.type}
            </Badge>
            {property.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-black/70 text-white px-3 py-1 rounded-lg backdrop-blur-sm">
              <span className="font-bold">GHS {property.price.toLocaleString()}</span>
              {property.type === 'rental' && <span className="text-sm">/month</span>}
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {property.highlightedTitle ? (
                <h3 
                  className="font-semibold text-lg mb-1" 
                  dangerouslySetInnerHTML={{ __html: property.highlightedTitle }}
                />
              ) : (
                <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
              )}
              
              {property.highlightedLocation ? (
                <p 
                  className="text-muted-foreground text-sm flex items-center"
                  dangerouslySetInnerHTML={{ __html: `<MapPin class="w-3 h-3 inline mr-1" />${property.highlightedLocation}` }}
                />
              ) : (
                <p className="text-muted-foreground text-sm flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {property.location}
                </p>
              )}
            </div>
            
            <div className="flex items-center text-sm">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span>{property.rating}</span>
            </div>
          </div>

          {/* Property description snippet */}
          {property.descriptionSnippet && (
            <p 
              className="text-sm text-muted-foreground mb-3" 
              dangerouslySetInnerHTML={{ __html: property.descriptionSnippet }}
            />
          )}

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
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Enhanced Hero Section with 3D elements */}
      <motion.div 
        className="relative overflow-hidden py-20 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <motion.h1 
            className="text-4xl md:text-7xl font-bold"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="inline-block">Find Your Perfect </span>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent inline-block">
              Property
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Discover {filteredProperties.length} verified properties across different categories
          </motion.p>

          {/* Enhanced Search Bar with recommendations */}
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative bg-card/80 backdrop-blur-lg border border-border/50 rounded-2xl p-4 shadow-xl">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search properties, locations, amenities..."
                    className="w-full pl-10 pr-10 py-3 bg-transparent border-0 outline-none placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-medium"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </form>

              {/* Quick search suggestions */}
              {(recommendations.recentQueries.length > 0 || recommendations.popularLocations.length > 0) && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <div className="flex flex-wrap gap-2">
                    {recommendations.recentQueries.slice(0, 3).map(query => (
                      <Button
                        key={query}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSearch(query)}
                        className="text-xs"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {query}
                      </Button>
                    ))}
                    {recommendations.popularLocations.slice(0, 3).map(location => (
                      <Button
                        key={location}
                        variant="outline"
                        size="sm"
                        onClick={() => handleLocationSearch(location)}
                        className="text-xs"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {location}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold">Properties ({filteredProperties.length})</h2>
            <p className="text-muted-foreground">
              {searchTerm ? 
                `Showing results for "${searchTerm}"` : 
                'Available properties matching your criteria'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View mode toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="w-8 h-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="w-8 h-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                className="w-8 h-8 p-0"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort dropdown */}
            <select 
              className="px-4 py-2 bg-card border border-border rounded-lg"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              {searchQuery && <option value="relevance">Relevance</option>}
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Date Added</option>
            </select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'map' ? (
          <div className="space-y-6">
            <InteractiveMap
              properties={filteredProperties}
              selectedProperty={selectedMapProperty}
              onPropertySelect={setSelectedMapProperty}
              height="500px"
              showControls={true}
              showPropertyFilters={true}
            />
            
            {selectedMapProperty && (
              <div className="max-w-md">
                {renderPropertyCard(selectedMapProperty, 0)}
              </div>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-4">
            {filteredProperties.map((property, index) => renderPropertyCard(property, index))}
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {filteredProperties.map((property, index) => renderPropertyCard(property, index))}
          </div>
        )}

        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search criteria</p>
            <Button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}