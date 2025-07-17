-- Adicionar política para permitir que usuários criem notas fiscais para seus próprios pedidos
CREATE POLICY "Users can create invoices for their orders" 
ON public.invoices 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = invoices.order_id 
  AND orders.user_id = auth.uid()
));

-- Adicionar política para permitir que donos de restaurantes criem notas fiscais
CREATE POLICY "Restaurant owners can create invoices for their orders" 
ON public.invoices 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  JOIN public.restaurants ON restaurants.id = orders.restaurant_id
  WHERE orders.id = invoices.order_id 
  AND restaurants.owner_id = auth.uid()
));