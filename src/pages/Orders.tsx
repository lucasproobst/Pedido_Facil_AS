import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import OrderTracking from '@/components/orders/OrderTracking';
import OrderStatusNotification from '@/components/orders/OrderStatusNotification';
import OrderConfirmation from '@/components/orders/OrderConfirmation';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InvoiceGenerator } from '@/components/invoice/InvoiceGenerator';
import { WhatsAppSender } from '@/components/whatsapp/WhatsAppSender';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  products: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_address: string;
  delivery_fee: number;
  estimated_time: number;
  notes: string;
  created_at: string;
  restaurants: {
    name: string;
    image_url: string;
  };
  order_items: OrderItem[];
}

const Orders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastOrderStatuses, setLastOrderStatuses] = useState<Record<string, string>>({});
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Buscar pedidos do usuário
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (
            name,
            image_url
          ),
          order_items (
            *,
            products (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });

  // Escutar atualizações em tempo real e mostrar notificações
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time order update:', payload);
          queryClient.invalidateQueries({ queryKey: ['user-orders'] });
          
          // Verificar se é uma mudança de status para mostrar notificação
          if (payload.eventType === 'UPDATE') {
            const orderId = payload.new.id;
            const newStatus = payload.new.status;
            const oldStatus = lastOrderStatuses[orderId];
            
            // Só mostrar notificação se o status realmente mudou
            if (oldStatus && oldStatus !== newStatus) {
              // Encontrar o pedido para obter detalhes
              const order = orders?.find(o => o.id === orderId);
              if (order) {
                // Mostrar notificação de status
                const notification = (
                  <OrderStatusNotification
                    key={`${orderId}-${newStatus}`}
                    status={newStatus}
                    orderNumber={orderId.slice(-8)}
                    restaurantName={order.restaurants?.name || 'Restaurante'}
                    estimatedTime={payload.new.estimated_time}
                  />
                );
              }
            }
            
            // Atualizar o último status conhecido
            setLastOrderStatuses(prev => ({
              ...prev,
              [orderId]: newStatus
            }));
          }

          // Se é um novo pedido, mostrar confirmação
          if (payload.eventType === 'INSERT') {
            // Buscar detalhes do pedido recém-criado
            setTimeout(() => {
              const newOrder = orders?.find(o => o.id === payload.new.id);
              if (newOrder && newOrder.status === 'pending') {
                setPendingOrder(newOrder);
                setShowConfirmation(true);
              }
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient, orders, lastOrderStatuses]);

  // Inicializar status dos pedidos
  useEffect(() => {
    if (orders) {
      const statusMap: Record<string, string> = {};
      orders.forEach(order => {
        statusMap[order.id] = order.status;
      });
      setLastOrderStatuses(statusMap);
    }
  }, [orders]);

  const handleOrderConfirmed = () => {
    setShowConfirmation(false);
    setPendingOrder(null);
    queryClient.invalidateQueries({ queryKey: ['user-orders'] });
  };

  const handleOrderCancelled = () => {
    setShowConfirmation(false);
    setPendingOrder(null);
    queryClient.invalidateQueries({ queryKey: ['user-orders'] });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Carregando seus pedidos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pedidos</h1>
            <p className="text-gray-600">Acompanhe o status dos seus pedidos em tempo real</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        <div className="space-y-6">
          {!orders || orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não fez nenhum pedido. Que tal começar agora?
                </p>
                <Button size="lg">
                  Explorar Restaurantes
                </Button>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="space-y-4">
                <OrderTracking order={order} />
                
                {order.status === 'delivered' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <InvoiceGenerator orderId={order.id} orderData={order} />
                    <WhatsAppSender orderData={order} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog de Confirmação de Pedido */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-3xl">
          {pendingOrder && (
            <OrderConfirmation
              order={pendingOrder}
              onConfirm={handleOrderConfirmed}
              onCancel={handleOrderCancelled}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
