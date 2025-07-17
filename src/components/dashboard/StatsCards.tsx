
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ShoppingCart, 
  TrendingUp,
  Heart,
  Gift
} from 'lucide-react';

interface StatsCardsProps {
  itemCount: number;
  totalValue: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ itemCount, totalValue }) => {
  const { user } = useAuth();
  const [monthlyOrders, setMonthlyOrders] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Buscar pedidos do mês atual
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      setMonthlyOrders(orders?.length || 0);

      // Buscar favoritos
      const { data: favorites } = await supabase
        .from('product_favorites')
        .select('*')
        .eq('user_id', user.id);

      setFavoriteCount(favorites?.length || 0);

      // Calcular pontos (1 ponto por R$ 10 gastos)
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('user_id', user.id)
        .eq('status', 'delivered');

      const totalSpent = allOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount.toString()), 0) || 0;
      setPoints(Math.floor(totalSpent / 10));
    };

    fetchStats();
  }, [user]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Carrinho Atual</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </p>
            </div>
            <ShoppingCart className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Total: R$ {totalValue.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pedidos Este Mês</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyOrders}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {monthlyOrders === 0 ? 'Novo usuário' : `${monthlyOrders} pedido${monthlyOrders !== 1 ? 's' : ''} neste mês`}
          </p>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favoritos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{favoriteCount}</p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {favoriteCount === 0 ? 'Nenhum salvo' : `${favoriteCount} produto${favoriteCount !== 1 ? 's' : ''} favoritado${favoriteCount !== 1 ? 's' : ''}`}
          </p>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pontos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{points}</p>
            </div>
            <Gift className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {points === 0 ? 'Comece a ganhar pontos!' : `1 ponto a cada R$ 10 gastos`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
