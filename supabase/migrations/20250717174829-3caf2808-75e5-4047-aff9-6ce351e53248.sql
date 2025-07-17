-- Criar tabela de favoritos
CREATE TABLE public.product_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Ativar RLS para favoritos
ALTER TABLE public.product_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos
CREATE POLICY "Users can view their own favorites" 
ON public.product_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" 
ON public.product_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites" 
ON public.product_favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Melhorar tabela de delivery_areas com coordenadas
ALTER TABLE public.delivery_areas 
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric,
ADD COLUMN radius_km numeric DEFAULT 5;

-- Criar tabela de notas fiscais
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  total_amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  pdf_url text
);

-- Ativar RLS para notas fiscais
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Políticas para notas fiscais
CREATE POLICY "Users can view invoices for their orders" 
ON public.invoices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = invoices.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Restaurant owners can view invoices for their orders" 
ON public.invoices 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  JOIN public.restaurants ON restaurants.id = orders.restaurant_id
  WHERE orders.id = invoices.order_id 
  AND restaurants.owner_id = auth.uid()
));

-- Função para gerar número da nota fiscal
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  invoice_number text;
BEGIN
  -- Pegar o próximo número sequencial
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+') AS integer)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number ~ '^\d+$';
  
  -- Formatar como NF-XXXXXX
  invoice_number := 'NF-' || LPAD(next_number::text, 6, '0');
  
  RETURN invoice_number;
END;
$$;