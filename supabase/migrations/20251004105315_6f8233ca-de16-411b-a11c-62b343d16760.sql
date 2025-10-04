-- Criar tabelas baseadas no schema do Prisma

-- Tabela de tipos de treino
CREATE TABLE IF NOT EXISTS public.workout_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'hsl(var(--primary))',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de treinos
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type_id UUID NOT NULL REFERENCES public.workout_types(id) ON DELETE RESTRICT,
  custom_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Tabela de registros de peso
CREATE TABLE IF NOT EXISTS public.weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_weight_entries_updated_at
  BEFORE UPDATE ON public.weight_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.workout_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_entries ENABLE ROW LEVEL SECURITY;

-- Policies para workout_types (todos podem ver, apenas autenticados podem modificar se necessário)
CREATE POLICY "Todos podem visualizar tipos de treino"
  ON public.workout_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies para workouts (usuários só veem seus próprios treinos)
CREATE POLICY "Usuários podem visualizar seus próprios treinos"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios treinos"
  ON public.workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios treinos"
  ON public.workouts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios treinos"
  ON public.workouts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies para weight_entries (usuários só veem seus próprios registros)
CREATE POLICY "Usuários podem visualizar seus próprios registros de peso"
  ON public.weight_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios registros de peso"
  ON public.weight_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de peso"
  ON public.weight_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de peso"
  ON public.weight_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Seed dos tipos de treino padrão
INSERT INTO public.workout_types (name, icon, color) VALUES
  ('Treino A', '🅰️', 'hsl(142 76% 36%)'),
  ('Treino B', '🅱️', 'hsl(217 91% 60%)'),
  ('Treino C', '🔥', 'hsl(195 92% 50%)'),
  ('Treino D', '💪', 'hsl(25 95% 53%)'),
  ('Treino E', '⚡', 'hsl(120 76% 36%)'),
  ('Treino F', '🏋️', 'hsl(0 84% 60%)'),
  ('Treino G', '🚀', 'hsl(300 76% 46%)'),
  ('Treino H', '🎯', 'hsl(45 93% 47%)'),
  ('Treino I', '💯', 'hsl(330 81% 60%)')
ON CONFLICT (name) DO NOTHING;