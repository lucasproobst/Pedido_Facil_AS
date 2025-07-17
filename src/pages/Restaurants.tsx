
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import RestaurantSearch from '@/components/RestaurantSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Truck,
  MapPin,
  Heart,
  Star
} from 'lucide-react';

const Restaurants = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedCity, setSelectedCity] = useState('Todas');
  
  const categories = [
    'Todos', 'Fast Food', 'Pizza', 'Japonês', 'Italiano', 'Brasileira', 'Hambúrguer', 'Doces', 'Lanches', 'Saudável'
  ];

  // Ler parâmetro de busca da URL quando a página carregar
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [location.search]);

  // Buscar restaurantes do banco de dados
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }

      return data || [];
    },
    enabled: true,
  });

  // Extrair cidades únicas dos restaurantes
  const cities = useMemo(() => {
    const uniqueCities = [...new Set(restaurants.map(r => r.city_state).filter(Boolean))];
    return ['Todas', ...uniqueCities.sort()];
  }, [restaurants]);

  // Filtrar restaurantes
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = searchTerm === '' || 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (restaurant.description && restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'Todos' || 
        (restaurant.description && restaurant.description.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        restaurant.name.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const matchesCity = selectedCity === 'Todas' || restaurant.city_state === selectedCity;
      
      return matchesSearch && matchesCategory && matchesCity;
    });
  }, [restaurants, searchTerm, selectedCategory, selectedCity]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando restaurantes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Restaurantes</h1>
          <p className="text-muted-foreground">
            Descubra os melhores restaurantes da sua região
          </p>
        </div>

        {/* Search Component */}
        <RestaurantSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          categories={categories}
          cities={cities}
          resultsCount={filteredRestaurants.length}
        />

        {/* Alert if user has no city */}
        {!profile?.city_state && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p className="text-yellow-800 dark:text-yellow-200">
                Para ver restaurantes da sua região, complete suas informações de endereço no{' '}
                <Link to="/profile" className="underline font-medium">
                  seu perfil
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {/* Restaurant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-border">
                <div className="relative">
                  <img 
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop'} 
                    alt={restaurant.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Heart className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  
                  {/* Delivery Fee Badge */}
                  {restaurant.delivery_fee === 0 && (
                    <div className="absolute bottom-3 right-3 bg-green-500 text-white rounded-full px-3 py-1">
                      <span className="text-sm font-medium">Frete Grátis</span>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.5</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{restaurant.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className="w-4 h-4" />
                        <span>
                          {restaurant.delivery_fee === 0 
                            ? 'Grátis' 
                            : `R$ ${restaurant.delivery_fee?.toFixed(2)}`
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {restaurant.city_state}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{restaurant.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredRestaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhum restaurante encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              {!profile?.city_state 
                ? 'Complete seu perfil para ver restaurantes da sua região'
                : 'Tente ajustar sua busca ou aguarde novos restaurantes na sua cidade'
              }
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedCity('Todas');
              }}
              variant="outline"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
