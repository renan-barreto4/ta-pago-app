import React, { createContext, useContext, ReactNode } from 'react';
import { useWeightTracker } from '@/hooks/useWeightTracker';
import type { WeightEntry } from '@/hooks/useWeightTracker';

interface WeightContextType {
  weightEntries: WeightEntry[];
  isLoading: boolean;
  addWeightEntry: (weight: number, date?: Date) => Promise<void>;
  updateWeightEntry: (id: string, weight: number, date: Date) => Promise<void>;
  deleteWeightEntry: (id: string) => Promise<void>;
  getFilteredEntries: (period: '7d' | '30d' | '90d' | '1y' | 'all') => WeightEntry[];
  getLatestWeight: () => WeightEntry | null;
  getWeightChange: (period: '7d' | '30d' | '90d' | '1y' | 'all') => number | null;
}

const WeightContext = createContext<WeightContextType | undefined>(undefined);

export function WeightProvider({ children }: { children: ReactNode }) {
  const weightTracker = useWeightTracker();

  return (
    <WeightContext.Provider value={weightTracker}>
      {children}
    </WeightContext.Provider>
  );
}

export function useWeightContext() {
  const context = useContext(WeightContext);
  if (context === undefined) {
    throw new Error('useWeightContext must be used within a WeightProvider');
  }
  return context;
}
