
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Clock, CheckCircle, XCircle, ChefHat, Truck } from 'lucide-react';

const RecentOrders: React.FC = () => {
  const { user, profile } = useAuth();

  const { data: recentOrders, isLoading } = useQuery({
    queryKey: ['recent-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurants (
            name,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'preparing': return <ChefHat className="w-4 h-4 text-blue-600" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'dispatched': return <Truck className="w-4 h-4 text-purple-600" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'dispatched': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Aguardando',
      accepted: 'Confirmado',
      rejected: 'Recusado',
      preparing: 'Preparando',
      ready: 'Pronto',
      dispatched: 'A caminho',
      delivered: 'Entregue'
    };
    return labels[status] || status;
  };

  return (
    <Card className="dark:bg-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="dark:text-white">Pedidos Recentes</CardTitle>
        <Link to="/orders">
          <Button variant="outline" size="sm">
            Ver Todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">Carregando pedidos...</p>
          </div>
        ) : !recentOrders || recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum pedido ainda
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Olá {profile?.name}! Você ainda não fez nenhum pedido.
            </p>
            <Link to="/restaurants">
              <Button>
                Explorar Restaurantes
              </Button>
            </Link>
          </div>
        ) : (
          recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getStatusIcon(order.status)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.restaurants?.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    R$ {order.total_amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <Badge className={`${getStatusColor(order.status)} border text-xs`}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
