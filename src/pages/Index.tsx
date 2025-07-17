
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import FeaturedRestaurants from '@/components/restaurants/FeaturedRestaurants';
import { 
  Clock, 
  Truck, 
  Star, 
  Shield,
  ArrowRight
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Clock,
      title: 'Entrega Rápida',
      description: 'Seus pratos favoritos em até 30 minutos'
    },
    {
      icon: Truck,
      title: 'Frete Grátis',
      description: 'Entrega gratuita em pedidos acima de R$ 30'
    },
    {
      icon: Star,
      title: 'Avaliações Reais',
      description: 'Comentários verificados de clientes reais'
    },
    {
      icon: Shield,
      title: 'Pagamento Seguro',
      description: 'Suas informações sempre protegidas'
    }
  ];

  const popularRestaurants = [
    {
      id: '1',
      name: 'Burger King',
      image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop',
      rating: 4.5,
      deliveryTime: '25-35 min',
      category: 'Fast Food',
      delivery: 'Grátis'
    },
    {
      id: '2',
      name: 'Pizza Hut',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=200&fit=crop',
      rating: 4.7,
      deliveryTime: '30-40 min',
      category: 'Pizza',
      delivery: 'R$ 5,99'
    },
    {
      id: '3',
      name: 'Sushi Zen',
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
      rating: 4.8,
      deliveryTime: '20-30 min',
      category: 'Japonês',
      delivery: 'Grátis'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-orange-500 text-white py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Sua comida favorita
              <span className="block text-orange-100">na sua casa</span>
            </h1>
            <p className="text-xl mb-8 text-orange-50 leading-relaxed max-w-2xl mx-auto">
              Descubra milhares de restaurantes e peça sua comida favorita 
              com entrega rápida e segura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/restaurants">
                <Button size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-gray-50 font-medium">
                  Explorar Restaurantes
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary font-medium bg-transparent">
                  Cadastre-se Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Pedido Fácil?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos a melhor experiência de delivery com qualidade e rapidez
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <FeaturedRestaurants />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-orange-500 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 text-orange-50">
            Cadastre-se agora e receba cupons de desconto exclusivos
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-50 font-medium">
              Criar Conta Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold">Pedido Fácil</span>
              </div>
              <p className="text-gray-400">
                A melhor plataforma de delivery do Brasil
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-white cursor-pointer">Sobre nós</p>
                <p className="hover:text-white cursor-pointer">Carreiras</p>
                <p className="hover:text-white cursor-pointer">Imprensa</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-white cursor-pointer">Central de Ajuda</p>
                <p className="hover:text-white cursor-pointer">Contato</p>
                <p className="hover:text-white cursor-pointer">Termos de Uso</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Restaurantes</h3>
              <div className="space-y-2 text-gray-400">
                <p className="hover:text-white cursor-pointer">Seja um Parceiro</p>
                <p className="hover:text-white cursor-pointer">App para Restaurantes</p>
                <p className="hover:text-white cursor-pointer">Suporte Comercial</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Pedido Fácil. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
