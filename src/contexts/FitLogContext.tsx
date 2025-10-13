import React, { createContext, useContext, ReactNode } from 'react';
import { useFitLog } from '@/hooks/useFitLog';
import type { Workout, WorkoutType, Exercise, WorkoutStats } from '@/hooks/useFitLog';

interface FitLogContextType {
  workouts: Workout[];
  workoutTypes: WorkoutType[];
  isLoading: boolean;
  saveWorkout: (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>, exercises?: Exercise[]) => Promise<Workout>;
  updateWorkout: (id: string, workoutData: Partial<Omit<Workout, 'id' | 'createdAt'>>, exercises?: Exercise[]) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkoutByDate: (date: Date) => Workout | undefined;
  getWorkoutsByPeriod: (start: Date, end: Date) => Workout[];
  getStats: (period: 'week' | 'month' | 'year', date?: Date) => WorkoutStats;
  getTypeDistribution: (period: 'week' | 'month' | 'year', date?: Date) => Array<{ name: string; value: number; color: string; icon: string; }>;
  getWeekdayDistribution: (period: 'week' | 'month' | 'year', date?: Date) => Array<{ name: string; value: number; color: string; icon: string; }>;
  getMonthDistribution: (date?: Date) => Array<{ name: string; value: number; color: string; icon: string; }>;
  addWorkoutType: (typeData: Omit<WorkoutType, 'id'>) => Promise<WorkoutType>;
  updateWorkoutType: (id: string, typeData: Partial<Omit<WorkoutType, 'id'>>) => Promise<void>;
  removeWorkoutType: (id: string) => Promise<void>;
  reorderWorkoutTypes: (reorderedTypes: WorkoutType[]) => Promise<void>;
  loadWorkoutExercises: (workoutId: string) => Promise<Exercise[]>;
}

const FitLogContext = createContext<FitLogContextType | undefined>(undefined);

export function FitLogProvider({ children }: { children: ReactNode }) {
  const fitLog = useFitLog();

  return (
    <FitLogContext.Provider value={fitLog}>
      {children}
    </FitLogContext.Provider>
  );
}

export function useFitLogContext() {
  const context = useContext(FitLogContext);
  if (context === undefined) {
    throw new Error('useFitLogContext must be used within a FitLogProvider');
  }
  return context;
}
