import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, isSameDay } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Helper para interpretar datas do banco no timezone de São Paulo
const parseDateInSaoPauloTimezone = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Meio-dia para evitar problemas de DST
};

export interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  weight?: number;
  notes?: string;
  order: number;
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

export const useFitLog = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutTypes, setWorkoutTypes] = useState<WorkoutType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar tipos de treino do Supabase
  useEffect(() => {
    loadWorkoutTypes();
    loadWorkouts();
  }, []);

  const loadWorkoutTypes = async () => {
    try {
      console.log('🔍 Carregando tipos de treino...');
      
      // Carregar tipos
      const typesQuery = supabase
        .from('workout_types')
        .select('*')
        .order('name');
      
      const { data: typesData, error: typesError } = await typesQuery;

      console.log('📊 Resultado da query de tipos:', { data: typesData, error: typesError });

      if (typesError) {
        console.error('❌ Erro na query:', typesError);
        throw typesError;
      }

      // Carregar todos os exercícios de uma vez
      const exercisesQuery = supabase
        .from('workout_exercises')
        .select('id, workout_type_id, name, sets, reps, weight, notes, exercise_order')
        .order('exercise_order', { ascending: true });
      
      const { data: allExercisesData, error: allExercisesError } = await exercisesQuery;

      console.log('📋 Exercícios carregados do banco:', allExercisesData);

      if (allExercisesError) {
        console.error('❌ Erro ao carregar exercícios:', allExercisesError);
      }

      // Agrupar exercícios por tipo
      const exercisesByType: Record<string, Exercise[]> = {};
      
      if (allExercisesData) {
        for (const ex of allExercisesData as any[]) {
          const typeId = ex.workout_type_id as string;
          console.log(`🔗 Vinculando exercício "${ex.name}" ao tipo ${typeId}`);
          if (!exercisesByType[typeId]) {
            exercisesByType[typeId] = [];
          }
          exercisesByType[typeId].push({
            id: ex.id,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight ?? undefined,
            notes: ex.notes ?? undefined,
            order: ex.exercise_order,
          });
        }
      }

      console.log('📦 Exercícios agrupados por tipo:', exercisesByType);

      // Montar tipos com seus exercícios
      const types: WorkoutType[] = (typesData || []).map(type => ({
        id: type.id,
        name: type.name,
        icon: type.icon,
        color: type.color,
        exercises: exercisesByType[type.id] || [],
      }));

      console.log('✅ Tipos de treino carregados com exercícios:', types);
      setWorkoutTypes(types);
    } catch (error) {
      console.error('❌ Erro ao carregar tipos de treino:', error);
    }
  };

  const loadWorkouts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const workoutsData = (data || []).map(workout => ({
        id: workout.id,
        date: parseDateInSaoPauloTimezone(workout.date),
        typeId: workout.type_id,
        customType: workout.custom_type || undefined,
        notes: workout.notes || undefined,
        createdAt: new Date(workout.created_at),
        updatedAt: new Date(workout.updated_at),
      }));

      setWorkouts(workoutsData);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      toast({
        title: 'Erro ao carregar treinos',
        description: 'Não foi possível carregar seus treinos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar treino
  const saveWorkout = useCallback(async (
    workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>,
    exercises: Exercise[] = []
  ) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Normalizar a data para meio-dia antes de formatar (evita problemas de DST)
      const normalizedDate = new Date(
        workoutData.date.getFullYear(),
        workoutData.date.getMonth(),
        workoutData.date.getDate(),
        12, 0, 0
      );
      const dateStr = formatInTimeZone(normalizedDate, 'America/Sao_Paulo', 'yyyy-MM-dd');

      // Verificar diretamente no banco se já existe treino nesta data
      const { data: existingWorkouts, error: checkError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingWorkouts) {
        // Atualizar treino existente
        const { data, error } = await supabase
          .from('workouts')
          .update({
            type_id: workoutData.typeId,
            custom_type: workoutData.customType || null,
            notes: workoutData.notes || null,
          })
          .eq('id', existingWorkouts.id)
          .select()
          .single();

        if (error) throw error;

        // Salvar exercícios
        await saveWorkoutExercises(existingWorkouts.id, exercises);

        const updated: Workout = {
          id: data.id,
          date: parseDateInSaoPauloTimezone(data.date),
          typeId: data.type_id,
          customType: data.custom_type || undefined,
          notes: data.notes || undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setWorkouts(prev => prev.map(workout => 
          workout.id === existingWorkouts.id ? updated : workout
        ));

        toast({
          title: 'Treino atualizado',
          description: 'Seu treino foi atualizado com sucesso.',
        });

        setIsLoading(false);
        return updated;
      } else {
        // Criar novo treino
        const { data, error } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            date: dateStr,
            type_id: workoutData.typeId,
            custom_type: workoutData.customType || null,
            notes: workoutData.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Salvar exercícios
        await saveWorkoutExercises(data.id, exercises);

        const newWorkout: Workout = {
          id: data.id,
          date: parseDateInSaoPauloTimezone(data.date),
          typeId: data.type_id,
          customType: data.custom_type || undefined,
          notes: data.notes || undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setWorkouts(prev => [...prev, newWorkout]);

        toast({
          title: 'Treino registrado',
          description: 'Seu treino foi registrado com sucesso.',
        });

        setIsLoading(false);
        return newWorkout;
      }
    } catch (error: any) {
      console.error('Erro ao salvar treino:', error);
      toast({
        title: 'Erro ao salvar treino',
        description: error.message || 'Não foi possível salvar o treino.',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  }, [workouts, toast]);

  // Atualizar treino
  const updateWorkout = useCallback(async (
    id: string, 
    workoutData: Partial<Omit<Workout, 'id' | 'createdAt'>>,
    exercises: Exercise[] = []
  ) => {
    setIsLoading(true);
    
    try {
      const updateData: any = {};
      if (workoutData.typeId) updateData.type_id = workoutData.typeId;
      if (workoutData.customType !== undefined) updateData.custom_type = workoutData.customType || null;
      if (workoutData.notes !== undefined) updateData.notes = workoutData.notes || null;
      if (workoutData.date) {
        // Normalizar a data para meio-dia antes de formatar (evita problemas de DST)
        const normalizedDate = new Date(
          workoutData.date.getFullYear(),
          workoutData.date.getMonth(),
          workoutData.date.getDate(),
          12, 0, 0
        );
        updateData.date = formatInTimeZone(normalizedDate, 'America/Sao_Paulo', 'yyyy-MM-dd');
      }

      const { error } = await supabase
        .from('workouts')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Salvar exercícios
      await saveWorkoutExercises(id, exercises);

      setWorkouts(prev => prev.map(workout => 
        workout.id === id 
          ? { ...workout, ...workoutData, updatedAt: new Date() }
          : workout
      ));

      toast({
        title: 'Treino atualizado',
        description: 'Seu treino foi atualizado com sucesso.',
      });

      setIsLoading(false);
    } catch (error: any) {
      console.error('Erro ao atualizar treino:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o treino.',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  }, [toast]);

  // Deletar treino
  const deleteWorkout = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkouts(prev => prev.filter(workout => workout.id !== id));

      toast({
        title: 'Treino excluído',
        description: 'Seu treino foi excluído com sucesso.',
      });

      setIsLoading(false);
    } catch (error: any) {
      console.error('Erro ao excluir treino:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o treino.',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  }, [toast]);

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
    const today = new Date();
    const endDate = end > today ? today : end;
    const totalDays = Math.ceil((endDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const workoutDays = new Set(periodWorkouts.map(w => format(w.date, 'yyyy-MM-dd'))).size;
    
    // Tipo mais frequente
    const typeCount = periodWorkouts.reduce((acc, workout) => {
      const type = workout.customType || workoutTypes.find(t => t.id === workout.typeId)?.name || 'Desconhecido';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentType = Object.entries(typeCount).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum';
    
    const streak = calculateMaxStreakInPeriod(periodWorkouts);
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

  const calculateStreak = useCallback((allWorkouts: Workout[], fromDate: Date = new Date()) => {
    const sortedDates = allWorkouts
      .map(w => format(w.date, 'yyyy-MM-dd'))
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date(fromDate);
    
    for (let i = 0; i < 365; i++) {
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
      const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      distribution[index].value++;
    });

    return distribution;
  }, [getWorkoutsByPeriod]);

  // Obter distribuição por mês
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('workout_types')
        .insert({
          user_id: user.id,
          name: typeData.name,
          icon: typeData.icon,
          color: typeData.color,
        })
        .select()
        .single();

      if (error) throw error;

      const newType: WorkoutType = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
      };

      setWorkoutTypes(prev => [...prev, newType]);
      
      toast({
        title: 'Tipo de treino criado',
        description: 'Novo tipo de treino adicionado com sucesso.',
      });

      setIsLoading(false);
      return newType;
    } catch (error: any) {
      console.error('Erro ao adicionar tipo de treino:', error);
      toast({
        title: 'Erro ao criar tipo',
        description: error.message || 'Não foi possível criar o tipo de treino.',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  }, [toast]);

  // Atualizar tipo de treino
  const updateWorkoutType = async (id: string, typeData: Partial<Omit<WorkoutType, 'id'>>) => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Atualizando tipo de treino:', id, typeData);
      
      const updateData: any = {};
      if (typeData.name) updateData.name = typeData.name;
      if (typeData.icon) updateData.icon = typeData.icon;
      if (typeData.color) updateData.color = typeData.color;

      const { error } = await supabase
        .from('workout_types')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Se foram fornecidos exercícios, salvar no banco
      if (typeData.exercises !== undefined) {
        console.log('💾 Salvando exercícios para o tipo:', typeData.exercises);
        
        // Deletar exercícios antigos deste tipo
        const { error: deleteError } = await supabase
          .from('workout_exercises')
          .delete()
          .eq('workout_type_id', id);

        if (deleteError) {
          console.error('❌ Erro ao deletar exercícios antigos:', deleteError);
          throw deleteError;
        }

        // Inserir novos exercícios
        if (typeData.exercises.length > 0) {
          const exercisesToInsert = typeData.exercises
            .filter(ex => ex.name && ex.name.trim()) // Apenas exercícios com nome
            .map((ex, index) => ({
              workout_type_id: id,
              name: ex.name,
              sets: ex.sets || 3,
              reps: ex.reps || '10-12',
              weight: ex.weight,
              notes: ex.notes,
              exercise_order: ex.order ?? index,
            }));

          if (exercisesToInsert.length > 0) {
            console.log('📝 Inserindo exercícios no banco:', exercisesToInsert);

            const { error: insertError } = await supabase
              .from('workout_exercises')
              .insert(exercisesToInsert as any);

            if (insertError) {
              console.error('❌ Erro ao inserir exercícios:', insertError);
              throw insertError;
            }

            console.log('✅ Exercícios salvos com sucesso!');
          }
        }
      }

      // Recarregar tipos para pegar os exercícios atualizados
      await loadWorkoutTypes();

      toast({
        title: 'Tipo atualizado',
        description: 'Tipo de treino e exercícios atualizados com sucesso.',
      });

      setIsLoading(false);
    } catch (error: any) {
      console.error('Erro ao atualizar tipo de treino:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o tipo.',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  };

  // Remover tipo de treino

  // Remover tipo de treino
  const removeWorkoutType = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('workout_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWorkoutTypes(prev => prev.filter(type => type.id !== id));

      toast({
        title: 'Tipo excluído',
        description: 'Tipo de treino excluído com sucesso.',
      });

      setIsLoading(false);
    } catch (error: any) {
      console.error('Erro ao remover tipo de treino:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o tipo.',
        variant: 'destructive',
      });
      setIsLoading(false);
      throw error;
    }
  }, [toast]);

  // Salvar exercícios de um treino
  const saveWorkoutExercises = async (workoutId: string, exercises: Exercise[]) => {
    try {
      console.log('💾 Salvando exercícios para workout:', workoutId, exercises);
      
      // Deletar exercícios antigos
      const { error: deleteError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('workout_id', workoutId);
      
      if (deleteError) {
        console.error('❌ Erro ao deletar exercícios antigos:', deleteError);
        throw deleteError;
      }

      // Inserir novos exercícios
      if (exercises.length > 0) {
        const exercisesToInsert = exercises.map((ex, index) => ({
          workout_id: workoutId,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || null,
          notes: ex.notes || null,
          exercise_order: ex.order ?? index,
        }));

        console.log('📝 Inserindo exercícios:', exercisesToInsert);

        const { error: insertError } = await supabase
          .from('workout_exercises')
          .insert(exercisesToInsert);

        if (insertError) {
          console.error('❌ Erro ao inserir exercícios:', insertError);
          throw insertError;
        }
        
        console.log('✅ Exercícios salvos com sucesso!');
      } else {
        console.log('ℹ️ Nenhum exercício para salvar');
      }
    } catch (error) {
      console.error('💥 Erro ao salvar exercícios:', error);
      throw error;
    }
  };

  // Carregar exercícios de um treino
  const loadWorkoutExercises = useCallback(async (workoutId: string): Promise<Exercise[]> => {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select('*')
        .eq('workout_id', workoutId)
        .order('exercise_order', { ascending: true });

      if (error) throw error;

      return (data || []).map(ex => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || undefined,
        notes: ex.notes || undefined,
        order: ex.exercise_order,
      }));
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
      return [];
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
    
    // Ações para exercícios
    loadWorkoutExercises,
    
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
