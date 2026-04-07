-- Corrige o problema do trigger de registro que causava "Database error creating new user"
-- O problema ocorria porque o trigger executa no schema `auth`, e precisava explicitamente
-- setar o search_path para `public` e referenciar `public.profiles`.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
