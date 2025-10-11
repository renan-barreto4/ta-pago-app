-- Criar tabela de exercícios dos treinos
CREATE TABLE public.workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL,
  weight NUMERIC,
  notes TEXT,
  exercise_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários podem ver exercícios dos seus próprios treinos
CREATE POLICY "Usuários podem visualizar exercícios dos seus treinos"
  ON public.workout_exercises
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Usuários podem inserir exercícios nos seus treinos
CREATE POLICY "Usuários podem inserir exercícios nos seus treinos"
  ON public.workout_exercises
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar exercícios dos seus treinos
CREATE POLICY "Usuários podem atualizar exercícios dos seus treinos"
  ON public.workout_exercises
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Usuários podem deletar exercícios dos seus treinos
CREATE POLICY "Usuários podem deletar exercícios dos seus treinos"
  ON public.workout_exercises
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts
      WHERE workouts.id = workout_exercises.workout_id
      AND workouts.user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_workout_exercises_updated_at
  BEFORE UPDATE ON public.workout_exercises
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhor performance
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_order ON public.workout_exercises(workout_id, exercise_order);