-- Adicionar políticas de UPDATE e DELETE para workout_types
-- Permitir que todos possam atualizar tipos de treino (sem autenticação necessária)
CREATE POLICY "Todos podem atualizar tipos de treino"
ON public.workout_types
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir que todos possam deletar tipos de treino (sem autenticação necessária)
CREATE POLICY "Todos podem deletar tipos de treino"
ON public.workout_types
FOR DELETE
TO anon, authenticated
USING (true);

-- Permitir que todos possam inserir novos tipos de treino (sem autenticação necessária)  
CREATE POLICY "Todos podem inserir tipos de treino"
ON public.workout_types
FOR INSERT
TO anon, authenticated
WITH CHECK (true);