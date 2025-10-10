-- Remover a política antiga que pode estar causando conflito
DROP POLICY IF EXISTS "Todos podem visualizar tipos de treino" ON public.workout_types;

-- Criar nova política de SELECT mais permissiva
CREATE POLICY "Permitir leitura pública de tipos de treino"
ON public.workout_types
FOR SELECT
TO public
USING (true);