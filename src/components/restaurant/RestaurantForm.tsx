
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const restaurantSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(1, 'Endereço é obrigatório'),
  city_state: z.string().min(1, 'Cidade é obrigatória'),
  delivery_fee: z.number().min(0, 'Taxa deve ser positiva').default(0),
  min_order_value: z.number().min(0, 'Valor mínimo deve ser positivo').default(0),
  delivery_time_min: z.number().min(1, 'Tempo mínimo deve ser maior que 0').default(30),
  delivery_time_max: z.number().min(1, 'Tempo máximo deve ser maior que 0').default(60),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

interface RestaurantFormProps {
  onSuccess: () => void;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cities = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA',
    'Fortaleza, CE',
    'Recife, PE',
    'Porto Alegre, RS',
    'Curitiba, PR',
    'Goiânia, GO',
    'Manaus, AM',
    'Belém, PA',
    'Vitória, ES',
    'Maceió, AL',
    'João Pessoa, PB',
    'Teresina, PI',
    'Natal, RN',
    'Campo Grande, MS',
    'Cuiabá, MT',
    'Florianópolis, SC',
    'Aracaju, SE',
    'São Luís, MA',
    'Macapá, AP',
    'Boa Vista, RR',
    'Rio Branco, AC',
    'Porto Velho, RO',
    'Palmas, TO',
    'Capão da Canoa, RS',
    'Xangri-lá, RS',
    'Tramandaí, RS',
    'Imbé, RS',
    'Torres, RS',
    'Arroio do Sal, RS',
    'Cidreira, RS',
    'Balneário Pinhal, RS',
    'Palmares do Sul, RS',
    'Osório, RS',
    'Santo Antônio da Patrulha, RS',
    'Maquiné, RS'
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      delivery_fee: 0,
      min_order_value: 0,
      delivery_time_min: 30,
      delivery_time_max: 60,
    },
  });

  const createRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantFormData) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Creating restaurant with user ID:', user.id);
      console.log('Restaurant data:', data);

      // First check if user is a restaurant owner
      const { data: ownerData, error: ownerError } = await supabase
        .from('restaurant_owners')
        .select('*')
        .eq('id', user.id)
        .single();

      if (ownerError || !ownerData) {
        throw new Error('Você precisa estar logado como dono de restaurante');
      }

      const { error } = await supabase.from('restaurants').insert({
        name: data.name,
        description: data.description || undefined,
        phone: data.phone || undefined,
        address: data.address,
        city_state: data.city_state,
        delivery_fee: data.delivery_fee,
        min_order_value: data.min_order_value,
        delivery_time_min: data.delivery_time_min,
        delivery_time_max: data.delivery_time_max,
        owner_id: user.id,
        restaurant_owner_id: user.id,
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('Restaurante criado com sucesso!');
      reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Error creating restaurant:', error);
      toast.error('Erro ao criar restaurante: ' + (error.message || 'Erro desconhecido'));
    },
  });

  const onSubmit = (data: RestaurantFormData) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para criar um restaurante');
      return;
    }
    console.log('Submitting form with user:', user.id);
    createRestaurantMutation.mutate(data);
  };

  // Don't render the form if user is not authenticated
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Você precisa estar logado como dono de restaurante para criar um restaurante.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Restaurante</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register('phone')} />
          {errors.phone && (
            <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input id="address" {...register('address')} />
          {errors.address && (
            <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="city_state">Cidade</Label>
          <Select onValueChange={(value) => setValue('city_state', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma cidade" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city_state && (
            <p className="text-sm text-destructive mt-1">{errors.city_state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
          <Input
            id="delivery_fee"
            type="number"
            step="0.01"
            {...register('delivery_fee', { valueAsNumber: true })}
          />
          {errors.delivery_fee && (
            <p className="text-sm text-destructive mt-1">{errors.delivery_fee.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="min_order_value">Pedido Mínimo (R$)</Label>
          <Input
            id="min_order_value"
            type="number"
            step="0.01"
            {...register('min_order_value', { valueAsNumber: true })}
          />
          {errors.min_order_value && (
            <p className="text-sm text-destructive mt-1">{errors.min_order_value.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="delivery_time_min">Tempo Mínimo (min)</Label>
          <Input
            id="delivery_time_min"
            type="number"
            {...register('delivery_time_min', { valueAsNumber: true })}
          />
          {errors.delivery_time_min && (
            <p className="text-sm text-destructive mt-1">{errors.delivery_time_min.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="delivery_time_max">Tempo Máximo (min)</Label>
          <Input
            id="delivery_time_max"
            type="number"
            {...register('delivery_time_max', { valueAsNumber: true })}
          />
          {errors.delivery_time_max && (
            <p className="text-sm text-destructive mt-1">{errors.delivery_time_max.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={createRestaurantMutation.isPending}>
          {createRestaurantMutation.isPending ? 'Criando...' : 'Criar Restaurante'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default RestaurantForm;
