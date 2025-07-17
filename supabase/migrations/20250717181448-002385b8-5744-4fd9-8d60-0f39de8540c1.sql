-- Corrigir a função de geração de número da nota fiscal para resolver ambiguidade
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_number integer;
  invoice_number text;
BEGIN
  -- Pegar o próximo número sequencial especificando a tabela
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoices.invoice_number FROM 'NF-(\d+)') AS integer)), 0) + 1
  INTO next_number
  FROM public.invoices
  WHERE invoices.invoice_number ~ '^NF-\d+$';
  
  -- Formatar como NF-XXXXXX
  invoice_number := 'NF-' || LPAD(next_number::text, 6, '0');
  
  RETURN invoice_number;
END;
$$;