import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFitLog } from '@/hooks/useFitLog';
import { cn } from '@/lib/utils';

interface WorkoutCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const WorkoutCalendar = ({ onDateSelect, selectedDate }: WorkoutCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const { getWorkoutByDate, workoutTypes } = useFitLog();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getDayStatus = (date: Date) => {
    const workout = getWorkoutByDate(date);
    const today = isClient ? isToday(date) : false;
    const isPast = isClient ? isBefore(date, startOfDay(new Date())) && !today : false;
    
    if (workout) {
      const type = workoutTypes.find(t => t.id === workout.typeId);
      return {
        hasWorkout: true,
        icon: type?.icon || '⚡',
        color: 'workout-completed',
        label: workout.customType || type?.name || 'Treino'
      };
    }
    
    if (today) {
      return {
        hasWorkout: false,
        icon: '',
        color: 'workout-today',
        label: 'Hoje'
      };
    }
    
    if (isPast) {
      return {
        hasWorkout: false,
        icon: '',
        color: 'workout-missed',
        label: 'Perdido'
      };
    }
    
    return {
      hasWorkout: false,
      icon: '',
      color: 'default',
      label: 'Disponível'
    };
  };

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      {/* Header do calendário */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const dayStatus = getDayStatus(day);
          const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={cn(
                "relative h-12 w-full rounded-lg text-sm font-medium transition-all duration-200",
                "hover:scale-105 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
                {
                  // Estado base
                  "text-muted-foreground": !isCurrentMonth,
                  "text-foreground": isCurrentMonth,
                  
                  // Status do dia
                  "bg-workout-completed text-white shadow-workout": dayStatus.color === 'workout-completed' && !isToday(day),
                  "bg-workout-completed text-white shadow-workout border-2 border-blue-500": dayStatus.color === 'workout-completed' && isClient && isToday(day),
                  "border-2 border-blue-500 bg-background text-foreground": dayStatus.color === 'workout-today',
                  "bg-destructive text-white": dayStatus.color === 'workout-missed',
                  "bg-background hover:bg-accent": dayStatus.color === 'default',
                  
                  // Selecionado
                  "ring-2 ring-primary ring-offset-2": isSelected,
                  
                  // Hover states
                  "hover:bg-accent hover:text-accent-foreground": !dayStatus.hasWorkout && dayStatus.color !== 'workout-today',
                }
              )}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs leading-none">
                  {format(day, 'd')}
                </span>
                {dayStatus.hasWorkout && (
                  <span className="text-xs leading-none mt-0.5">
                    {dayStatus.icon}
                  </span>
                )}
              </div>
              
              {/* Indicador de hoje */}
              {isClient && isToday(day) && !dayStatus.hasWorkout && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-workout-completed" />
          <span className="text-muted-foreground">Treinou</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Perdeu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">Hoje</span>
        </div>
      </div>
    </Card>
  );
};