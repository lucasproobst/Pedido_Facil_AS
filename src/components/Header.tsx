
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LocationSelector from '@/components/LocationSelector';
import { 
  User, 
  ShoppingCart, 
  LogOut,
  Search,
  Menu,
  Store
} from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const { itemCount, totalValue } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Pedido Fácil</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar restaurantes ou pratos..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </form>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {/* Location */}
            <div className="hidden sm:flex">
              <LocationSelector />
            </div>

            {isAuthenticated ? (
              <>
                {/* User Name */}
                {profile?.name && (
                  <div className="hidden md:flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Olá, {profile.name}!</span>
                  </div>
                )}

                {/* Cart with value */}
                <Link to="/cart" className="relative group">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                  {totalValue > 0 && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      R$ {totalValue.toFixed(2)}
                    </div>
                  )}
                </Link>

                {/* Restaurant Management */}
                <Link to="/restaurant-login">
                  <Button variant="ghost" size="icon" title="Login Restaurante">
                    <Store className="w-5 h-5" />
                  </Button>
                </Link>

                {/* User Menu - Desktop */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link to="/register">
                  <Button>Cadastrar</Button>
                </Link>
                <Link to="/restaurant-login">
                  <Button variant="outline">
                    <Store className="w-4 h-4 mr-2" />
                    Restaurante
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {/* Location for mobile */}
              <div className="px-3 py-2">
                <LocationSelector />
              </div>
              
              {profile?.name && (
                <div className="px-3 py-2 text-gray-700 font-medium">
                  Olá, {profile.name}!
                </div>
              )}
              <Link to="/dashboard" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Dashboard
              </Link>
              <Link to="/restaurant-login" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Login Restaurante
              </Link>
              <Link to="/profile" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Perfil
              </Link>
              <Link to="/orders" className="px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
                Pedidos
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded"
              >
                Sair
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
