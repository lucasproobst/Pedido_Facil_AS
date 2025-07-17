
import React from 'react';
import { OrderWithDetails } from '../types/OrderTypes';

interface OrderItemsProps {
  order: OrderWithDetails;
}

const OrderItems = ({ order }: OrderItemsProps) => {
  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-2">Itens do Pedido</h4>
      <div className="space-y-2">
        {order.order_items?.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b">
            <div>
              <span className="font-medium">{item.quantity}x {item.products?.name || 'Produto não disponível'}</span>
            </div>
            <span className="font-semibold">
              R$ {item.total_price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2 text-lg font-bold">
        <span>Total:</span>
        <span>R$ {order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderItems;
