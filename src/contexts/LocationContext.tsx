
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  locations: string[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [selectedLocation, setSelectedLocationState] = useState('São Paulo, SP');

  const locations = [
    'São Paulo, SP',
    'Rio de Janeiro, RJ',
    'Belo Horizonte, MG',
    'Brasília, DF',
    'Salvador, BA',
    'Fortaleza, CE',
    'Recife, PE',
    'Porto Alegre, RS',
    'Curitiba, PR',
    'Goiânia, GO',
    'Manaus, AM',
    'Belém, PA',
    'Vitória, ES',
    'Maceió, AL',
    'João Pessoa, PB',
    'Teresina, PI',
    'Natal, RN',
    'Campo Grande, MS',
    'Cuiabá, MT',
    'Florianópolis, SC',
    'Aracaju, SE',
    'São Luís, MA',
    'Macapá, AP',
    'Boa Vista, RR',
    'Rio Branco, AC',
    'Porto Velho, RO',
    'Palmas, TO',
    'Capão da Canoa, RS',
    'Xangri-lá, RS',
    'Tramandaí, RS',
    'Imbé, RS',
    'Torres, RS',
    'Arroio do Sal, RS',
    'Cidreira, RS',
    'Balneário Pinhal, RS',
    'Palmares do Sul, RS',
    'Osório, RS',
    'Santo Antônio da Patrulha, RS',
    'Maquiné, RS'
  ];

  // Sincronizar com os dados do perfil sempre que eles mudarem
  useEffect(() => {
    if (profile?.city_state && profile.city_state !== selectedLocation) {
      console.log('Atualizando localização do perfil:', profile.city_state);
      setSelectedLocationState(profile.city_state);
    } else if (user && !profile?.city_state) {
      // Se o usuário está logado mas não tem cidade no perfil, usar a salva localmente
      const savedLocation = localStorage.getItem(`user_location_${user.id}`);
      if (savedLocation && savedLocation !== selectedLocation) {
        setSelectedLocationState(savedLocation);
      }
    }
  }, [profile, user, selectedLocation]);

  const setSelectedLocation = (location: string) => {
    console.log('Alterando localização para:', location);
    setSelectedLocationState(location);
    if (user) {
      localStorage.setItem(`user_location_${user.id}`, location);
    }
  };

  return (
    <LocationContext.Provider value={{ selectedLocation, setSelectedLocation, locations }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
