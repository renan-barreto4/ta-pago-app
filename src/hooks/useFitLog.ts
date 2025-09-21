import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, isSameDay } from 'date-fns';

export interface WorkoutType {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Workout {
  id: string;
  date: Date;
  typeId: string;
  customType?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutStats {
  totalWorkouts: number;
  workoutDays: number;
  restDays: number;
  lostDays: number;
  mostFrequentType: string;
  streak: number;
  percentage: number;
}

// Tipos de treino predefinidos
const DEFAULT_WORKOUT_TYPES: WorkoutType[] = [
  { id: '1', name: 'Musculação', icon: '💪', color: 'hsl(142 76% 36%)' },
  { id: '2', name: 'Cardio', icon: '🏃', color: 'hsl(217 91% 60%)' },
  { id: '3', name: 'Yoga', icon: '🧘', color: 'hsl(266 76% 46%)' },
  { id: '4', name: 'Natação', icon: '🏊', color: 'hsl(195 92% 50%)' },
  { id: '5', name: 'Corrida', icon: '🏃‍♂️', color: 'hsl(25 95% 53%)' },
  { id: '6', name: 'Ciclismo', icon: '🚴', color: 'hsl(120 76% 36%)' },
  { id: '7', name: 'Funcional', icon: '🏋️', color: 'hsl(0 84% 60%)' },
  { id: '8', name: 'Pilates', icon: '🤸', color: 'hsl(300 76% 46%)' },
  { id: 'custom', name: 'Outro', icon: '⚡', color: 'hsl(220 9% 46%)' },
];

// Mock de dados iniciais para demonstração (usando datas do mês atual)
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();

const MOCK_WORKOUTS: Workout[] = [
  {
    id: '1',
    date: new Date(currentYear, currentMonth, 20), // Dia 20 do mês atual
    typeId: '1',
    notes: 'Treino de peito e tríceps',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    date: new Date(currentYear, currentMonth, 18), // Dia 18 do mês atual
    typeId: '2',
    notes: '30 minutos na esteira',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    date: new Date(currentYear, currentMonth, 15), // Dia 15 do mês atual
    typeId: '3',
    notes: 'Aula de yoga matinal',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    date: new Date(currentYear, currentMonth, 12), // Dia 12 do mês atual
    typeId: '1',
    notes: 'Treino de costas e bíceps',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    date: new Date(currentYear, currentMonth, 10), // Dia 10 do mês atual
    typeId: 'custom',
    customType: 'Dança',
    notes: 'Aula de salsa',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useFitLog = () => {
  const [workouts, setWorkouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>(DEFAULT_WORKOUT_TYPES);
  const [isLoading, setIsLoading] = useState(false);

  // Simular carregamento de dados (mock)
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Salvar treino
  const saveWorkout = useCallback(async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar se já existe treino na mesma data
      const existingWorkout = workouts.find(w => isSameDay(w.date, workoutData.date));
      
      if (existingWorkout) {
        // Atualizar treino existente
        setWorkouts(prev => prev.map(workout => 
          workout.id === existingWorkout.id 
            ? { ...workout, ...workoutData, updatedAt: new Date() }
            : workout
        ));
        setIsLoading(false);
        return existingWorkout;
      } else {
        // Criar novo treino
        const newWorkout: Workout = {
          ...workoutData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setWorkouts(prev => [...prev, newWorkout]);
        setIsLoading(false);
        return newWorkout;
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [workouts]);

  // Atualizar treino
  const updateWorkout = useCallback(async (id: string, workoutData: Partial<Omit<Workout, 'id' | 'createdAt'>>) => {
    setIsLoading(true);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setWorkouts(prev => prev.map(workout => 
      workout.id === id 
        ? { ...workout, ...workoutData, updatedAt: new Date() }
        : workout
    ));
    setIsLoading(false);
  }, []);

  // Deletar treino
  const deleteWorkout = useCallback(async (id: string) => {
    setIsLoading(true);
    
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setWorkouts(prev => prev.filter(workout => workout.id !== id));
    setIsLoading(false);
  }, []);

  // Obter treino por data
  const getWorkoutByDate = useCallback((date: Date) => {
    return workouts.find(workout => isSameDay(workout.date, date));
  }, [workouts]);

  // Obter treinos por período
  const getWorkoutsByPeriod = useCallback((start: Date, end: Date) => {
    return workouts.filter(workout => 
      isWithinInterval(workout.date, { start, end })
    );
  }, [workouts]);

  // Calcular estatísticas
  const getStats = useCallback((period: 'week' | 'month' | 'year', date: Date = new Date()) => {
    let start: Date, end: Date;
    
    switch (period) {
      case 'week':
        start = startOfWeek(date, { weekStartsOn: 1 }); // Segunda-feira
        end = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      case 'year':
        start = startOfYear(date);
        end = endOfYear(date);
        break;
    }

    const periodWorkouts = getWorkoutsByPeriod(start, end);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const workoutDays = new Set(periodWorkouts.map(w => format(w.date, 'yyyy-MM-dd'))).size;
    
    // Tipo mais frequente
    const typeCount = periodWorkouts.reduce((acc, workout) => {
      const type = workout.customType || workoutTypes.find(t => t.id === workout.typeId)?.name || 'Desconhecido';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum';
    
    // Calcular streak (sequência de dias consecutivos)
    const streak = calculateStreak(workouts, date);

    const stats: WorkoutStats = {
      totalWorkouts: periodWorkouts.length,
      workoutDays,
      restDays: totalDays - workoutDays,
      lostDays: totalDays - workoutDays, // Dias perdidos (mesma lógica que restDays)
      mostFrequentType,
      streak,
      percentage: totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0,
    };

    return stats;
  }, [workouts, workoutTypes, getWorkoutsByPeriod]);

  // Calcular sequência de dias consecutivos
  const calculateStreak = useCallback((allWorkouts: Workout[], fromDate: Date = new Date()) => {
    const sortedDates = allWorkouts
      .map(w => format(w.date, 'yyyy-MM-dd'))
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date(fromDate);
    
    for (let i = 0; i < 365; i++) { // Máximo de 1 ano
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (sortedDates.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  // Obter distribuição por tipo
  const getTypeDistribution = useCallback((period: 'week' | 'month' | 'year', date: Date = new Date()) => {
    let start: Date, end: Date;
    
    switch (period) {
      case 'week':
        start = startOfWeek(date, { weekStartsOn: 1 });
        end = endOfWeek(date, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(date);
        end = endOfMonth(date);
        break;
      case 'year':
        start = startOfYear(date);
        end = endOfYear(date);
        break;
    }

    const periodWorkouts = getWorkoutsByPeriod(start, end);
    
    const distribution = periodWorkouts.reduce((acc, workout) => {
      const type = workout.customType || workoutTypes.find(t => t.id === workout.typeId)?.name || 'Outro';
      const typeData = workoutTypes.find(t => t.name === type) || workoutTypes.find(t => t.id === 'custom')!;
      
      if (!acc[type]) {
        acc[type] = {
          count: 0,
          color: typeData.color,
          icon: typeData.icon,
        };
      }
      acc[type].count++;
      return acc;
    }, {} as Record<string, { count: number; color: string; icon: string }>);

    return Object.entries(distribution).map(([name, data]) => ({
      name,
      value: data.count,
      color: data.color,
      icon: data.icon,
    }));
  }, [workouts, workoutTypes, getWorkoutsByPeriod]);

  return {
    // Estado
    workouts,
    workoutTypes,
    isLoading,
    
    // Ações CRUD
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    
    // Consultas
    getWorkoutByDate,
    getWorkoutsByPeriod,
    getStats,
    getTypeDistribution,
    
    // Utilitários
    calculateStreak,
  };
};