
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CardTitle } from '@/components/ui/card';
import { OrderWithDetails } from '../types/OrderTypes';
import { getStatusIcon, getStatusColor, getStatusLabel } from '../utils/orderStatusUtils';

interface OrderHeaderProps {
  order: OrderWithDetails;
}

const OrderHeader = ({ order }: OrderHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-lg flex items-center gap-2">
          {getStatusIcon(order.status)}
          <span>Pedido #{order.id.slice(-8)}</span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          {new Date(order.created_at).toLocaleString('pt-BR')}
        </p>
      </div>
      <Badge className={`${getStatusColor(order.status)} border`}>
        {getStatusLabel(order.status)}
      </Badge>
    </div>
  );
};

export default OrderHeader;
