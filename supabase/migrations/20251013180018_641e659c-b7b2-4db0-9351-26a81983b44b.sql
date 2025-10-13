-- Adicionar campo order_index para ordenação dos tipos de treino
ALTER TABLE public.workout_types 
ADD COLUMN order_index INTEGER;

-- Inicializar order_index para tipos existentes baseado no created_at
WITH ordered_types AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS initial_order
  FROM public.workout_types
)
UPDATE public.workout_types wt
SET order_index = ot.initial_order
FROM ordered_types ot
WHERE wt.id = ot.id;

-- Tornar o campo NOT NULL após popular os dados
ALTER TABLE public.workout_types 
ALTER COLUMN order_index SET NOT NULL;

-- Definir valor padrão para novos registros
ALTER TABLE public.workout_types 
ALTER COLUMN order_index SET DEFAULT 0;