
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Star, 
  Clock, 
  Truck, 
  MapPin,
  Plus,
  Minus,
  Heart,
  Share2,
  Loader2
} from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState<{[key: string]: number}>({});

  // Buscar dados reais do restaurante
  const { data: restaurant, isLoading: restaurantLoading } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      if (!id) throw new Error('ID do restaurante não encontrado');
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar restaurante:', error);
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });

  // Buscar produtos do restaurante
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['restaurant-products', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            name
          )
        `)
        .eq('restaurant_id', id)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = (item: any) => {
    const quantity = quantities[item.id] || 1;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop',
        restaurantId: restaurant?.id!,
        restaurantName: restaurant?.name!
      });
    }
    
    toast.success(`${item.name} adicionado ao carrinho!`);
    setQuantities(prev => ({ ...prev, [item.id]: 1 }));
  };

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change)
    }));
  };

  // Agrupar produtos por categoria
  const groupedProducts = products?.reduce((acc, product) => {
    const categoryName = product.product_categories?.name || 'Outros';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
  }, {} as Record<string, any[]>) || {};

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando restaurante...</span>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurante não encontrado</h2>
              <p className="text-gray-600">O restaurante que você procura não existe ou foi removido.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Restaurant Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64 md:h-80">
            <img 
              src={restaurant.image_url || 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=400&fit=crop'} 
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-lg opacity-90">{restaurant.description || 'Deliciosa comida para você!'}</p>
            </div>
            <div className="absolute top-6 right-6 flex space-x-2">
              <Button size="icon" variant="secondary" className="bg-white/20 backdrop-blur-sm">
                <Share2 className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">4.5</span>
                <span className="text-gray-600">(Novo restaurante)</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>{restaurant.delivery_time_min}-{restaurant.delivery_time_max} min</span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <Truck className="w-5 h-5" />
                <span>
                  {restaurant.delivery_fee > 0 
                    ? `R$ ${restaurant.delivery_fee.toFixed(2)}` 
                    : 'Grátis'
                  }
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{restaurant.city_state || 'Localização'}</span>
              </div>
            </div>
            
            {restaurant.min_order_value > 0 && (
              <div className="mt-4">
                <Badge className="bg-blue-100 text-blue-800">
                  Pedido mínimo: R$ {restaurant.min_order_value.toFixed(2)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Menu */}
        {productsLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Carregando cardápio...</span>
          </div>
        ) : Object.keys(groupedProducts).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cardápio em breve</h3>
              <p className="text-gray-600">Este restaurante ainda está organizando seu cardápio.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
              <div key={categoryName}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{categoryName}</h2>
                <div className="grid gap-4">
                  {categoryProducts.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex">
                          <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop'} 
                            alt={item.name}
                            className="w-24 h-24 md:w-32 md:h-32 object-cover flex-shrink-0"
                          />
                          <div className="flex-1 p-4 flex justify-between items-center">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {item.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                              <p className="text-xl font-bold text-primary">
                                R$ {parseFloat(item.price).toFixed(2)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-3 ml-4">
                              <FavoriteButton 
                                productId={item.id} 
                                className="bg-gray-100 hover:bg-gray-200" 
                              />
                              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-8 h-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {quantities[item.id] || 1}
                                </span>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="w-8 h-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <Button 
                                onClick={() => handleAddToCart(item)}
                                className="whitespace-nowrap"
                              >
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
