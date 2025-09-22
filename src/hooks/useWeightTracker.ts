import { useState, useEffect } from 'react';

export interface WeightEntry {
  id: string;
  weight: number;
  date: Date;
  createdAt: Date;
}

// Mock data for demonstration
const MOCK_WEIGHT_ENTRIES: WeightEntry[] = [
  {
    id: '1',
    weight: 72.5,
    date: new Date(2024, 8, 15), // 15 Sep 2024
    createdAt: new Date(),
  },
  {
    id: '2',
    weight: 71.8,
    date: new Date(2024, 8, 20), // 20 Sep 2024
    createdAt: new Date(),
  },
  {
    id: '3',
    weight: 71.2,
    date: new Date(2024, 8, 25), // 25 Sep 2024
    createdAt: new Date(),
  },
];

export const useWeightTracker = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setWeightEntries(MOCK_WEIGHT_ENTRIES);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const addWeightEntry = (weight: number) => {
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      weight,
      date: new Date(),
      createdAt: new Date(),
    };

    setWeightEntries(prev => [newEntry, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const deleteWeightEntry = (id: string) => {
    setWeightEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getFilteredEntries = (period: '7d' | '30d' | '90d' | '1y' | 'all') => {
    if (period === 'all') return weightEntries;

    const now = new Date();
    const daysMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - daysMap[period]);

    return weightEntries.filter(entry => entry.date >= cutoffDate);
  };

  const getLatestWeight = () => {
    if (weightEntries.length === 0) return null;
    return weightEntries[0];
  };

  const getWeightChange = (period: '7d' | '30d' | '90d' | '1y' | 'all') => {
    const filtered = getFilteredEntries(period);
    if (filtered.length < 2) return null;

    const latest = filtered[0];
    const oldest = filtered[filtered.length - 1];
    
    return latest.weight - oldest.weight;
  };

  return {
    weightEntries,
    isLoading,
    addWeightEntry,
    deleteWeightEntry,
    getFilteredEntries,
    getLatestWeight,
    getWeightChange,
  };
};