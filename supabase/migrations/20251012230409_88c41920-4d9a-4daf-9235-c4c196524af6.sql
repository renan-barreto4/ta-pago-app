
-- Remover constraint única de nome se existir
ALTER TABLE public.workout_types DROP CONSTRAINT IF EXISTS workout_types_name_key;

-- Inserir tipos de treino padrão para usuários existentes que não os têm
INSERT INTO public.workout_types (user_id, name, icon, color)
SELECT 
  u.id,
  workout_data.name,
  workout_data.icon,
  'hsl(var(--primary))'
FROM auth.users u
CROSS JOIN (
  VALUES
    ('Treino A', '🅰️'),
    ('Treino B', '🅱️'),
    ('Treino C', '🔥'),
    ('Treino D', '💪'),
    ('Treino E', '⚡'),
    ('Treino F', '🏋️'),
    ('Treino G', '🚀'),
    ('Treino H', '🎯'),
    ('Treino I', '💯')
) AS workout_data(name, icon)
WHERE NOT EXISTS (
  SELECT 1 
  FROM public.workout_types wt 
  WHERE wt.user_id = u.id 
  AND wt.name = workout_data.name
);
