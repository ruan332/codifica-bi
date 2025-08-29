-- Script para sincronizar IDs entre auth.users e public.users
-- Execute este script no Supabase Dashboard > SQL Editor

-- 1. Verificar usuários existentes
SELECT 'auth.users' as tabela, id, email FROM auth.users
UNION ALL
SELECT 'public.users' as tabela, id, email FROM public.users
ORDER BY email, tabela;

-- 2. Atualizar IDs na tabela public.users para corresponder aos auth.users
-- Para admin@demo.com
UPDATE public.users 
SET id = (
  SELECT id FROM auth.users WHERE email = 'admin@demo.com' LIMIT 1
)
WHERE email = 'admin@demo.com' 
AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@demo.com');

-- Para cliente@demo.com
UPDATE public.users 
SET id = (
  SELECT id FROM auth.users WHERE email = 'cliente@demo.com' LIMIT 1
)
WHERE email = 'cliente@demo.com'
AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'cliente@demo.com');

-- Para admin@codifica.com
UPDATE public.users 
SET id = (
  SELECT id FROM auth.users WHERE email = 'admin@codifica.com' LIMIT 1
)
WHERE email = 'admin@codifica.com'
AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@codifica.com');

-- 3. Verificar se a sincronização funcionou
SELECT 
  au.id as auth_id,
  au.email as auth_email,
  pu.id as public_id,
  pu.email as public_email,
  pu.role,
  CASE WHEN au.id = pu.id THEN 'SINCRONIZADO' ELSE 'DESSINCRONIZADO' END as status
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.email = pu.email
ORDER BY au.email;

-- 4. Atualizar políticas RLS para serem mais permissivas
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (
    -- Permitir se o usuário é admin (verificando metadados)
    (auth.jwt() -> 'raw_user_meta_data' ->> 'role' = 'admin') OR
    -- Ou se existe na tabela users como admin
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    ) OR
    -- Ou se o email corresponde a um admin conhecido
    (auth.jwt() ->> 'email' IN ('admin@demo.com', 'admin@codifica.com'))
  );

-- 5. Política para usuários verem seus próprios dados
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR
    auth.jwt() ->> 'email' = email
  );

-- 6. Manter política de conectividade anônima
DROP POLICY IF EXISTS "Allow anonymous connectivity check" ON public.users;
CREATE POLICY "Allow anonymous connectivity check" ON public.users
  FOR SELECT
  USING (true);