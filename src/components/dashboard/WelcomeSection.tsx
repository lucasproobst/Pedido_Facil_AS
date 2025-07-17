
import React from 'react';
import { User } from '@supabase/supabase-js';
import { useLocation } from '@/contexts/LocationContext';

interface Profile {
  name: string;
  street?: string;
  number?: string;
  city_state?: string;
}

interface WelcomeSectionProps {
  user: User | null;
  profile: Profile | null;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user, profile }) => {
  const { selectedLocation } = useLocation();

  const formatAddress = () => {
    if (!profile) return null;
    
    const addressParts = [];
    if (profile.street) addressParts.push(profile.street);
    if (profile.number) addressParts.push(profile.number);
    
    return addressParts.length > 0 ? addressParts.join(', ') : null;
  };

  // Usar a cidade do perfil se disponível, senão usar a selecionada
  const displayLocation = profile?.city_state || selectedLocation;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Olá, {profile?.name || user?.email?.split('@')[0]}! 👋
      </h1>
      <p className="text-gray-600 dark:text-gray-400">Seja bem-vindo ao seu painel de controle</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        📍 {formatAddress() ? `${formatAddress()}, ${displayLocation}` : displayLocation}
      </p>
    </div>
  );
};

export default WelcomeSection;
