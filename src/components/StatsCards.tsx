import { useState } from 'react';
import { Calendar, Target, TrendingUp, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, subWeeks, addMonths, subMonths, addYears, subYears, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFitLogContext } from '@/contexts/FitLogContext';
import { cn } from '@/lib/utils';

type PeriodType = 'week' | 'month' | 'year';

export const StatsCards = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const { getStats, getTypeDistribution, getWeekdayDistribution, getMonthDistribution } = useFitLogContext();

  const stats = getStats(selectedPeriod, currentDate);
  const distribution = getTypeDistribution(selectedPeriod, currentDate);
  const weekdayDistribution = (selectedPeriod === 'week' || selectedPeriod === 'month' || selectedPeriod === 'year') ? getWeekdayDistribution(selectedPeriod, currentDate) : [];
  const monthDistribution = selectedPeriod === 'year' ? getMonthDistribution(currentDate) : [];

  const periods = [
    { key: 'week', label: 'Semana', icon: Calendar },
    { key: 'month', label: 'Mês', icon: Target },
    { key: 'year', label: 'Ano', icon: TrendingUp },
  ] as const;

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const amount = direction === 'next' ? 1 : -1;
    
    switch (selectedPeriod) {
      case 'week':
        setCurrentDate(prev => direction === 'next' ? addWeeks(prev, amount) : subWeeks(prev, -amount));
        break;
      case 'month':
        setCurrentDate(prev => direction === 'next' ? addMonths(prev, amount) : subMonths(prev, -amount));
        break;
      case 'year':
        setCurrentDate(prev => direction === 'next' ? addYears(prev, amount) : subYears(prev, -amount));
        break;
    }
  };

  const formatPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `De ${format(weekStart, 'd', { locale: ptBR })} à ${format(weekEnd, 'd')} de ${format(weekEnd, 'MMMM', { locale: ptBR })}`;
      case 'month':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'year':
        return format(currentDate, "yyyy", { locale: ptBR });
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Seletor de período */}
      <Card className="p-4 bg-gradient-card shadow-card">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">Estatísticas</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            {periods.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={selectedPeriod === key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedPeriod(key);
                  setCurrentDate(new Date());
                }}
                className={cn(
                  "h-10 px-4 py-2 flex-1 min-w-0",
                  selectedPeriod === key && "bg-gradient-primary"
                )}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Navegação de período */}
        <div className="mt-6">{/* Espaçamento extra */}</div>
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigatePeriod('prev')}
            className="h-8 w-8 p-0 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h4 className="font-medium text-foreground capitalize text-center text-sm sm:text-base truncate px-1">
            {formatPeriodTitle()}
          </h4>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigatePeriod('next')}
            className="h-8 w-8 p-0 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total de treinos */}
        <Card className="p-4 bg-gradient-card shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Treinos</p>
            </div>
          </div>
        </Card>

        {/* Dias perdidos */}
        <Card className="p-4 bg-gradient-card shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Calendar className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.lostDays}</p>
              <p className="text-sm text-muted-foreground">Dias perdidos</p>
            </div>
          </div>
        </Card>

        {/* Consistência */}
        <Card className="p-4 bg-gradient-card shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.percentage}%</p>
              <p className="text-sm text-muted-foreground">Consistência</p>
            </div>
          </div>
        </Card>

        {/* Sequência */}
        <Card className="p-4 bg-gradient-card shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Trophy className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.streak}</p>
              <p className="text-sm text-muted-foreground">Sequência</p>
            </div>
          </div>
        </Card>
      </div>


      {/* Distribuição por tipo */}
      {distribution.length > 0 && (
        <Card className="p-4 bg-gradient-card shadow-card">
          <h4 className="font-semibold text-foreground mb-4">Distribuição por Tipo</h4>
          <div className="space-y-3">
            {distribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(item.value / Math.max(...distribution.map(d => d.value))) * 100}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground min-w-[20px]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Distribuição por dia da semana (para semana, mês e ano) */}
      {weekdayDistribution.length > 0 && weekdayDistribution.some(item => item.value > 0) && (
        <Card className="p-4 bg-gradient-card shadow-card">
          <h4 className="font-semibold text-foreground mb-4">Treinos por Dia da Semana</h4>
          <div className="space-y-3">
            {weekdayDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${weekdayDistribution.length > 0 ? (item.value / Math.max(...weekdayDistribution.map(d => d.value))) * 100 : 0}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground min-w-[20px]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Distribuição por mês (apenas para ano) */}
      {monthDistribution.length > 0 && monthDistribution.some(item => item.value > 0) && (
        <Card className="p-4 bg-gradient-card shadow-card">
          <h4 className="font-semibold text-foreground mb-4">Treinos por Mês</h4>
          <div className="space-y-3">
            {monthDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${monthDistribution.length > 0 ? (item.value / Math.max(...monthDistribution.map(d => d.value))) * 100 : 0}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground min-w-[20px]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};