-- 1. Adicionar coluna user_id na tabela workout_types
ALTER TABLE public.workout_types
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Atualizar tipos existentes para o primeiro usuário (ou null se não houver usuários)
-- Isso é temporário, tipos sem user_id serão tratados como "órfãos"
UPDATE public.workout_types
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- 3. Tornar user_id obrigatório
ALTER TABLE public.workout_types
ALTER COLUMN user_id SET NOT NULL;

-- 4. Remover políticas RLS antigas de workout_types
DROP POLICY IF EXISTS "Permitir leitura pública de tipos de treino" ON public.workout_types;
DROP POLICY IF EXISTS "Todos podem atualizar tipos de treino" ON public.workout_types;
DROP POLICY IF EXISTS "Todos podem deletar tipos de treino" ON public.workout_types;
DROP POLICY IF EXISTS "Todos podem inserir tipos de treino" ON public.workout_types;

-- 5. Criar novas políticas RLS para workout_types (individuais por usuário)
CREATE POLICY "Usuários podem visualizar seus próprios tipos de treino"
ON public.workout_types
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios tipos de treino"
ON public.workout_types
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios tipos de treino"
ON public.workout_types
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios tipos de treino"
ON public.workout_types
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Remover políticas RLS antigas de workout_exercises
DROP POLICY IF EXISTS "Usuários podem visualizar exercícios dos seus treinos" ON public.workout_exercises;
DROP POLICY IF EXISTS "Usuários podem inserir exercícios nos seus treinos" ON public.workout_exercises;
DROP POLICY IF EXISTS "Usuários podem atualizar exercícios dos seus treinos" ON public.workout_exercises;
DROP POLICY IF EXISTS "Usuários podem deletar exercícios dos seus treinos" ON public.workout_exercises;

-- 7. Criar novas políticas RLS para workout_exercises (através de workout_types)
CREATE POLICY "Usuários podem visualizar exercícios dos seus tipos de treino"
ON public.workout_exercises
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workout_types
    WHERE workout_types.id = workout_exercises.workout_type_id
    AND workout_types.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem inserir exercícios nos seus tipos de treino"
ON public.workout_exercises
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_types
    WHERE workout_types.id = workout_exercises.workout_type_id
    AND workout_types.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar exercícios dos seus tipos de treino"
ON public.workout_exercises
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.workout_types
    WHERE workout_types.id = workout_exercises.workout_type_id
    AND workout_types.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workout_types
    WHERE workout_types.id = workout_exercises.workout_type_id
    AND workout_types.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar exercícios dos seus tipos de treino"
ON public.workout_exercises
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.workout_types
    WHERE workout_types.id = workout_exercises.workout_type_id
    AND workout_types.user_id = auth.uid()
  )
);

-- 8. Criar função para inicializar tipos de treino padrão para novos usuários
CREATE OR REPLACE FUNCTION public.initialize_default_workout_types()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.workout_types (user_id, name, icon, color)
  VALUES
    (NEW.id, 'Treino A', '🅰️', 'hsl(var(--primary))'),
    (NEW.id, 'Treino B', '🅱️', 'hsl(var(--primary))'),
    (NEW.id, 'Treino C', '🔥', 'hsl(var(--primary))'),
    (NEW.id, 'Treino D', '💪', 'hsl(var(--primary))'),
    (NEW.id, 'Treino E', '⚡', 'hsl(var(--primary))'),
    (NEW.id, 'Treino F', '🏋️', 'hsl(var(--primary))'),
    (NEW.id, 'Treino G', '🚀', 'hsl(var(--primary))'),
    (NEW.id, 'Treino H', '🎯', 'hsl(var(--primary))'),
    (NEW.id, 'Treino I', '💯', 'hsl(var(--primary))');
  RETURN NEW;
END;
$$;

-- 9. Criar trigger para inicializar tipos de treino ao criar novo usuário
DROP TRIGGER IF EXISTS on_auth_user_created_workout_types ON auth.users;
CREATE TRIGGER on_auth_user_created_workout_types
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_default_workout_types();