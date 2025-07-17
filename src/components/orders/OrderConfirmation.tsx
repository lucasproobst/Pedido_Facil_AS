
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderConfirmationProps {
  order: any;
  onConfirm: () => void;
  onCancel: () => void;
}

const OrderConfirmation = ({ order, onConfirm, onCancel }: OrderConfirmationProps) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      // Atualizar status do pedido para confirmado
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      // Enviar email de confirmação
      await supabase.functions.invoke('send-order-confirmation', {
        body: { orderId: order.id }
      });

      toast.success('Pedido confirmado com sucesso!');
      onConfirm();
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
      toast.error('Erro ao confirmar pedido. Tente novamente.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Pedido cancelado com sucesso!');
      onCancel();
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      toast.error('Erro ao cancelar pedido. Tente novamente.');
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Confirme seu Pedido
        </CardTitle>
        <p className="text-muted-foreground">
          Revise os detalhes do seu pedido antes de confirmar
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Detalhes do Restaurante */}
        <div className="flex items-center space-x-4">
          {order.restaurants?.image_url && (
            <img 
              src={order.restaurants.image_url} 
              alt={order.restaurants.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-lg">{order.restaurants?.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {order.restaurants?.delivery_time_min}-{order.restaurants?.delivery_time_max} min
            </p>
          </div>
        </div>

        <Separator />

        {/* Itens do Pedido */}
        <div>
          <h4 className="font-semibold mb-3">Itens do Pedido</h4>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-sm">
                  {item.quantity}x {item.products?.name}
                </span>
                <span className="font-medium">
                  R$ {item.total_price.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Endereço de Entrega */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Endereço de Entrega
          </h4>
          <p className="text-sm text-muted-foreground">
            {order.delivery_address}
          </p>
        </div>

        {/* Observações */}
        {order.notes && (
          <div>
            <h4 className="font-semibold mb-2">Observações</h4>
            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
              {order.notes}
            </p>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>R$ {order.total_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de entrega:</span>
            <span>R$ {(order.delivery_fee || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>R$ {(order.total_amount + (order.delivery_fee || 0)).toFixed(2)}</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex space-x-4 pt-4">
          <Button 
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
            disabled={isCanceling || isConfirming}
          >
            {isCanceling ? 'Cancelando...' : 'Cancelar Pedido'}
          </Button>
          <Button 
            onClick={handleConfirm}
            className="flex-1"
            disabled={isConfirming || isCanceling}
          >
            {isConfirming ? 'Confirmando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderConfirmation;
