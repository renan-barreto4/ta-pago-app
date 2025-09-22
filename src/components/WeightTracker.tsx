import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Scale } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWeightTracker } from '@/hooks/useWeightTracker';
import { cn } from '@/lib/utils';

const WeightTracker = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [currentWeight, setCurrentWeight] = useState(70);
  
  const { weightEntries, addWeightEntry, getFilteredEntries } = useWeightTracker();
  
  const filteredData = getFilteredEntries(selectedPeriod);

  const handleSaveWeight = () => {
    addWeightEntry(currentWeight);
    setIsModalOpen(false);
  };

  const periods = [
    { key: '7d' as const, label: '7 dias' },
    { key: '30d' as const, label: '30 dias' },
    { key: '90d' as const, label: '90 dias' },
    { key: '1y' as const, label: '1 ano' },
    { key: 'all' as const, label: 'Todos' },
  ];

  const chartData = filteredData.map(entry => ({
    date: format(entry.date, 'dd/MM'),
    weight: entry.weight,
    fullDate: format(entry.date, 'dd/MM/yyyy')
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-workout">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Controle de Peso</h2>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 flex-wrap">
          {periods.map(({ key, label }) => (
            <Button
              key={key}
              variant={selectedPeriod === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(key)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Chart */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="h-80 mb-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  domain={['dataMin - 2', 'dataMax + 2']}
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
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro de peso encontrado</p>
                <p className="text-sm">Adicione seu primeiro peso para ver o gráfico</p>
              </div>
            </div>
          )}
        </div>

        {/* Add Weight Button */}
        <div className="flex justify-center">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Adicionar Peso
          </Button>
        </div>
      </Card>

      {/* Weight History Table */}
      {filteredData.length > 0 && (
        <Card className="p-6 bg-gradient-card shadow-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Histórico de Peso</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((entry, index) => {
                  const previousEntry = filteredData[index + 1];
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Add Weight Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Peso</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Weight Display */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {currentWeight} kg
              </div>
              <p className="text-sm text-muted-foreground">
                Arraste a régua para ajustar
              </p>
            </div>

            {/* Weight Slider */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="0.1"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(parseFloat(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((currentWeight - 30) / (150 - 30)) * 100}%, hsl(var(--muted)) ${((currentWeight - 30) / (150 - 30)) * 100}%, hsl(var(--muted)) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>30 kg</span>
                  <span>150 kg</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveWeight}
                className="flex-1"
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default WeightTracker;