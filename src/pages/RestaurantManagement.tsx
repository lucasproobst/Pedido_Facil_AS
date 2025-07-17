import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Store, Package, MapPin, Clock, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import RestaurantForm from '@/components/restaurant/RestaurantForm';
import ProductManagement from '@/components/restaurant/ProductManagement';
import DeliveryAreaManagement from '@/components/restaurant/DeliveryAreaManagement';
import OrderManagement from '@/components/restaurant/OrderManagement';

const RestaurantManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('restaurants')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('Status do restaurante atualizado!');
    },
    onError: (error) => {
      console.error('Error updating restaurant status:', error);
      toast.error('Erro ao atualizar status do restaurante');
    },
  });

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Restaurantes</h1>
          <p className="text-muted-foreground">Gerencie seus restaurantes, produtos, áreas de entrega e pedidos</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Restaurante
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadastrar Novo Restaurante</CardTitle>
          </CardHeader>
          <CardContent>
            <RestaurantForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      {restaurants && restaurants.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Store className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum restaurante cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro restaurante para gerenciar produtos e entregas.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Restaurante
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6">
        {restaurants?.map((restaurant) => (
          <Card key={restaurant.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {restaurant.name}
                    <Badge variant={restaurant.is_active ? 'default' : 'secondary'}>
                      {restaurant.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{restaurant.description}</CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    toggleActiveMutation.mutate({
                      id: restaurant.id,
                      is_active: !restaurant.is_active,
                    })
                  }
                >
                  {restaurant.is_active ? 'Desativar' : 'Ativar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{restaurant.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {restaurant.delivery_time_min}-{restaurant.delivery_time_max} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Taxa: R$ {restaurant.delivery_fee?.toFixed(2)}
                  </span>
                </div>
              </div>

              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="orders">
                    <Package className="w-4 h-4 mr-2" />
                    Pedidos
                  </TabsTrigger>
                  <TabsTrigger value="products">
                    <Package className="w-4 h-4 mr-2" />
                    Produtos
                  </TabsTrigger>
                  <TabsTrigger value="delivery">
                    <MapPin className="w-4 h-4 mr-2" />
                    Áreas de Entrega
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="orders">
                  <OrderManagement />
                </TabsContent>
                <TabsContent value="products">
                  <ProductManagement restaurantId={restaurant.id} />
                </TabsContent>
                <TabsContent value="delivery">
                  <DeliveryAreaManagement restaurantId={restaurant.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RestaurantManagement;
