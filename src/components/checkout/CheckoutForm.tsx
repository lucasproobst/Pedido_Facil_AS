import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, MapPin } from 'lucide-react';
import AddressSelector from './AddressSelector';
import { useGeolocation } from '@/hooks/useGeolocation';

const CheckoutForm = ({ restaurant }: { restaurant: any }) => {
  const { user } = useAuth();
  const { items, totalValue, clearCart } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [streetName, setStreetName] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const { loading: geoLoading, getCurrentPosition, getAddressFromCoordinates, location, error: geoError } = useGeolocation();

  const handleUseCurrentLocation = async () => {
    getCurrentPosition();
  };

  // Quando a localização é obtida, buscar o endereço
  React.useEffect(() => {
    if (location) {
      getAddressFromCoordinates(location.latitude, location.longitude)
        .then((address) => {
          if (address) {
            const fullAddress = `${address.components.road || ''}, ${address.components.house_number || ''} - ${address.components.suburb || address.components.neighbourhood || ''}, ${address.components.city || address.components.town || ''} - ${address.components.postcode || ''}`;
            setSelectedAddress(fullAddress.trim());
            toast.success('Localização obtida com sucesso!');
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar endereço:', error);
          toast.error('Erro ao buscar endereço da localização');
        });
    }
  }, [location]);

  React.useEffect(() => {
    if (geoError) {
      toast.error(geoError);
    }
  }, [geoError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa fazer login para finalizar o pedido');
      return;
    }

    if (!selectedAddress) {
      toast.error('Selecione um endereço de entrega');
      return;
    }

    if (items.length === 0) {
      toast.error('Adicione itens ao carrinho antes de finalizar o pedido');
      return;
    }

    setIsLoading(true);

    try {
      // Criar o pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: restaurant.id,
          total_amount: totalValue,
          delivery_address: selectedAddress,
          street_name: streetName,
          street_number: streetNumber,
          postal_code: postalCode,
          delivery_fee: restaurant.delivery_fee || 0,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Criar os itens do pedido
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        notes: null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Limpar carrinho
      clearCart();
      
      // Mostrar sucesso e redirecionar
      toast.success('Pedido realizado com sucesso!', {
        description: 'Você será redirecionado para acompanhar o pedido.',
        action: {
          label: 'Ver Pedido',
          onClick: () => navigate('/orders')
        }
      });

      // Redirecionar para a página de pedidos
      setTimeout(() => {
        navigate('/orders');
      }, 2000);

    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao finalizar pedido. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const deliveryFee = restaurant?.delivery_fee || 0;
  const finalTotal = totalValue + deliveryFee;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleUseCurrentLocation}
              disabled={geoLoading}
              className="w-full mb-4"
            >
              {geoLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4 mr-2" />
              )}
              {geoLoading ? 'Obtendo localização...' : 'Usar minha localização atual'}
            </Button>
          </div>

          <AddressSelector
            selectedAddress={selectedAddress}
            onAddressChange={(address, street, number, postal) => {
              setSelectedAddress(address);
              setStreetName(street || '');
              setStreetNumber(number || '');
              setPostalCode(postal || '');
            }}
          />

          <div>
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Adicione observações sobre seu pedido..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de entrega:</span>
              <span>R$ {deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !selectedAddress}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finalizando Pedido...
              </>
            ) : (
              `Finalizar Pedido - R$ ${finalTotal.toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CheckoutForm;
