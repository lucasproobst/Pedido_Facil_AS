
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, ChefHat, Truck, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      name: string;
    };
  }>;
}

interface OrderTrackingProps {
  order: Order;
}

const OrderTracking = ({ order }: OrderTrackingProps) => {
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);

  const handleConfirmDelivery = async () => {
    setIsConfirmingDelivery(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Entrega confirmada!', {
        description: 'Obrigado por confirmar o recebimento do seu pedido.'
      });
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      toast.error('Erro ao confirmar entrega. Tente novamente.');
    } finally {
      setIsConfirmingDelivery(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'preparing':
        return <ChefHat className="w-5 h-5 text-blue-600" />;
      case 'ready':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'dispatched':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando confirmação',
      accepted: 'Confirmado',
      rejected: 'Recusado',
      preparing: 'Preparando',
      ready: 'Pronto para retirada',
      dispatched: 'Saiu para entrega',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status] || status;
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 20;
      case 'preparing': return 40;
      case 'ready': return 60;
      case 'dispatched': return 80;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span>Pedido #{order.id.slice(-8)}</span>
            </CardTitle>
            <p className="text-gray-600 text-sm mt-1">
              {new Date(order.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="text-right">
            <Badge className={`${getStatusColor(order.status)} border`}>
              {getStatusLabel(order.status)}
            </Badge>
            {order.estimated_time && ['accepted', 'preparing'].includes(order.status) && (
              <p className="text-sm text-gray-600 mt-1">
                Previsão: {order.estimated_time} min
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Informações do Restaurante */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              {order.restaurants?.name}
            </h3>
            <div className="space-y-1">
              {order.order_items?.map((item) => (
                <p key={item.id} className="text-gray-600">
                  • {item.quantity}x {item.products?.name} - R$ {item.total_price.toFixed(2)}
                </p>
              ))}
            </div>
          </div>

          {/* Endereço de entrega */}
          <div>
            <p className="text-sm font-medium text-gray-700">Endereço de entrega:</p>
            <p className="text-sm text-gray-600">{order.delivery_address}</p>
          </div>

          {/* Observações */}
          {order.notes && (
            <div>
              <p className="text-sm font-medium text-gray-700">Observações:</p>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold text-primary">
              R$ {(order.total_amount + (order.delivery_fee || 0)).toFixed(2)}
            </span>
          </div>

          {/* Barra de progresso */}
          {order.status !== 'rejected' && order.status !== 'cancelled' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Confirmado</span>
                <span>Preparando</span>
                <span>Pronto</span>
                <span>Saiu</span>
                <span>Entregue</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(order.status)}%` }}
                />
              </div>
            </div>
           )}

          {/* Botão de confirmação de entrega */}
          {order.status === 'dispatched' && (
            <div className="pt-4 border-t">
              <Button
                onClick={handleConfirmDelivery}
                disabled={isConfirmingDelivery}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isConfirmingDelivery ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirmando entrega...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar que recebi o pedido
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Clique apenas quando receber seu pedido
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTracking;
