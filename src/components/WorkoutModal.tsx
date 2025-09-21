import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFitLog, WorkoutType, Workout } from '@/hooks/useFitLog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  existingWorkout?: Workout | null;
}

export const WorkoutModal = ({ isOpen, onClose, selectedDate, existingWorkout }: WorkoutModalProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [customType, setCustomType] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { workoutTypes, saveWorkout, updateWorkout, deleteWorkout } = useFitLog();
  const { toast } = useToast();

  // Resetar formulário quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      if (existingWorkout) {
        setSelectedType(existingWorkout.typeId);
        setCustomType(existingWorkout.customType || '');
        setNotes(existingWorkout.notes || '');
      } else {
        setSelectedType('');
        setCustomType('');
        setNotes('');
      }
    }
  }, [isOpen, existingWorkout]);

  const handleSave = async () => {
    if (!selectedType) {
      toast({
        title: "Tipo obrigatório",
        description: "Selecione um tipo de treino",
        variant: "destructive",
      });
      return;
    }

    if (selectedType === 'custom' && !customType.trim()) {
      toast({
        title: "Especifique o treino",
        description: "Descreva o tipo de treino personalizado",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const workoutData = {
        date: selectedDate,
        typeId: selectedType,
        customType: selectedType === 'custom' ? customType.trim() : undefined,
        notes: notes.trim() || undefined,
      };

      if (existingWorkout) {
        await updateWorkout(existingWorkout.id, workoutData);
        toast({
          title: "Treino atualizado!",
          description: "Suas alterações foram salvas com sucesso",
        });
      } else {
        await saveWorkout(workoutData);
        toast({
          title: "Treino registrado!",
          description: "Parabéns por manter a consistência",
        });
      }

      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingWorkout) return;

    setIsLoading(true);

    try {
      await deleteWorkout(existingWorkout.id);
      toast({
        title: "Treino excluído",
        description: "O registro foi removido com sucesso",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md mx-4 p-6 bg-card shadow-modal animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {existingWorkout ? 'Editar Treino' : 'Registrar Treino'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tipo de treino */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-3 block">
              Tipo de Treino
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {workoutTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200",
                    "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring",
                    selectedType === type.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/50"
                  )}
                >
                  <span className="text-lg mb-1">{type.icon}</span>
                  <span className="text-xs font-medium text-center leading-tight">
                    {type.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Campo customizado */}
          {selectedType === 'custom' && (
            <div>
              <Label htmlFor="customType" className="text-sm font-medium text-foreground">
                Especificar treino
              </Label>
              <Input
                id="customType"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Ex: Dança, Pilates, etc."
                className="mt-1"
                maxLength={50}
              />
            </div>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-foreground">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: 30 min, treino intenso, etc."
              className="mt-1 resize-none"
              rows={3}
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {notes.length}/280
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-6">
          {existingWorkout && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-gradient-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Card>
    </div>
  );
};