-- Inserir tipos de treino padrão do sistema
INSERT INTO public.workout_types (name, icon, color) VALUES
  ('Treino A', '🅰️', 'hsl(var(--primary))'),
  ('Treino B', '🅱️', 'hsl(var(--primary))'),
  ('Treino C', '🔥', 'hsl(var(--primary))'),
  ('Treino D', '💪', 'hsl(var(--primary))'),
  ('Treino E', '⚡', 'hsl(var(--primary))'),
  ('Treino F', '🏋️', 'hsl(var(--primary))'),
  ('Treino G', '🚀', 'hsl(var(--primary))'),
  ('Treino H', '🎯', 'hsl(var(--primary))'),
  ('Treino I', '💯', 'hsl(var(--primary))')
ON CONFLICT DO NOTHING;