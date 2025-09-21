import { useState } from 'react';
import { Calendar, TrendingUp, History, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkoutCalendar } from '@/components/WorkoutCalendar';
import { WorkoutModal } from '@/components/WorkoutModal';
import { StatsCards } from '@/components/StatsCards';
import { WorkoutHistory } from '@/components/WorkoutHistory';
import { useFitLog } from '@/hooks/useFitLog';
import { cn } from '@/lib/utils';

type ActiveTab = 'calendar' | 'stats' | 'history';

const Index = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<any>(null);
  
  const { getWorkoutByDate } = useFitLog();

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
    { key: 'history' as const, label: 'Histórico', icon: History },
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
              onClick={() => handleDateSelect(new Date())}
              className="bg-gradient-primary shadow-workout"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Treino
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200",
                  "border-b-2 hover:text-primary",
                  activeTab === key
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:border-primary/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <WorkoutCalendar 
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {activeTab === 'stats' && <StatsCards />}

        {activeTab === 'history' && (
          <WorkoutHistory onEditWorkout={handleEditWorkout} />
        )}
      </main>

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
