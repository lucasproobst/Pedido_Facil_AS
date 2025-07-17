import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Truck, MapPin, Star, Loader2 } from 'lucide-react';

const FeaturedRestaurants = () => {
  // Buscar restaurantes ativos para os destaques
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['featured-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Carregando restaurantes...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Destaques da Semana
            </h2>
            <p className="text-xl text-gray-600">
              Restaurantes cadastrados e ativos
            </p>
          </div>
          <Link to="/restaurants">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
              Ver Todos
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        {restaurants && restaurants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum restaurante disponível
              </h3>
              <p className="text-gray-600">
                Novos restaurantes aparecerão aqui em breve!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants?.map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                <Card className="group cursor-pointer border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img 
                      src={restaurant.image_url || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'} 
                      alt={restaurant.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary text-white border-0 font-medium">
                        {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700 border-0">
                        <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                        4.5
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                      {restaurant.description || 'Deliciosa comida para você!'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Truck className="w-4 h-4 mr-1" />
                        {restaurant.delivery_fee > 0 
                          ? `R$ ${restaurant.delivery_fee.toFixed(2)}`
                          : 'Grátis'
                        }
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {restaurant.city_state || 'Local'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedRestaurants;