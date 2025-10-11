import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Scale, Dumbbell, LogOut } from 'lucide-react';
import { WorkoutCalendar } from '@/components/WorkoutCalendar';
import { WorkoutModal } from '@/components/WorkoutModal';
import { StatsCards } from '@/components/StatsCards';
import { WorkoutTypes } from '@/components/WorkoutTypes';
import WeightTracker from '@/components/WeightTracker';
import { useFitLog } from '@/hooks/useFitLog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ActiveTab = 'calendar' | 'stats' | 'weight' | 'types';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  
  const { getWorkoutByDate } = useFitLog();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Até logo!',
        description: 'Você foi desconectado com sucesso.',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível sair.',
        variant: 'destructive',
      });
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const existingWorkout = getWorkoutByDate(date);
    setEditingWorkout(existingWorkout || null);
    setIsModalOpen(true);
  };

  const handleEditWorkout = (workout: any) => {
    setSelectedDate(workout.date);
    setEditingWorkout(workout);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setEditingWorkout(null);
  };

  const tabs = [
    { key: 'calendar' as const, label: 'Calendário', icon: Calendar },
    { key: 'stats' as const, label: 'Estatísticas', icon: TrendingUp },
    { key: 'types' as const, label: 'Treinos', icon: Dumbbell },
    { key: 'weight' as const, label: 'Peso', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-workout">
                <span className="text-white font-bold text-lg">💪</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Tá Pago</h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-20">
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <WorkoutCalendar 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {activeTab === 'stats' && <StatsCards />}

        {activeTab === 'types' && <WorkoutTypes />}

        {activeTab === 'weight' && <WeightTracker />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
        <div className="flex">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-all duration-200",
                "min-h-[60px] justify-center",
                activeTab === key
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal */}
      <WorkoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate || new Date()}
        existingWorkout={editingWorkout}
      />
    </div>

  );
};

export default Index;
