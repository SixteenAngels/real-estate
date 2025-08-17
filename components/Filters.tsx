import React from 'react';
import { PropertyFilters } from '../types';
import { SmartFilters } from './SmartFilters';

interface FiltersProps {
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
}

export function Filters({ filters, setFilters }: FiltersProps) {
  // Mock location search function for backwards compatibility
  const handleLocationSearch = async (query: string) => {
    const mockLocations = [
      { name: 'Downtown', coordinates: [0.2, 5.6] as [number, number] },
      { name: 'Uptown', coordinates: [0.15, 5.65] as [number, number] },
      { name: 'Midtown', coordinates: [0.18, 5.61] as [number, number] },
      { name: 'Business District', coordinates: [0.17, 5.58] as [number, number] },
      { name: 'Suburbs', coordinates: [0.19, 5.57] as [number, number] },
      { name: 'Arts District', coordinates: [0.16, 5.62] as [number, number] },
      { name: 'Riverside', coordinates: [0.14, 5.59] as [number, number] },
      { name: 'Historic District', coordinates: [0.21, 5.63] as [number, number] },
    ];
    
    return mockLocations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Calculate property count for display
  const getActiveFilterCount = () => {
    return (
      filters.type.length +
      filters.location.length +
      filters.bedrooms.length +
      filters.bathrooms.length +
      filters.amenities.length +
      filters.availability.length +
      (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000 ? 1 : 0) +
      (filters.areaRange[0] > 0 || filters.areaRange[1] < 10000 ? 1 : 0)
    );
  };

  return (
    <SmartFilters
      filters={filters}
      setFilters={setFilters}
      propertyCount={0} // This will be populated by parent component
      showAdvanced={true}
      compact={false}
      onLocationSearch={handleLocationSearch}
    />
  );
}