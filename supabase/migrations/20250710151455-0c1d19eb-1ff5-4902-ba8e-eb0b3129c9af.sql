
-- Drop the existing insert policy that's too restrictive
DROP POLICY IF EXISTS "Restaurant owners can insert own data" ON public.restaurant_owners;

-- Create a new policy that allows inserts for new users during signup
CREATE POLICY "Allow restaurant owner profile creation" 
  ON public.restaurant_owners 
  FOR INSERT 
  WITH CHECK (true);

-- Also ensure we have proper select and update policies
DROP POLICY IF EXISTS "Restaurant owners can view own data" ON public.restaurant_owners;
DROP POLICY IF EXISTS "Restaurant owners can update own data" ON public.restaurant_owners;

CREATE POLICY "Restaurant owners can view own data" 
  ON public.restaurant_owners 
  FOR SELECT 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Restaurant owners can update own data" 
  ON public.restaurant_owners 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);
