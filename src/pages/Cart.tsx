
import React from 'react';
import Header from '@/components/Header';
import { useCart } from '@/contexts/CartContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Cart = () => {
  const { items, removeItem, updateQuantity, totalValue } = useCart();

  // Agrupar itens por restaurante
  const itemsByRestaurant = items.reduce((acc, item) => {
    if (!acc[item.restaurantId]) {
      acc[item.restaurantId] = {
        restaurantName: item.restaurantName,
        items: []
      };
    }
    
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {} as Record<string, { restaurantName: string; items: any[] }>);

  // Obter ID do primeiro restaurante para buscar dados
  const firstRestaurantId = Object.keys(itemsByRestaurant)[0];
  
  // Buscar dados do restaurante para obter a taxa de entrega real
  const { data: restaurantData } = useQuery({
    queryKey: ['restaurant', firstRestaurantId],
    queryFn: async () => {
      if (!firstRestaurantId) return null;
      
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', firstRestaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }

      return data;
    },
    enabled: !!firstRestaurantId,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meu Carrinho</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {Object.keys(itemsByRestaurant).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Seu carrinho está vazio
                  </h3>
                  <p className="text-gray-600">
                    Adicione itens deliciosos para começar seu pedido!
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(itemsByRestaurant).map(([restaurantId, restaurant]) => (
                <Card key={restaurantId}>
                  <CardHeader>
                    <CardTitle>{restaurant.restaurantName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {restaurant.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-b-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-primary font-bold">
                            R$ {item.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="w-8 h-8 ml-4"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            {Object.keys(itemsByRestaurant).length > 0 && restaurantData && (
              <CheckoutForm restaurant={{
                id: restaurantData.id,
                name: restaurantData.name,
                delivery_fee: restaurantData.delivery_fee || 0
              }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
