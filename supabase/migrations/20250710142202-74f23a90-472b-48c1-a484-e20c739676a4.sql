
-- Criar tabela de restaurantes
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  address TEXT NOT NULL,
  image_url TEXT,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  delivery_time_min INTEGER DEFAULT 30,
  delivery_time_max INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de categorias de produtos
CREATE TABLE public.product_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  preparation_time INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de áreas de entrega
CREATE TABLE public.delivery_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  area_name TEXT NOT NULL,
  postal_codes TEXT[], -- Array de CEPs
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ativar Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_areas ENABLE ROW LEVEL SECURITY;

-- Políticas para restaurantes
CREATE POLICY "Restaurant owners can manage their restaurants" 
  ON public.restaurants 
  FOR ALL 
  USING (auth.uid() = owner_id);

CREATE POLICY "Everyone can view active restaurants" 
  ON public.restaurants 
  FOR SELECT 
  USING (is_active = true);

-- Políticas para categorias de produtos
CREATE POLICY "Restaurant owners can manage their categories" 
  ON public.product_categories 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view categories of active restaurants" 
  ON public.product_categories 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND is_active = true
    )
  );

-- Políticas para produtos
CREATE POLICY "Restaurant owners can manage their products" 
  ON public.products 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view available products of active restaurants" 
  ON public.products 
  FOR SELECT 
  USING (
    is_available = true AND 
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND is_active = true
    )
  );

-- Políticas para áreas de entrega
CREATE POLICY "Restaurant owners can manage their delivery areas" 
  ON public.delivery_areas 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view delivery areas of active restaurants" 
  ON public.delivery_areas 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND is_active = true
    )
  );
