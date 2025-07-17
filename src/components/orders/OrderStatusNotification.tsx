
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle, Clock, ChefHat, Truck, XCircle } from 'lucide-react';

interface OrderStatusNotificationProps {
  status: string;
  orderNumber: string;
  restaurantName: string;
  estimatedTime?: number;
}

const OrderStatusNotification = ({ 
  status, 
  orderNumber, 
  restaurantName, 
  estimatedTime 
}: OrderStatusNotificationProps) => {
  useEffect(() => {
    const showNotification = () => {
      const statusMessages = {
        pending: {
          title: '🕐 Pedido Enviado!',
          message: `Seu pedido #${orderNumber} foi enviado para ${restaurantName} e está aguardando confirmação.`,
          icon: <Clock className="w-5 h-5" />
        },
        accepted: {
          title: '✅ Pedido Confirmado!',
          message: `${restaurantName} confirmou seu pedido #${orderNumber}! ${estimatedTime ? `Tempo estimado: ${estimatedTime} minutos` : ''}`,
          icon: <CheckCircle className="w-5 h-5" />
        },
        rejected: {
          title: '❌ Pedido Recusado',
          message: `Infelizmente ${restaurantName} não pode aceitar seu pedido #${orderNumber}. Você será reembolsado.`,
          icon: <XCircle className="w-5 h-5" />
        },
        preparing: {
          title: '👨‍🍳 Preparando seu Pedido!',
          message: `${restaurantName} começou a preparar seu pedido #${orderNumber}!`,
          icon: <ChefHat className="w-5 h-5" />
        },
        ready: {
          title: '🍽️ Pedido Pronto!',
          message: `Seu pedido #${orderNumber} está pronto no ${restaurantName}!`,
          icon: <CheckCircle className="w-5 h-5" />
        },
        dispatched: {
          title: '🚚 Pedido a Caminho!',
          message: `Seu pedido #${orderNumber} saiu para entrega!`,
          icon: <Truck className="w-5 h-5" />
        },
        delivered: {
          title: '🎉 Pedido Entregue!',
          message: `Seu pedido #${orderNumber} foi entregue! Bom apetite!`,
          icon: <CheckCircle className="w-5 h-5" />
        }
      };

      const notification = statusMessages[status as keyof typeof statusMessages];
      
      if (notification) {
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
          action: {
            label: 'Ver Pedido',
            onClick: () => window.location.href = '/orders'
          }
        });
      }
    };

    showNotification();
  }, [status, orderNumber, restaurantName, estimatedTime]);

  return null;
};

export default OrderStatusNotification;
