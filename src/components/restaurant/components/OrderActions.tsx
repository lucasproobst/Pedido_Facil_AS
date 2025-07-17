
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ChefHat, Truck } from 'lucide-react';
import { OrderWithDetails } from '../types/OrderTypes';

interface OrderActionsProps {
  order: OrderWithDetails;
  onUpdateOrder: (orderId: string, status: string, estimatedTime?: number) => void;
  isLoading: boolean;
}

const OrderActions = ({ order, onUpdateOrder, isLoading }: OrderActionsProps) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {order.status === 'pending' && (
        <>
          <Button
            onClick={() => onUpdateOrder(order.id, 'accepted', 30)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Aceitar (30 min)
          </Button>
          <Button
            onClick={() => onUpdateOrder(order.id, 'rejected')}
            disabled={isLoading}
            variant="destructive"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Recusar
          </Button>
        </>
      )}

      {order.status === 'accepted' && (
        <Button
          onClick={() => onUpdateOrder(order.id, 'preparing')}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <ChefHat className="w-4 h-4 mr-2" />
          Iniciar Preparo
        </Button>
      )}

      {order.status === 'preparing' && (
        <Button
          onClick={() => onUpdateOrder(order.id, 'ready')}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Pronto
        </Button>
      )}

      {order.status === 'ready' && (
        <Button
          onClick={() => onUpdateOrder(order.id, 'dispatched')}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Truck className="w-4 h-4 mr-2" />
          Despachar
        </Button>
      )}

      {order.status === 'dispatched' && (
        <Button
          onClick={() => onUpdateOrder(order.id, 'delivered')}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar Entrega
        </Button>
      )}
    </div>
  );
};

export default OrderActions;
