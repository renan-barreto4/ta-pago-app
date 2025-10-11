import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';

export interface WeightEntry {
  id: string;
  weight: number;
  date: Date;
  createdAt: Date;
}

export const useWeightTracker = () => {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Carregar dados do Supabase
  useEffect(() => {
    loadWeightEntries();
  }, []);

  const loadWeightEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const entries = (data || []).map(entry => ({
        id: entry.id,
        weight: Number(entry.weight),
        date: parse(entry.date, 'yyyy-MM-dd', new Date()),
        createdAt: new Date(entry.created_at),
      }));

      setWeightEntries(entries);
    } catch (error) {
      console.error('Erro ao carregar registros de peso:', error);
      toast({
        title: 'Erro ao carregar registros',
        description: 'Não foi possível carregar seus registros de peso.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addWeightEntry = async (weight: number, date: Date = new Date()) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('weight_entries')
        .insert({
          user_id: user.id,
          weight,
          date: format(date, 'yyyy-MM-dd'),
        })
        .select()
        .single();

      if (error) throw error;

      const newEntry: WeightEntry = {
        id: data.id,
        weight: Number(data.weight),
        date: parse(data.date, 'yyyy-MM-dd', new Date()),
        createdAt: new Date(data.created_at),
      };

      setWeightEntries(prev => [newEntry, ...prev].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));

      toast({
        title: 'Peso registrado',
        description: 'Seu peso foi registrado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao adicionar registro de peso:', error);
      toast({
        title: 'Erro ao registrar peso',
        description: error.message || 'Não foi possível registrar o peso.',
        variant: 'destructive',
      });
    }
  };

  const updateWeightEntry = async (id: string, weight: number, date: Date) => {
    try {
      const { error } = await supabase
        .from('weight_entries')
        .update({
          weight,
          date: format(date, 'yyyy-MM-dd'),
        })
        .eq('id', id);

      if (error) throw error;

      setWeightEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { ...entry, weight, date }
            : entry
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      );

      toast({
        title: 'Peso atualizado',
        description: 'Seu registro foi atualizado com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao atualizar registro de peso:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o registro.',
        variant: 'destructive',
      });
    }
  };

  const deleteWeightEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weight_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWeightEntries(prev => prev.filter(entry => entry.id !== id));

      toast({
        title: 'Registro excluído',
        description: 'Seu registro foi excluído com sucesso.',
      });
    } catch (error: any) {
      console.error('Erro ao excluir registro de peso:', error);
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o registro.',
        variant: 'destructive',
      });
    }
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
    updateWeightEntry,
    deleteWeightEntry,
    getFilteredEntries,
    getLatestWeight,
    getWeightChange,
  };
};