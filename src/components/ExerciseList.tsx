import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  notes?: string;
  order: number;
}

interface ExerciseListProps {
  exercises: Exercise[];
  onChange: (exercises: Exercise[]) => void;
  readOnly?: boolean;
}

export const ExerciseList = ({ exercises, onChange, readOnly = false }: ExerciseListProps) => {
  const addExercise = () => {
    const newExercise: Exercise = {
      name: '',
      sets: 3,
      reps: '',
      weight: undefined,
      notes: '',
      order: exercises.length
    };
    onChange([...exercises, newExercise]);
  };

  const removeExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index)
      .map((ex, i) => ({ ...ex, order: i }));
    onChange(updated);
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = exercises.map((ex, i) => 
      i === index ? { ...ex, [field]: value } : ex
    );
    onChange(updated);
  };

  if (readOnly && exercises.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-foreground">
          Exercícios {exercises.length > 0 && `(${exercises.length})`}
        </Label>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addExercise}
            className="h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {exercises.length === 0 && !readOnly && (
          <Card className="p-4 text-center border-dashed">
            <p className="text-sm text-muted-foreground">
              Nenhum exercício adicionado ainda
            </p>
          </Card>
        )}

        {exercises.map((exercise, index) => (
          <Card key={index} className="p-3 bg-muted/50">
            <div className="space-y-2">
              {/* Nome do exercício */}
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <Input
                  value={exercise.name}
                  onChange={(e) => updateExercise(index, 'name', e.target.value)}
                  placeholder="Nome do exercício"
                  className="flex-1"
                  readOnly={readOnly}
                  disabled={readOnly}
                />
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Séries, Reps, Peso */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Séries</Label>
                  <Input
                    type="number"
                    min="1"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                    className="h-9"
                    readOnly={readOnly}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Reps</Label>
                  <Input
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                    placeholder="8-12"
                    className="h-9"
                    readOnly={readOnly}
                    disabled={readOnly}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={exercise.weight || ''}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Opcional"
                    className="h-9"
                    readOnly={readOnly}
                    disabled={readOnly}
                  />
                </div>
              </div>

              {/* Observações */}
              {(!readOnly || exercise.notes) && (
                <div>
                  <Input
                    value={exercise.notes || ''}
                    onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                    placeholder="Observações (opcional)"
                    className="h-9 text-xs"
                    readOnly={readOnly}
                    disabled={readOnly}
                  />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
