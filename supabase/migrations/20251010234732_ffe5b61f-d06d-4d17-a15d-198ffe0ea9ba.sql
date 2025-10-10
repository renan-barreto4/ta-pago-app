-- Adicionar Treino I novamente
INSERT INTO public.workout_types (name, icon, color)
VALUES ('Treino I', '💯', 'hsl(330 81% 60%)')
ON CONFLICT DO NOTHING;