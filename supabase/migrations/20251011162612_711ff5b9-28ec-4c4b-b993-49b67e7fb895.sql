-- Adicionar coluna workout_id para vincular exercícios a treinos específicos
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE;

-- Tornar workout_type_id nullable para permitir exercícios vinculados a treinos específicos
ALTER TABLE public.workout_exercises 
ALTER COLUMN workout_type_id DROP NOT NULL;