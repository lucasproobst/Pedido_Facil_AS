
-- Update the handle_new_user function to work with the new address structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, phone, street, number, complement, postal_code, city_state)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'street',
    NEW.raw_user_meta_data ->> 'number',
    NEW.raw_user_meta_data ->> 'complement',
    NEW.raw_user_meta_data ->> 'postal_code',
    NEW.raw_user_meta_data ->> 'city_state'
  );
  RETURN NEW;
END;
$$;
