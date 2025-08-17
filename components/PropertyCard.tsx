import React from 'react';
import { motion } from 'motion/react';
import { Property, User } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Heart, MapPin, Star, Bed, Bath, Square, Eye, Share2, Calendar, Wifi, Car, Shield } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PropertyCardProps {
  property: Property;
  onSelect: () => void;
  viewMode?: 'grid' | 'list';
  currentUser: User | null;
  showActions?: boolean;
  className?: string;
}

export function PropertyCard({ 
  property, 
  onSelect, 
  viewMode = 'grid', 
  currentUser,
  showActions = true,
  className = ""
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = React.useState(false);

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-3 h-3" />;
      case 'parking':
        return <Car className="w-3 h-3" />;
      case 'security system':
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this ${property.type} in ${property.location}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        className={`w-full ${className}`}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <Card 
          className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20"
          onClick={onSelect}
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Image Section */}
              <div className="relative sm:w-80 sm:flex-shrink-0">
                <div className="aspect-[4/3] sm:aspect-square overflow-hidden">
                  <ImageWithFallback
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay Elements */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  
                  {/* Property Type Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                      {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                    </Badge>
                  </div>

                  {/* Featured Badge */}
                  {property.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="default" className="bg-primary text-primary-foreground">
                        ⭐ Featured
                      </Badge>
                    </div>
                  )}

                  {/* Actions */}
                  {showActions && (
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
                        onClick={handleFavoriteClick}
                      >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 backdrop-blur-sm h-8 w-8 p-0"
                        onClick={handleShareClick}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6">
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-muted-foreground text-sm mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{property.rating}</span>
                          <span className="text-xs text-muted-foreground">({property.reviews} reviews)</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          GHS {property.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {property.type === 'land' ? 'per acre' : 'per month'}
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      {property.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.area.toLocaleString()} sqft</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.description}
                    </p>

                    {/* Amenities */}
                    {property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 4).map((amenity) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {getAmenityIcon(amenity)}
                            <span className={getAmenityIcon(amenity) ? 'ml-1' : ''}>{amenity}</span>
                          </Badge>
                        ))}
                        {property.amenities.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      Available now
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" className="h-8">
                        Contact Host
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      className={`w-full ${className}`}
      whileHover={{ y: -4, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card 
        className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/20 perspective-1000"
        onClick={onSelect}
      >
        <CardContent className="p-0">
          {/* Image Container */}
          <div className="relative overflow-hidden">
            <div className="aspect-[4/3] overflow-hidden">
              <ImageWithFallback
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Property Type Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm">
                {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
              </Badge>
            </div>

            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-4 right-4">
                <Badge variant="default" className="bg-primary text-primary-foreground animate-pulse">
                  ⭐ Featured
                </Badge>
              </div>
            )}

            {/* Floating Actions */}
            {showActions && (
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                {!property.featured && (
                  <motion.button
                    onClick={handleFavoriteClick}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </motion.button>
                )}
                <motion.button
                  onClick={handleShareClick}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </motion.button>
              </div>
            )}

            {/* Price Overlay */}
            <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-lg font-bold text-primary">
                  GHS {property.price.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {property.type === 'land' ? 'per acre' : 'per month'}
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{property.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                {property.location}
              </div>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Square className="w-4 h-4" />
                <span>{property.area.toLocaleString()} sqft</span>
              </div>
            </div>

            {/* Amenities Preview */}
            {property.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs px-2 py-1">
                    {getAmenityIcon(amenity)}
                    <span className={getAmenityIcon(amenity) ? 'ml-1' : ''}>{amenity}</span>
                  </Badge>
                ))}
                {property.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-1">
                    +{property.amenities.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Price and Action */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <div className="text-xl font-bold text-primary">
                  GHS {property.price.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {property.type === 'land' ? 'per acre' : 'per month'}
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
              >
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}