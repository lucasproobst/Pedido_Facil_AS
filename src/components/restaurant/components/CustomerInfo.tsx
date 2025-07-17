
import React from 'react';
import { User, Phone, MapPin } from 'lucide-react';
import { OrderWithDetails } from '../types/OrderTypes';

interface CustomerInfoProps {
  order: OrderWithDetails;
}

const CustomerInfo = ({ order }: CustomerInfoProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          Cliente
        </h4>
        <p>{order.profiles?.name || 'Nome não disponível'}</p>
        {order.profiles?.phone && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {order.profiles.phone}
          </p>
        )}
      </div>

      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Endereço
        </h4>
        <p className="text-sm">{order.delivery_address}</p>
      </div>
    </div>
  );
};

export default CustomerInfo;
