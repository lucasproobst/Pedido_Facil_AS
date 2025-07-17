import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppSenderProps {
  orderData: any;
  customerPhone?: string;
}

export const WhatsAppSender: React.FC<WhatsAppSenderProps> = ({ orderData, customerPhone }) => {
  
  const sendWhatsAppMessage = () => {
    const message = generateOrderMessage(orderData);
    const phone = customerPhone?.replace(/\D/g, '') || '';
    
    // Remover código do país se necessário e adicionar 55 para Brasil
    const formattedPhone = phone.startsWith('55') ? phone : `55${phone}`;
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const generateOrderMessage = (order: any) => {
    const restaurant = order.restaurants?.name || 'Restaurante';
    const items = order.order_items || [];
    
    let message = `🍽️ *Resumo do seu Pedido - Pedido Fácil*\n\n`;
    message += `📍 *Restaurante:* ${restaurant}\n`;
    message += `📞 *Pedido:* ${order.id?.slice(0, 8)}...\n`;
    message += `📅 *Data:* ${new Date(order.created_at).toLocaleDateString('pt-BR')}\n`;
    message += `⏰ *Status:* ${getStatusText(order.status)}\n\n`;
    
    message += `🛍️ *Itens do Pedido:*\n`;
    items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.products?.name || 'Produto'}\n`;
      message += `   Qtd: ${item.quantity} x R$ ${parseFloat(item.unit_price).toFixed(2)}\n`;
      message += `   Total: R$ ${parseFloat(item.total_price).toFixed(2)}\n\n`;
    });
    
    const subtotal = parseFloat(order.total_amount) - parseFloat(order.delivery_fee || 0);
    message += `💰 *Resumo Financeiro:*\n`;
    message += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    message += `Taxa de Entrega: R$ ${parseFloat(order.delivery_fee || 0).toFixed(2)}\n`;
    message += `*Total: R$ ${parseFloat(order.total_amount).toFixed(2)}*\n\n`;
    
    message += `📍 *Endereço de Entrega:*\n${order.delivery_address}\n\n`;
    
    if (order.notes) {
      message += `📝 *Observações:* ${order.notes}\n\n`;
    }
    
    message += `Obrigado por escolher o Pedido Fácil! 🙏`;
    
    return message;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Aguardando confirmação',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'ready': 'Pronto',
      'dispatched': 'Saiu para entrega',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <Button
      onClick={sendWhatsAppMessage}
      className="w-full bg-green-600 hover:bg-green-700"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      Enviar Resumo via WhatsApp
    </Button>
  );
};