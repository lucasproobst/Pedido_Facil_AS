
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Preço deve ser maior que 0'),
  category_id: z.string().optional(),
  preparation_time: z.number().min(1, 'Tempo de preparo deve ser maior que 0').default(15),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  restaurantId: string;
  categories: any[];
  product?: any;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  restaurantId,
  categories,
  product,
  onSuccess,
}) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category_id: product?.category_id || '',
      preparation_time: product?.preparation_time || 15,
    },
  });

  const selectedCategoryId = watch('category_id');

  const saveProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            category_id: data.category_id || null,
            preparation_time: data.preparation_time,
          })
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({
          name: data.name,
          description: data.description,
          price: data.price,
          category_id: data.category_id || null,
          preparation_time: data.preparation_time,
          restaurant_id: restaurantId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
      toast.success(
        product ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!'
      );
      reset();
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving product:', error);
      toast.error('Erro ao salvar produto');
    },
  });

  const onSubmit = (data: ProductFormData) => {
    saveProductMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nome do Produto</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && (
            <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register('description')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category_id">Categoria</Label>
          <Select
            value={selectedCategoryId}
            onValueChange={(value) => setValue('category_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="preparation_time">Tempo de Preparo (min)</Label>
          <Input
            id="preparation_time"
            type="number"
            {...register('preparation_time', { valueAsNumber: true })}
          />
          {errors.preparation_time && (
            <p className="text-sm text-destructive mt-1">
              {errors.preparation_time.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saveProductMutation.isPending}>
          {saveProductMutation.isPending
            ? 'Salvando...'
            : product
            ? 'Atualizar Produto'
            : 'Criar Produto'}
        </Button>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
