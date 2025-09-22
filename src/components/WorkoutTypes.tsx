import { useState } from 'react';
import { Edit2, X, Palette, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const { workoutTypes, updateWorkoutType } = useFitLog();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '💪',
    color: 'hsl(142 76% 36%)',
    exercises: [] as Array<{ id: string; name: string; sets: number; reps: string }>
  });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleOpenModal = (type: any) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      icon: type.icon,
      color: type.color,
      exercises: type.exercises || []
    });
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
    setShowEmojiPicker(false);
    setShowColorPicker(false);
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
      await updateWorkoutType(editingType.id, formData);
      toast({
        title: "Tipo de treino atualizado!",
        description: "As alterações foram salvas com sucesso",
        className: "border-green-600 bg-green-50 text-green-900",
        duration: 3000,
      });
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tipos de Treino</h2>
        <p className="text-muted-foreground">Gerencie os tipos de treino disponíveis</p>
      </div>

      {/* Modal de edição */}
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
                  Editar Tipo de Treino
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
                    placeholder="Ex: Treino A, Treino B, etc."
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Emoji</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-md flex items-center gap-2">
                      <span className="text-lg">{formData.icon}</span>
                      <span className="text-sm text-muted-foreground">Emoji selecionado</span>
                    </div>
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10">
                          <Smile className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="end">
                        <div className="grid grid-cols-6 gap-2">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, icon: emoji }));
                                setShowEmojiPicker(false);
                              }}
                              className={`p-2 text-lg rounded-md border transition-all hover:scale-105 ${
                                formData.icon === emoji
                                  ? 'border-primary bg-primary/10 scale-105'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Cor</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-md flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-foreground"
                        style={{ backgroundColor: formData.color }}
                      />
                      <span className="text-sm text-muted-foreground">Cor selecionada</span>
                    </div>
                    <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-10">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-4" align="end">
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, color }));
                                setShowColorPicker(false);
                              }}
                              className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                                formData.color === color
                                  ? 'border-foreground scale-110'
                                  : 'border-border'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-primary">
                    Atualizar
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </>
      )}

      {/* Lista de tipos de treino */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workoutTypes.map((type) => (
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