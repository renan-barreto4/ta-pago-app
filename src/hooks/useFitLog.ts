import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, isSameDay } from 'date-fns';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // Pode ser "10-12" ou "15" ou "máximo"
}

export interface WorkoutType {
  id: string;
  name: string;
  icon: string;
  color: string;
  exercises?: Exercise[];
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
  { id: '1', name: 'Treino A', icon: '🅰️', color: 'hsl(142 76% 36%)' },
  { id: '2', name: 'Treino B', icon: '🅱️', color: 'hsl(217 91% 60%)' },
  { id: '4', name: 'Treino C', icon: '🔥', color: 'hsl(195 92% 50%)' },
  { id: '5', name: 'Treino D', icon: '💪', color: 'hsl(25 95% 53%)' },
  { id: '6', name: 'Treino E', icon: '⚡', color: 'hsl(120 76% 36%)' },
  { id: '7', name: 'Treino F', icon: '🏋️', color: 'hsl(0 84% 60%)' },
  { id: '8', name: 'Treino G', icon: '🚀', color: 'hsl(300 76% 46%)' },
  { id: '9', name: 'Treino H', icon: '🎯', color: 'hsl(45 93% 47%)' },
  { id: '10', name: 'Treino I', icon: '💯', color: 'hsl(330 81% 60%)' },
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
    date: new Date(currentYear, currentMonth, 17), // Dia 17 do mês atual
    typeId: '4',
    notes: 'Natação',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    date: new Date(currentYear, currentMonth, 19), // Dia 19 do mês atual
    typeId: '7',
    notes: 'Treino funcional',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    date: new Date(currentYear, currentMonth, 15), // Dia 15 do mês atual
    typeId: '3',
    notes: 'Aula de yoga matinal',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    date: new Date(currentYear, currentMonth, 12), // Dia 12 do mês atual
    typeId: '1',
    notes: 'Treino de costas e bíceps',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    date: new Date(currentYear, currentMonth, 11), // Dia 11 do mês atual
    typeId: '5',
    notes: 'Corrida no parque',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
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
    const today = new Date();
    const endDate = end > today ? today : end; // Não contar dias futuros
    const totalDays = Math.ceil((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const workoutDays = new Set(periodWorkouts.map(w => format(w.date, 'yyyy-MM-dd'))).size;
    
    // Tipo mais frequente
    const typeCount = periodWorkouts.reduce((acc, workout) => {
      const type = workout.customType || workoutTypes.find(t => t.id === workout.typeId)?.name || 'Desconhecido';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum';
    
    // Calcular sequência máxima de treinos consecutivos no período
    const streak = calculateMaxStreakInPeriod(periodWorkouts);

    // Calcular dias perdidos (apenas dias passados sem treino)
    const lostDays = Math.max(0, totalDays - workoutDays);

    const stats: WorkoutStats = {
      totalWorkouts: periodWorkouts.length,
      workoutDays,
      restDays: totalDays - workoutDays,
      lostDays,
      mostFrequentType,
      streak,
      percentage: totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0,
    };

    return stats;
  }, [workouts, workoutTypes, getWorkoutsByPeriod]);

  // Calcular sequência máxima de treinos consecutivos no período
  const calculateMaxStreakInPeriod = useCallback((periodWorkouts: Workout[]) => {
    if (periodWorkouts.length === 0) return 0;

    const sortedWorkouts = periodWorkouts.sort((a, b) => a.date.getTime() - b.date.getTime());
    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedWorkouts.length; i++) {
      const currentDate = sortedWorkouts[i].date;
      const previousDate = sortedWorkouts[i - 1].date;
      
      const daysDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        currentStreak++;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 1;
      }
    }
    
    return Math.max(maxStreak, currentStreak);
  }, []);

  // Calcular sequência de dias consecutivos (mantida para compatibilidade)
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
      let typeData = workoutTypes.find(t => t.name === type);
      
      // Fallback para casos onde o tipo não é encontrado (tipos removidos)
      if (!typeData) {
        typeData = {
          id: 'fallback',
          name: type,
          icon: '⚡',
          color: 'hsl(220 9% 46%)'
        };
      }
      
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

  // Obter distribuição por dia da semana
  const getWeekdayDistribution = useCallback((period: 'week' | 'month' | 'year', date: Date = new Date()) => {
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
    
    const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const distribution = weekdays.map(name => ({ name, value: 0, color: 'hsl(var(--primary))', icon: '📅' }));
    
    periodWorkouts.forEach(workout => {
      const dayOfWeek = workout.date.getDay();
      const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Ajustar para começar na segunda
      distribution[index].value++;
    });

    return distribution;
  }, [getWorkoutsByPeriod]);

  // Obter distribuição por mês (apenas para período anual)
  const getMonthDistribution = useCallback((date: Date = new Date()) => {
    const start = startOfYear(date);
    const end = endOfYear(date);
    const periodWorkouts = getWorkoutsByPeriod(start, end);
    
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const distribution = months.map(name => ({ name, value: 0, color: 'hsl(var(--primary))', icon: '📅' }));
    
    periodWorkouts.forEach(workout => {
      const month = workout.date.getMonth();
      distribution[month].value++;
    });

    return distribution;
  }, [getWorkoutsByPeriod]);

  // Adicionar tipo de treino
  const addWorkoutType = useCallback(async (typeData: Omit<WorkoutType, 'id'>) => {
    setIsLoading(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newType: WorkoutType = {
        ...typeData,
        id: Date.now().toString(),
      };

      setWorkoutTypes(prev => [...prev, newType]);
      setIsLoading(false);
      return newType;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Atualizar tipo de treino
  const updateWorkoutType = useCallback(async (id: string, typeData: Partial<Omit<WorkoutType, 'id'>>) => {
    setIsLoading(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setWorkoutTypes(prev => prev.map(type => 
        type.id === id 
          ? { ...type, ...typeData }
          : type
      ));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Remover tipo de treino
  const removeWorkoutType = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Não permitir remover tipos padrão
      if (['1', '2', '4', '5', '6', '7'].includes(id)) {
        throw new Error('Não é possível remover tipos de treino padrão');
      }
      
      setWorkoutTypes(prev => prev.filter(type => type.id !== id));
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  return {
    // Estado
    workouts,
    workoutTypes,
    isLoading,
    
    // Ações CRUD para treinos
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    
    // Ações CRUD para tipos de treino
    addWorkoutType,
    updateWorkoutType,
    removeWorkoutType,
    
    // Consultas
    getWorkoutByDate,
    getWorkoutsByPeriod,
    getStats,
    getTypeDistribution,
    getWeekdayDistribution,
    getMonthDistribution,
    
    // Utilitários
    calculateStreak,
  };
};