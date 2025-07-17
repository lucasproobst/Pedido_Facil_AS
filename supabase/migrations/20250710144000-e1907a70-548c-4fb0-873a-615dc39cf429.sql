
-- Criar tabela separada para donos de restaurantes
CREATE TABLE public.restaurant_owners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de donos de restaurantes
ALTER TABLE public.restaurant_owners ENABLE ROW LEVEL SECURITY;

-- Política para que donos possam ver apenas seus próprios dados
CREATE POLICY "Restaurant owners can view own data" 
  ON public.restaurant_owners 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

-- Política para que donos possam atualizar seus próprios dados
CREATE POLICY "Restaurant owners can update own data" 
  ON public.restaurant_owners 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- Política para inserção de novos donos
CREATE POLICY "Restaurant owners can insert own data" 
  ON public.restaurant_owners 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = id::text);

-- Atualizar a tabela de restaurantes para referenciar restaurant_owners
-- Primeiro, adicionar nova coluna
ALTER TABLE public.restaurants ADD COLUMN restaurant_owner_id UUID REFERENCES public.restaurant_owners(id);

-- Atualizar política existente para usar a nova referência
DROP POLICY IF EXISTS "Restaurant owners can manage their restaurants" ON public.restaurants;

CREATE POLICY "Restaurant owners can manage their restaurants" 
  ON public.restaurants 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurant_owners 
      WHERE restaurant_owners.id = restaurants.restaurant_owner_id 
      AND auth.uid()::text = restaurant_owners.id::text
    )
  );

-- Função para criar perfil de dono de restaurante automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_restaurant_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.restaurant_owners (id, name, email, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil de dono quando um novo usuário se registra como dono
-- (será ativado apenas para registros específicos de donos)
