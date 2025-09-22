import { useState } from 'react';
import { Plus, Trash2, Edit2, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFitLog } from '@/hooks/useFitLog';
import { useToast } from '@/hooks/use-toast';

const EMOJI_OPTIONS = ['🅰️', '🅱️', 'Ⓒ', 'Ⓓ', 'Ⓔ', 'Ⓕ', '🦵', '🔄', '🤷', '💪', '🏃', '🧘', '🏊', '🚴', '🏋️', '🤸', '⚡', '🥊', '⛷️', '🏀', '⚽', '🎾', '🏐', '🏓', '🥋', '🤾', '🏆', '🔥', '💯'];

const COLOR_OPTIONS = [
  'hsl(142 76% 36%)', // Verde
  'hsl(217 91% 60%)', // Azul
  'hsl(266 76% 46%)', // Roxo
  'hsl(195 92% 50%)', // Azul claro
  'hsl(25 95% 53%)', // Laranja
  'hsl(120 76% 36%)', // Verde escuro
  'hsl(0 84% 60%)', // Vermelho
  'hsl(300 76% 46%)', // Magenta
  'hsl(45 93% 47%)', // Amarelo
  'hsl(330 81% 60%)', // Rosa
  'hsl(20 90% 48%)', // Laranja escuro
  'hsl(160 84% 39%)', // Verde água
];

export const WorkoutTypes = () => {
  const { workoutTypes, addWorkoutType, removeWorkoutType, updateWorkoutType } = useFitLog();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💪',
    color: 'hsl(142 76% 36%)',
    exercises: [] as Array<{ id: string; name: string; sets: number; reps: string }>
  });

  const handleOpenModal = (type?: any) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        icon: type.icon,
        color: type.color,
        exercises: type.exercises || []
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        icon: '💪',
        color: 'hsl(142 76% 36%)',
        exercises: []
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
    setFormData({
      name: '',
      icon: '💪',
      color: 'hsl(142 76% 36%)',
      exercises: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do treino é obrigatório",
        className: "border-red-600 bg-red-50 text-red-900",
        duration: 3000,
      });
      return;
    }

    try {
      if (editingType) {
        await updateWorkoutType(editingType.id, formData);
        toast({
          title: "Tipo de treino atualizado!",
          description: "As alterações foram salvas com sucesso",
          className: "border-green-600 bg-green-50 text-green-900",
          duration: 3000,
        });
      } else {
        await addWorkoutType(formData);
        toast({
          title: "Tipo de treino criado!",
          description: "Novo tipo de treino adicionado com sucesso",
          className: "border-green-600 bg-green-50 text-green-900",
          duration: 3000,
        });
      }
      handleCloseModal();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao salvar o tipo de treino",
        className: "border-red-600 bg-red-50 text-red-900",
        duration: 3000,
      });
    }
  };

  const handleDeleteType = async (typeId: string) => {
    try {
      await removeWorkoutType(typeId);
      toast({
        title: "Tipo de treino excluído!",
        description: "O tipo de treino foi removido com sucesso",
        className: "border-green-600 bg-green-50 text-green-900",
        duration: 3000,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir o tipo de treino",
        className: "border-red-600 bg-red-50 text-red-900",
        duration: 3000,
      });
    }
  };

  const addExercise = () => {
    const newExercise = {
      id: Date.now().toString(),
      name: '',
      sets: 3,
      reps: '10-12'
    };
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const updateExercise = (exerciseId: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === exerciseId ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const customTypes = workoutTypes.filter(type => !['1', '2', '4', '5', '6', '7'].includes(type.id));
  const defaultTypes = workoutTypes.filter(type => ['1', '2', '4', '5', '6', '7'].includes(type.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Fichas de Treino</h2>
        <p className="text-muted-foreground">Gerencie suas fichas de treino disponíveis</p>
      </div>

      {/* Modal customizado seguindo o padrão do WorkoutModal */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={handleCloseModal}
            />
          
            {/* Modal */}
            <Card className="relative z-10 w-full max-w-md mx-4 p-6 bg-card shadow-modal animate-scale-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingType ? 'Editar Tipo de Treino' : 'Novo Tipo de Treino'}
                </h3>
                <Button variant="outline" size="sm" onClick={handleCloseModal} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Nome do Treino</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: CrossFit, Boxe, etc."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Emoji</Label>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                        className={`p-3 text-lg rounded-md border transition-all hover:scale-105 ${
                          formData.icon === emoji
                            ? 'border-primary bg-primary/10 scale-105'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Cor</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                          formData.color === color
                            ? 'border-foreground scale-110'
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Exercícios (Opcional) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Exercícios (Opcional)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExercise}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  
                  {formData.exercises.length > 0 && (
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {formData.exercises.map((exercise, index) => (
                        <div key={exercise.id} className="p-3 border rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Exercício {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExercise(exercise.id)}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Input
                            placeholder="Nome do exercício"
                            value={exercise.name}
                            onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                            className="text-sm"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs text-muted-foreground">Séries</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={exercise.sets}
                                onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value) || 1)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Repetições</Label>
                              <Input
                                placeholder="Ex: 10-12, 15, máximo"
                                value={exercise.reps}
                                onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-primary">
                    {editingType ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </>
      )}

      {/* Tipos Personalizados */}
      {customTypes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Tipos Personalizados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTypes.map((type) => (
              <Card key={type.id} className="shadow-workout">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{type.icon}</span>
                      <span className="font-medium">{type.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(type)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Tipo de Treino</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o tipo "{type.name}"? Esta ação não pode ser desfeita.
                              Os treinos já registrados com este tipo permanecerão no histórico.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteType(type.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="w-full h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tipos Padrão */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Fichas Padrão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultTypes.map((type) => (
            <Card key={type.id} className="shadow-workout">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenModal(type)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-3 rounded-full"
                  style={{ backgroundColor: type.color }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};