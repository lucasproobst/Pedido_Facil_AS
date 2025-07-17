
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const deliveryAreaSchema = z.object({
  area_name: z.string().min(1, 'Nome da área é obrigatório'),
  postal_codes: z.string().min(1, 'CEPs são obrigatórios'),
  delivery_fee: z.number().min(0, 'Taxa deve ser positiva').default(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  radius_km: z.number().min(1, 'Raio deve ser positivo').default(5),
});

type DeliveryAreaFormData = z.infer<typeof deliveryAreaSchema>;

interface DeliveryAreaManagementProps {
  restaurantId: string;
}

const DeliveryAreaManagement: React.FC<DeliveryAreaManagementProps> = ({ restaurantId }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryAreaFormData>({
    resolver: zodResolver(deliveryAreaSchema),
    defaultValues: {
      delivery_fee: 0,
      radius_km: 5,
    },
  });

  const { data: deliveryAreas, isLoading } = useQuery({
    queryKey: ['delivery-areas', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_areas')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createAreaMutation = useMutation({
    mutationFn: async (data: DeliveryAreaFormData) => {
      const postalCodesArray = data.postal_codes
        .split(',')
        .map((code) => code.trim())
        .filter((code) => code.length > 0);

      const { error } = await supabase.from('delivery_areas').insert([
        {
          restaurant_id: restaurantId,
          area_name: data.area_name,
          postal_codes: postalCodesArray,
          delivery_fee: data.delivery_fee,
          latitude: data.latitude,
          longitude: data.longitude,
          radius_km: data.radius_km,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-areas', restaurantId] });
      toast.success('Área de entrega criada com sucesso!');
      reset();
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Error creating delivery area:', error);
      toast.error('Erro ao criar área de entrega');
    },
  });

  const deleteAreaMutation = useMutation({
    mutationFn: async (areaId: string) => {
      const { error } = await supabase
        .from('delivery_areas')
        .delete()
        .eq('id', areaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery-areas', restaurantId] });
      toast.success('Área de entrega excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting delivery area:', error);
      toast.error('Erro ao excluir área de entrega');
    },
  });

  const onSubmit = (data: DeliveryAreaFormData) => {
    createAreaMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center p-4">Carregando áreas de entrega...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Áreas de Entrega</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Área
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Área de Entrega</CardTitle>
            <CardDescription>
              Defina uma área de entrega com os CEPs atendidos e a taxa de entrega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="area_name">Nome da Área</Label>
                <Input
                  id="area_name"
                  placeholder="Ex: Centro, Zona Sul, etc."
                  {...register('area_name')}
                />
                {errors.area_name && (
                  <p className="text-sm text-destructive mt-1">{errors.area_name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="postal_codes">
                  CEPs Atendidos
                  <span className="text-sm text-muted-foreground ml-2">
                    (separados por vírgula)
                  </span>
                </Label>
                <Input
                  id="postal_codes"
                  placeholder="Ex: 01234-567, 12345-678, 23456-789"
                  {...register('postal_codes')}
                />
                {errors.postal_codes && (
                  <p className="text-sm text-destructive mt-1">{errors.postal_codes.message}</p>
                )}
              </div>

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

              <div className="flex gap-2">
                <Button type="submit" disabled={createAreaMutation.isPending}>
                  {createAreaMutation.isPending ? 'Criando...' : 'Criar Área'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {deliveryAreas && deliveryAreas.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">Nenhuma área de entrega cadastrada</h4>
            <p className="text-muted-foreground mb-4">
              Defina as áreas onde você realiza entregas e suas respectivas taxas.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Área
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {deliveryAreas?.map((area) => (
          <Card key={area.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {area.area_name}
                  </CardTitle>
                  <CardDescription>
                    Taxa de entrega: R$ {area.delivery_fee?.toFixed(2)}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteAreaMutation.mutate(area.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h5 className="font-medium mb-2">CEPs Atendidos:</h5>
                <div className="flex flex-wrap gap-2">
                  {area.postal_codes?.map((code, index) => (
                    <Badge key={index} variant="secondary">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeliveryAreaManagement;
