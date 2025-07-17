-- Corrigir a função de geração de número da nota fiscal
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  invoice_number text;
BEGIN
  -- Pegar o próximo número sequencial
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'NF-(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoice_number ~ '^NF-\d+$';
  
  -- Formatar como NF-XXXXXX
  invoice_number := 'NF-' || LPAD(next_number::text, 6, '0');
  
  RETURN invoice_number;
END;
$$;

-- Adicionar campos de endereço detalhado na tabela orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS street_name text,
ADD COLUMN IF NOT EXISTS street_number text,
ADD COLUMN IF NOT EXISTS postal_code text;

-- Adicionar contador de pedidos na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS order_count integer DEFAULT 0;

-- Função para incrementar contador de pedidos
CREATE OR REPLACE FUNCTION public.increment_user_order_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.profiles 
  SET order_count = order_count + 1 
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger para incrementar contador automaticamente
DROP TRIGGER IF EXISTS increment_order_count_trigger ON public.orders;
CREATE TRIGGER increment_order_count_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW 
  EXECUTE FUNCTION public.increment_user_order_count();