import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Edit3, Trash2, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFitLogContext } from '@/contexts/FitLogContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ExerciseList, Exercise } from '@/components/ExerciseList';

interface WorkoutHistoryProps {
  onEditWorkout: (workout: any) => void;
}

export const WorkoutHistory = ({ onEditWorkout }: WorkoutHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exercisesByWorkout, setExercisesByWorkout] = useState<Record<string, Exercise[]>>({});
  const { workouts, workoutTypes, deleteWorkout, loadWorkoutExercises } = useFitLogContext();
  const { toast } = useToast();

  // Carregar exercícios para cada treino
  useEffect(() => {
    const loadAllExercises = async () => {
      const exercisesMap: Record<string, Exercise[]> = {};
      for (const workout of workouts) {
        const exercises = await loadWorkoutExercises(workout.id);
        if (exercises.length > 0) {
          exercisesMap[workout.id] = exercises;
        }
      }
      setExercisesByWorkout(exercisesMap);
    };

    if (workouts.length > 0) {
      loadAllExercises();
    }
  }, [workouts, loadWorkoutExercises]);

  // Filtrar e ordenar treinos
  const filteredWorkouts = workouts
    .filter(workout => {
      if (!searchTerm) return true;
      
      const type = workout.customType || workoutTypes.find(t => t.id === workout.typeId)?.name || '';
      const notes = workout.notes || '';
      const searchLower = searchTerm.toLowerCase();
      
      return (
        type.toLowerCase().includes(searchLower) ||
        notes.toLowerCase().includes(searchLower) ||
        format(workout.date, 'dd/MM/yyyy').includes(searchTerm)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = async (workoutId: string) => {
    try {
      await deleteWorkout(workoutId);
      toast({
        title: "Treino excluído",
        description: "O registro foi removido com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  const getWorkoutTypeInfo = (workout: any) => {
    if (workout.customType) {
      return {
        name: workout.customType,
        icon: '⚡',
        color: 'hsl(220 9% 46%)'
      };
    }
    
    const type = workoutTypes.find(t => t.id === workout.typeId);
    return {
      name: type?.name || 'Desconhecido',
      icon: type?.icon || '❓',
      color: type?.color || 'hsl(220 9% 46%)'
    };
  };

  return (
    <div className="space-y-4">
      {/* Header com busca */}
      <Card className="p-4 bg-gradient-card shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Histórico de Treinos</h3>
          <span className="text-sm text-muted-foreground">
            {filteredWorkouts.length} treino{filteredWorkouts.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por tipo, data ou observações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Lista de treinos */}
      <div className="space-y-3">
        {filteredWorkouts.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-card shadow-card">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'Nenhum treino encontrado' : 'Nenhum treino registrado'}
            </h4>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Tente buscar por outros termos'
                : 'Comece registrando seu primeiro treino no calendário'
              }
            </p>
          </Card>
        ) : (
          filteredWorkouts.map((workout) => {
            const typeInfo = getWorkoutTypeInfo(workout);
            
            return (
              <Card 
                key={workout.id} 
                className="p-4 bg-gradient-card shadow-card hover:shadow-workout transition-all duration-200 animate-fade-in"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Ícone do tipo */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold shadow-sm"
                      style={{ backgroundColor: typeInfo.color }}
                    >
                      {typeInfo.icon}
                    </div>
                    
                    {/* Informações do treino */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">
                          {typeInfo.name}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {format(workout.date, "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {format(workout.date, "EEEE", { locale: ptBR })}
                      </p>
                      
                      {workout.notes && (
                        <p className="text-sm text-foreground mt-2 p-2 bg-muted/50 rounded-md">
                          {workout.notes}
                        </p>
                      )}

                      {/* Mostrar exercícios */}
                      {exercisesByWorkout[workout.id] && exercisesByWorkout[workout.id].length > 0 && (
                        <div className="mt-3">
                          <ExerciseList 
                            exercises={exercisesByWorkout[workout.id]}
                            onChange={() => {}}
                            readOnly
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditWorkout(workout)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(workout.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};