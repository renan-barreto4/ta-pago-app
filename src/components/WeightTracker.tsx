import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Scale, ChevronDown, Calendar as CalendarIcon, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWeightContext } from '@/contexts/WeightContext';
import { cn } from '@/lib/utils';

const WeightTracker = () => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [currentWeight, setCurrentWeight] = useState(70);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { weightEntries, addWeightEntry, updateWeightEntry, deleteWeightEntry, getFilteredEntries, getLatestWeight } = useWeightContext();
  
  const filteredData = getFilteredEntries(selectedPeriod);

  const handleSaveWeight = () => {
    const existingEntry = weightEntries.find(entry => 
      format(entry.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
    
    if (existingEntry) {
      updateWeightEntry(existingEntry.id, currentWeight, selectedDate);
    } else {
      addWeightEntry(currentWeight, selectedDate);
    }
    setIsModalOpen(false);
    setSelectedDate(new Date());
  };

  const periods = [
    { key: '7d' as const, label: '7 dias' },
    { key: '30d' as const, label: '30 dias' },
    { key: '90d' as const, label: '90 dias' },
    { key: '1y' as const, label: '1 ano' },
    { key: 'all' as const, label: 'Todos' },
  ];

  const chartData = filteredData
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: format(entry.date, 'dd/MM'),
      weight: entry.weight,
      fullDate: format(entry.date, 'dd/MM/yyyy')
    }));

  // Calculate stats
  const sortedEntries = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const initialWeight = sortedEntries[0]?.weight || 0;
  const latestWeight = getLatestWeight()?.weight || 0;
  const weightChange = latestWeight - initialWeight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4 bg-gradient-card shadow-card">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-foreground">Controle de Peso</h3>
        
          {/* Period Filter */}
          <div className="flex justify-center">
          <Select value={selectedPeriod} onValueChange={(value: '7d' | '30d' | '90d' | '1y' | 'all') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map(({ key, label }) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      {weightEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-card shadow-card">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Peso Inicial</p>
              <p className="text-2xl font-bold text-foreground">{initialWeight} kg</p>
              <p className="text-xs text-muted-foreground mt-1">
                {sortedEntries[0] && format(sortedEntries[0].date, 'dd/MM/yyyy')}
              </p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-card shadow-card">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Peso Atual</p>
              <p className="text-2xl font-bold text-foreground">{latestWeight} kg</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getLatestWeight() && format(getLatestWeight()!.date, 'dd/MM/yyyy')}
              </p>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-card shadow-card">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Variação</p>
              <div className="flex items-center justify-center gap-1">
                {weightChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : weightChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                ) : (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                )}
                <p className={cn(
                  "text-2xl font-bold",
                  weightChange > 0 ? "text-red-500" : weightChange < 0 ? "text-green-500" : "text-muted-foreground"
                )}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card className="p-4 bg-gradient-card shadow-card">
        <div className="h-96 mb-6 relative">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--muted-foreground))"
                  opacity={0.2}
                />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={{ stroke: 'hsl(var(--border))' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Tooltip 
                  labelFormatter={(value, payload) => {
                    if (payload && payload[0]) {
                      return payload[0].payload.fullDate;
                    }
                    return value;
                  }}
                  formatter={(value: number) => [`${value} kg`, 'Peso']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--popover-foreground))',
                    boxShadow: '0 10px 30px -10px hsl(var(--primary) / 0.3)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ 
                    fill: 'hsl(var(--primary))', 
                    strokeWidth: 3, 
                    r: 5,
                    stroke: 'hsl(var(--background))'
                  }}
                  activeDot={{ 
                    r: 8, 
                    stroke: 'hsl(var(--primary))', 
                    strokeWidth: 3,
                    fill: 'hsl(var(--background))'
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Scale className="h-16 w-16 mx-auto mb-6 opacity-40" />
                <p className="text-lg mb-2">Nenhum registro de peso encontrado</p>
                <p className="text-sm opacity-70">Adicione seu primeiro peso para ver o gráfico</p>
              </div>
            </div>
          )}
        </div>

        {/* Add Weight Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all duration-200 hover:scale-105"
            size="icon"
          >
            <Plus className="h-6 w-6 font-bold" strokeWidth={3} />
          </Button>
        </div>
      </Card>

      {/* Weight History Table */}
      {weightEntries.length > 0 && (
        <Card className="p-6 bg-gradient-card shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Histórico de Peso</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weightEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((entry, index, sortedEntries) => {
                  const previousEntry = sortedEntries[index + 1];
                  const difference = previousEntry ? entry.weight - previousEntry.weight : 0;
                  
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(entry.date, 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {entry.weight} kg
                      </TableCell>
                      <TableCell>
                        {previousEntry && (
                          <span className={cn(
                            "text-sm",
                            difference > 0 ? "text-red-500" : difference < 0 ? "text-green-500" : "text-muted-foreground"
                          )}>
                            {difference > 0 ? '+' : ''}{difference.toFixed(1)} kg
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWeightEntry(entry.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Weight Modal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
          
            {/* Modal */}
            <Card className="relative z-10 w-full max-w-md mx-4 p-6 bg-card shadow-modal animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Adicionar Peso
                </h3>
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Data</label>
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setShowDatePicker(false);
                      }
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Weight Input */}
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                {currentWeight} kg
              </div>
              <p className="text-sm text-muted-foreground">
                Digite o peso atual
              </p>
            </div>

            {/* Weight Input Field */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Peso (kg)</label>
                <Input
                  type="number"
                  min="20"
                  max="300"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (value >= 20 && value <= 300) {
                      setCurrentWeight(value);
                    }
                  }}
                  placeholder="Ex: 70.5"
                  className="text-center text-lg font-medium"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mínimo: 20 kg</span>
                  <span>Máximo: 300 kg</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedDate(new Date());
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveWeight}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Salvar
              </Button>
            </div>
          </div>
            </Card>
          </div>
        </>
      )}

    </div>
  );
};

export default WeightTracker;