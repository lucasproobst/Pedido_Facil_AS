
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useOrderManagement } from './hooks/useOrderManagement';
import OrderCard from './components/OrderCard';
import { useAuth } from '@/contexts/AuthContext';

const OrderManagement = () => {
  const { orders, isLoading, updateOrderStatus, isUpdating } = useOrderManagement();
  const { user } = useAuth();

  console.log('OrderManagement - Current user:', user?.id);
  console.log('OrderManagement - Orders count:', orders?.length || 0);
  console.log('OrderManagement - Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Pedidos Recebidos</h3>
        <span className="text-sm text-gray-500">
          {orders?.length || 0} pedido(s) encontrado(s)
        </span>
      </div>
      
      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="space-y-2">
              <p className="text-gray-600">Nenhum pedido recebido ainda.</p>
              <p className="text-sm text-gray-500">
                Usuário logado: {user?.id}
              </p>
              <p className="text-xs text-gray-400">
                Os pedidos aparecerão aqui quando os clientes fizerem compras em seus restaurantes.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onUpdateOrder={updateOrderStatus} 
              isLoading={isUpdating} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
