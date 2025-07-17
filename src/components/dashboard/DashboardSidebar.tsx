
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingCart, 
  Clock, 
  Heart,
  MapPin
} from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  image: string;
  category: string;
  deliveryTime: string;
}

interface DashboardSidebarProps {
  itemCount: number;
  totalValue: number;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ itemCount, totalValue }) => {
  const favoriteRestaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Burger King',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=150&h=150&fit=crop',
      category: 'Fast Food',
      deliveryTime: '25-35 min'
    },
    {
      id: '2',
      name: 'Pizza Hut',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150&h=150&fit=crop',
      category: 'Pizza',
      deliveryTime: '30-40 min'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Cart */}
      {itemCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Carrinho Atual</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
                <span className="font-semibold">R$ {totalValue.toFixed(2)}</span>
              </div>
              <Link to="/cart">
                <Button className="w-full">
                  Finalizar Pedido
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Favorite Restaurants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Favoritos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {favoriteRestaurants.map((restaurant) => (
            <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <img 
                  src={restaurant.image} 
                  alt={restaurant.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{restaurant.name}</h4>
                  <p className="text-sm text-gray-600">{restaurant.category}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          <Link to="/restaurants">
            <Button variant="outline" className="w-full" size="sm">
              Explorar Mais
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/restaurants">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Explorar Restaurantes
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Gerenciar Perfil
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSidebar;
