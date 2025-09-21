import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFitLog } from '@/hooks/useFitLog';
import { useToast } from '@/hooks/use-toast';

const EMOJI_OPTIONS = ['💪', '🏃', '🧘', '🏊', '🚴', '🏋️', '🤸', '⚡', '🥊', '⛷️', '🏀', '⚽', '🎾', '🏐', '🏓', '🥋', '🤾', '🏆', '🔥', '💯'];

export const WorkoutTypes = () => {
  const { workoutTypes, addWorkoutType, removeWorkoutType, updateWorkoutType } = useFitLog();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💪',
    color: 'hsl(142 76% 36%)'
  });

  const handleOpenModal = (type?: any) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        icon: type.icon,
        color: type.color
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        icon: '💪',
        color: 'hsl(142 76% 36%)'
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
      color: 'hsl(142 76% 36%)'
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

  const handleDelete = async (typeId: string) => {
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

  const customTypes = workoutTypes.filter(type => type.id !== 'custom' && !['1', '2', '3', '4', '5', '6', '7', '8'].includes(type.id));
  const defaultTypes = workoutTypes.filter(type => type.id === 'custom' || ['1', '2', '3', '4', '5', '6', '7', '8'].includes(type.id));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tipos de Treino</h2>
        <p className="text-muted-foreground">Gerencie os tipos de treino disponíveis</p>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => handleOpenModal()} className="bg-gradient-primary shadow-workout">
            <Plus className="h-4 w-4 mr-2" />
            Adicione um Novo Treino
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Editar Tipo de Treino' : 'Novo Tipo de Treino'}
            </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Treino</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: CrossFit, Boxe, etc."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Emoji</Label>
                <div className="grid grid-cols-10 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                      className={`p-2 text-lg rounded-md border transition-all ${
                        formData.icon === emoji
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
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
          </DialogContent>
        </Dialog>

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
                              onClick={() => handleDelete(type.id)}
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Tipos Padrão</h3>
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