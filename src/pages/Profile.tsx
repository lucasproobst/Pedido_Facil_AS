
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Save,
  Camera
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    street: profile?.street || '',
    number: profile?.number || '',
    complement: profile?.complement || '',
    postal_code: profile?.postal_code || '',
    city_state: profile?.city_state || ''
  });

  const cities = [
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

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        street: profile.street || '',
        number: profile.number || '',
        complement: profile.complement || '',
        postal_code: profile.postal_code || '',
        city_state: profile.city_state || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          postal_code: formData.postal_code,
          city_state: formData.city_state,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Erro ao atualizar perfil');
      } else {
        toast.success('Perfil atualizado com sucesso!');
        setIsEditing(false);
        // Recarregar a página para atualizar os dados do contexto
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      city_state: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-lg">{profile?.name || 'Usuário'}</h3>
              <p className="text-gray-600 text-sm">{user?.email}</p>
              <div className="mt-3 p-2 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => navigate('/dashboard')}>
                <p className="text-sm font-medium text-primary">
                  📦 {profile?.order_count || 0} pedidos realizados
                </p>
                <p className="text-xs text-primary/80 mt-1">
                  👆 Clique para ir ao Dashboard
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">ID: {user?.id}</p>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    'Salvando...'
                  ) : isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        name="email"
                        value={user?.email || ''}
                        disabled={true}
                        className="pl-10 bg-gray-100"
                      />
                    </div>
                    <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postal_code">CEP</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      name="complement"
                      value={formData.complement}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Apartamento, bloco, etc. (opcional)"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="city_state">Cidade</Label>
                    {isEditing ? (
                      <Select value={formData.city_state} onValueChange={handleCityChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione sua cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={formData.city_state}
                          disabled={true}
                          className="pl-10 bg-gray-100"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-4 pt-4">
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Notificações de entrega</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>SMS de acompanhamento</span>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <span>Ofertas por email</span>
                  <input type="checkbox" className="rounded" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info('Funcionalidade de alteração de senha será implementada em breve')}
              >
                Alterar Senha
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => toast.info('Verificação em duas etapas será implementada em breve')}
              >
                Verificação em Duas Etapas
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => toast.error('Para excluir sua conta, entre em contato com o suporte')}
              >
                Excluir Conta
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
