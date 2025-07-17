
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChefHat, 
  Truck
} from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
    case 'accepted': return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
    case 'preparing': return <ChefHat className="w-5 h-5 text-blue-600" />;
    case 'ready': return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'dispatched': return <Truck className="w-5 h-5 text-purple-600" />;
    case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
    default: return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ready': return 'bg-green-100 text-green-800 border-green-200';
    case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Aguardando',
    accepted: 'Aceito',
    rejected: 'Recusado',
    preparing: 'Preparando',
    ready: 'Pronto',
    dispatched: 'Saiu para entrega',
    delivered: 'Entregue'
  };
  return labels[status] || status;
};
