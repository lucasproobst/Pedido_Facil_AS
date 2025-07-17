
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { OrderWithDetails } from '../types/OrderTypes';

export const useOrderManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['restaurant-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Fetching orders for restaurant owner:', user.id);

      // Primeiro, buscar os restaurantes do usuário
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id);

      if (restaurantsError) {
        console.error('Error fetching restaurants:', restaurantsError);
        throw restaurantsError;
      }

      if (!restaurants || restaurants.length === 0) {
        console.log('No restaurants found for user:', user.id);
        return [];
      }

      const restaurantIds = restaurants.map(r => r.id);
      console.log('Restaurant IDs:', restaurantIds);

      // Buscar pedidos dos restaurantes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (
              name,
              price
            )
          )
        `)
        .in('restaurant_id', restaurantIds)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('Orders found:', ordersData?.length || 0);

      if (!ordersData || ordersData.length === 0) {
        return [];
      }

      // Buscar informações dos usuários separadamente
      const userIds = [...new Set(ordersData.map(order => order.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, phone')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continuar mesmo se não conseguir buscar os perfis
      }

      // Combinar os dados
      const ordersWithProfiles = ordersData.map(order => ({
        ...order,
        profiles: profiles?.find(profile => profile.id === order.user_id) || {
          name: 'Cliente',
          phone: null
        }
      })) as OrderWithDetails[];

      console.log('Orders with profiles:', ordersWithProfiles);
      return ordersWithProfiles;
    },
    enabled: !!user?.id,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (variables: { orderId: string; status: string; estimatedTime?: number }) => {
      const updateData: any = { 
        status: variables.status,
        updated_at: new Date().toISOString()
      };

      if (variables.status === 'accepted' && variables.estimatedTime) {
        updateData.estimated_time = variables.estimatedTime;
        updateData.accepted_at = new Date().toISOString();
      } else if (variables.status === 'dispatched') {
        updateData.dispatched_at = new Date().toISOString();
      } else if (variables.status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', variables.orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
    },
  });

  return {
    orders,
    isLoading,
    updateOrderStatus: (orderId: string, status: string, estimatedTime?: number) => 
      updateOrderMutation.mutate({ orderId, status, estimatedTime }),
    isUpdating: updateOrderMutation.isPending
  };
};
