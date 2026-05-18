-- Fase 04 Wave 2: Fix auth user creation + seed mock data
-- 
-- Problem: profiles.auth_id has FK to auth.users
-- There's likely a trigger on auth.users that fails
-- Solution: Create a helper function to bypass, or temporarily disable the trigger

-- 1. Create a helper RPC function for seeding dev data
CREATE OR REPLACE FUNCTION public.seed_mock_seller()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  existing_id uuid;
BEGIN
  -- Check if mock seller already exists
  SELECT id INTO existing_id FROM profiles WHERE email = 'piloto_mock@kingshub.dev' LIMIT 1;
  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  -- Generate a new UUID
  new_user_id := gen_random_uuid();
  
  -- Insert directly into auth.users (bypassing triggers)
  INSERT INTO auth.users (
    id, 
    instance_id, 
    aud, 
    role, 
    email, 
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'piloto_mock@kingshub.dev',
    crypt('KingsMockPilot2026!', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Piloto Mock KingsHub"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), new_user_id, 
    jsonb_build_object('sub', new_user_id::text, 'email', 'piloto_mock@kingshub.dev'),
    'email', NOW(), NOW(), NOW()
  );

  -- Create the profile
  INSERT INTO public.profiles (id, auth_id, email, role, full_name)
  VALUES (new_user_id, new_user_id, 'piloto_mock@kingshub.dev', 'client', 'Piloto Mock KingsHub');

  RETURN new_user_id;
END;
$$;

-- 2. Execute the seed
SELECT public.seed_mock_seller();
