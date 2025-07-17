
-- Adicionar coluna de cidade/estado aos restaurantes
ALTER TABLE public.restaurants 
ADD COLUMN city_state TEXT;

-- Atualizar tabela de perfis para incluir endereço completo
ALTER TABLE public.profiles 
DROP COLUMN address;

ALTER TABLE public.profiles 
ADD COLUMN street TEXT,
ADD COLUMN number TEXT,
ADD COLUMN complement TEXT,
ADD COLUMN postal_code TEXT,
ADD COLUMN city_state TEXT;

-- Criar índice para melhorar performance das consultas por cidade
CREATE INDEX idx_restaurants_city_state ON public.restaurants(city_state);
CREATE INDEX idx_profiles_city_state ON public.profiles(city_state);
