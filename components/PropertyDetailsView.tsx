import React from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Navigation, MapPin } from 'lucide-react';
import { Property, User as UserType } from '../types';

interface PropertyDetailsViewProps {
  selectedProperty: Property;
  currentUser: UserType;
  onBack: () => void;
  onNavigation: (route: string) => void;
}

export const PropertyDetailsView: React.FC<PropertyDetailsViewProps> = ({
  selectedProperty,
  currentUser,
  onBack,
  onNavigation
}) => {
  return (
    <motion.div
      key="property-details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <button
          onClick={onBack}
          className="mb-4 sm:mb-6 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          ← Back to Properties
        </button>
        
        <div className="bg-card rounded-lg sm:rounded-2xl overflow-hidden shadow-lg">
          <div className="aspect-video bg-muted relative overflow-hidden">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 space-y-4 lg:space-y-0">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{selectedProperty.title}</h1>
                <p className="text-muted-foreground text-base sm:text-lg">{selectedProperty.location}</p>
              </div>
              <div className="text-left lg:text-right">
                <div className="text-2xl sm:text-3xl font-bold">GHS {selectedProperty.price.toLocaleString()}</div>
                <div className="flex items-center text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1">{selectedProperty.rating} ({selectedProperty.reviews} reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="font-medium text-sm sm:text-base">Type</div>
                <div className="text-muted-foreground text-sm sm:text-base capitalize">{selectedProperty.type}</div>
              </div>
              {selectedProperty.bedrooms && (
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                  <div className="font-medium text-sm sm:text-base">Bedrooms</div>
                  <div className="text-muted-foreground text-sm sm:text-base">{selectedProperty.bedrooms}</div>
                </div>
              )}
              {selectedProperty.bathrooms && (
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                  <div className="font-medium text-sm sm:text-base">Bathrooms</div>
                  <div className="text-muted-foreground text-sm sm:text-base">{selectedProperty.bathrooms}</div>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                <div className="font-medium text-sm sm:text-base">Area</div>
                <div className="text-muted-foreground text-sm sm:text-base">{selectedProperty.area} sqft</div>
              </div>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{selectedProperty.description}</p>
            </div>
            
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs sm:text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
            
            {currentUser && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => onNavigation('chat')}
                  className="flex-1 px-6 sm:px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
                >
                  Contact Owner
                </button>
                <button 
                  onClick={() => onNavigation('map')}
                  className="flex-1 px-6 sm:px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm sm:text-base"
                >
                  📍 View on Map
                </button>
                <button 
                  onClick={() => onNavigation('payments')}
                  className="flex-1 px-6 sm:px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors text-sm sm:text-base"
                >
                  Book Now
                </button>
              </div>
            )}
            
            {/* Location Actions */}
            {currentUser && selectedProperty && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Location & Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button 
                    onClick={() => onNavigation('directions')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="text-sm font-medium">Get Directions</span>
                  </button>
                  <button 
                    onClick={() => onNavigation('tour-scheduler')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="text-sm font-medium">Schedule Tour</span>
                  </button>
                  <button 
                    onClick={() => onNavigation('offline-maps')}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M12 21l-3-6h6l-3 6z"/>
                    </svg>
                    <span className="text-sm font-medium">Offline Maps</span>
                  </button>
                  <button 
                    onClick={async () => {
                      if (navigator.share && selectedProperty) {
                        try {
                          await navigator.share({
                            title: `${selectedProperty.title} Location`,
                            text: `Check out this property: ${selectedProperty.title}`,
                            url: `https://maps.google.com/?q=${selectedProperty.coordinates[0]},${selectedProperty.coordinates[1]}`
                          });
                        } catch (error) {
                          const locationUrl = `https://maps.google.com/?q=${selectedProperty.coordinates[0]},${selectedProperty.coordinates[1]}`;
                          navigator.clipboard.writeText(locationUrl);
                          toast.success('Location link copied to clipboard!');
                        }
                      }
                    }}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Share Location</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};