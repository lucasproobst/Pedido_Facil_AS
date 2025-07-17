import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ productId, className }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verificar se o produto está nos favoritos
  const { data: isFavorite } = useQuery({
    queryKey: ['favorite', user?.id, productId],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('product_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking favorite:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Adicionar/remover favorito
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      if (isFavorite) {
        // Remover dos favoritos
        const { error } = await supabase
          .from('product_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        return false;
      } else {
        // Adicionar aos favoritos
        const { error } = await supabase
          .from('product_favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
          });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (isNowFavorite) => {
      queryClient.invalidateQueries({ queryKey: ['favorite', user?.id, productId] });
      toast.success(
        isNowFavorite 
          ? 'Produto adicionado aos favoritos!' 
          : 'Produto removido dos favoritos!'
      );
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Erro ao atualizar favoritos');
    },
  });

  if (!user) return null;

  return (
    <Button
      size="icon"
      variant="ghost"
      className={className}
      onClick={() => toggleFavoriteMutation.mutate()}
      disabled={toggleFavoriteMutation.isPending}
    >
      <Heart 
        className={`w-5 h-5 ${
          isFavorite 
            ? 'text-red-500 fill-current' 
            : 'text-gray-400 hover:text-red-500'
        }`} 
      />
    </Button>
  );
};