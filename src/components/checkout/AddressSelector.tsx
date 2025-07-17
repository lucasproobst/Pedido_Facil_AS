import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Plus, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Address {
  id: string;
  label: string;
  streetName: string;
  streetNumber: string;
  postalCode: string;
  fullAddress: string;
  isDefault?: boolean;
}

interface AddressSelectorProps {
  selectedAddress: string;
  onAddressChange: (address: string, streetName?: string, streetNumber?: string, postalCode?: string) => void;
}

const AddressSelector = ({ selectedAddress, onAddressChange }: AddressSelectorProps) => {
  const { profile } = useAuth();
  const [showNewAddressDialog, setShowNewAddressDialog] = useState(false);
  const [newStreetName, setNewStreetName] = useState('');
  const [newStreetNumber, setNewStreetNumber] = useState('');
  const [newPostalCode, setNewPostalCode] = useState('');
  const [newAddressLabel, setNewAddressLabel] = useState('');

  // Endereços salvos (em uma implementação real, viriam do banco de dados)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Casa',
      streetName: profile?.street || '',
      streetNumber: profile?.number || '',
      postalCode: profile?.postal_code || '',
      fullAddress: profile ? `${profile.street} ${profile.number}, ${profile.city_state}` : '',
      isDefault: true
    }
  ]);

  const handleAddNewAddress = () => {
    if (newStreetName.trim() && newStreetNumber.trim() && newPostalCode.trim() && newAddressLabel.trim()) {
      const fullAddress = `${newStreetName}, ${newStreetNumber} - CEP: ${newPostalCode}`;
      const newAddr: Address = {
        id: Date.now().toString(),
        label: newAddressLabel,
        streetName: newStreetName,
        streetNumber: newStreetNumber,
        postalCode: newPostalCode,
        fullAddress: fullAddress
      };
      setSavedAddresses([...savedAddresses, newAddr]);
      onAddressChange(fullAddress, newStreetName, newStreetNumber, newPostalCode);
      setNewStreetName('');
      setNewStreetNumber('');
      setNewPostalCode('');
      setNewAddressLabel('');
      setShowNewAddressDialog(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Endereço de Entrega</Label>
      
      <div className="space-y-3">
        {savedAddresses.map((addr) => (
          <Card 
            key={addr.id}
            className={`cursor-pointer transition-colors ${
              selectedAddress === addr.fullAddress ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onAddressChange(addr.fullAddress, addr.streetName, addr.streetNumber, addr.postalCode)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{addr.label}</p>
                    <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                  </div>
                </div>
                {selectedAddress === addr.fullAddress && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showNewAddressDialog} onOpenChange={setShowNewAddressDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Novo Endereço
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Endereço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Nome do Endereço</Label>
              <Input
                id="label"
                value={newAddressLabel}
                onChange={(e) => setNewAddressLabel(e.target.value)}
                placeholder="Ex: Trabalho, Casa da mãe..."
              />
            </div>
            <div>
              <Label htmlFor="streetName">Nome da Rua</Label>
              <Input
                id="streetName"
                value={newStreetName}
                onChange={(e) => setNewStreetName(e.target.value)}
                placeholder="Ex: Rua das Flores"
              />
            </div>
            <div>
              <Label htmlFor="streetNumber">Número</Label>
              <Input
                id="streetNumber"
                value={newStreetNumber}
                onChange={(e) => setNewStreetNumber(e.target.value)}
                placeholder="Ex: 123, 456A"
              />
            </div>
            <div>
              <Label htmlFor="postalCode">CEP</Label>
              <Input
                id="postalCode"
                value={newPostalCode}
                onChange={(e) => setNewPostalCode(e.target.value)}
                placeholder="Ex: 12345-678"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddNewAddress} className="flex-1">
                Salvar Endereço
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewAddressDialog(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressSelector;