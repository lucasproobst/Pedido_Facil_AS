
import React from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocation } from '@/contexts/LocationContext';

const LocationSelector = () => {
  const { selectedLocation, setSelectedLocation, locations } = useLocation();

  return (
    <div className="flex items-center space-x-1">
      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger className="border-0 bg-transparent focus:ring-0 focus:ring-offset-0 p-0 h-auto">
          <SelectValue>
            <span className="text-sm text-gray-600 dark:text-gray-400">{selectedLocation}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location} value={location}>
              {location}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationSelector;
