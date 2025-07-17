
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface RestaurantSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  categories: string[];
  cities: string[];
  resultsCount: number;
}

const RestaurantSearch = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  categories,
  cities,
  resultsCount
}: RestaurantSearchProps) => {
  const [open, setOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Immediate search update for real-time filtering
  useEffect(() => {
    setSearchTerm(localSearchTerm);
  }, [localSearchTerm, setSearchTerm]);

  // Update local search term when external search term changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const clearFilters = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
    setSelectedCategory('Todos');
    setSelectedCity('Todas');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'Todos' || selectedCity !== 'Todas';

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Buscar restaurantes, pratos ou tipos de comida..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="pl-12 h-14 text-lg"
        />
        {localSearchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setLocalSearchTerm('');
              setSearchTerm('');
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between min-w-[140px]"
            >
              <Filter className="w-4 h-4 mr-2" />
              {selectedCategory}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Buscar categoria..." />
              <CommandList>
                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category}
                      value={category}
                      onSelect={(value) => {
                        setSelectedCategory(value === selectedCategory ? 'Todos' : value);
                        setOpen(false);
                      }}
                    >
                      {category}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* City Filter */}
        <Popover open={cityOpen} onOpenChange={setCityOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-between min-w-[140px]"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {selectedCity}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Buscar cidade..." />
              <CommandList>
                <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                <CommandGroup>
                  {cities.map((city) => (
                    <CommandItem
                      key={city}
                      value={city}
                      onSelect={(value) => {
                        setSelectedCity(value === selectedCity ? 'Todas' : value);
                        setCityOpen(false);
                      }}
                    >
                      {city}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
            Limpar filtros
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto">
          <Badge variant="secondary" className="text-sm">
            {resultsCount} restaurante{resultsCount !== 1 ? 's' : ''} encontrado{resultsCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="outline" className="bg-primary/10">
              Busca: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalSearchTerm('');
                  setSearchTerm('');
                }}
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {selectedCategory !== 'Todos' && (
            <Badge variant="outline" className="bg-primary/10">
              Categoria: {selectedCategory}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory('Todos')}
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {selectedCity !== 'Todas' && (
            <Badge variant="outline" className="bg-primary/10">
              Cidade: {selectedCity}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCity('Todas')}
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantSearch;
