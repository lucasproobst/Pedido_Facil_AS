
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentOrders from '@/components/dashboard/RecentOrders';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();
  const { itemCount, totalValue } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection user={user} profile={profile} />
        
        <StatsCards itemCount={itemCount} totalValue={totalValue} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentOrders />
          </div>

          <DashboardSidebar itemCount={itemCount} totalValue={totalValue} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
