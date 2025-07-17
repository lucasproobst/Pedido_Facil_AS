
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { OrderWithDetails } from '../types/OrderTypes';
import OrderHeader from './OrderHeader';
import CustomerInfo from './CustomerInfo';
import OrderItems from './OrderItems';
import OrderActions from './OrderActions';

interface OrderCardProps {
  order: OrderWithDetails;
  onUpdateOrder: (orderId: string, status: string, estimatedTime?: number) => void;
  isLoading: boolean;
}

const OrderCard = ({ order, onUpdateOrder, isLoading }: OrderCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <OrderHeader order={order} />
      </CardHeader>

      <CardContent className="p-6">
        <CustomerInfo order={order} />
        <OrderItems order={order} />

        {order.notes && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Observações</h4>
            <p className="text-sm bg-gray-50 p-3 rounded">{order.notes}</p>
          </div>
        )}

        <OrderActions 
          order={order} 
          onUpdateOrder={onUpdateOrder} 
          isLoading={isLoading} 
        />

        {order.estimated_time && order.status !== 'delivered' && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              <Clock className="w-4 h-4 inline mr-1" />
              Tempo estimado: {order.estimated_time} minutos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderCard;
