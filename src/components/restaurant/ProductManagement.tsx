
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import ProductForm from './ProductForm';

interface ProductManagementProps {
  restaurantId: string;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ restaurantId }) => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_categories (
            name
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', restaurantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast.error('Erro ao excluir produto');
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({ is_available })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
      toast.success('Disponibilidade atualizada!');
    },
    onError: (error) => {
      console.error('Error updating product availability:', error);
      toast.error('Erro ao atualizar disponibilidade');
    },
  });

  if (isLoading) {
    return <div className="text-center p-4">Carregando produtos...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Produtos</h3>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              restaurantId={restaurantId}
              categories={categories || []}
              product={editingProduct}
              onSuccess={() => {
                setShowForm(false);
                setEditingProduct(null);
              }}
            />
          </CardContent>
        </Card>
      )}

      {products && products.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h4 className="font-semibold mb-2">Nenhum produto cadastrado</h4>
            <p className="text-muted-foreground mb-4">
              Adicione produtos ao seu cardápio para começar a vender.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {products?.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {product.name}
                    <Badge variant={product.is_available ? 'default' : 'secondary'}>
                      {product.is_available ? 'Disponível' : 'Indisponível'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {product.description}
                    {product.product_categories && (
                      <span className="block text-xs mt-1">
                        Categoria: {product.product_categories.name}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toggleAvailabilityMutation.mutate({
                        id: product.id,
                        is_available: !product.is_available,
                      })
                    }
                  >
                    {product.is_available ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingProduct(product);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProductMutation.mutate(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-2xl font-bold text-primary">
                    R$ {product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    Preparo: {product.preparation_time} min
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;
