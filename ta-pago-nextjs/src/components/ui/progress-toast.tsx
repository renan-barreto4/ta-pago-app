import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressToastProps {
  title: string;
  description: string;
  duration?: number;
  onClose: () => void;
  className?: string;
}

export const ProgressToast = ({ 
  title, 
  description, 
  duration = 3000, 
  onClose, 
  className 
}: ProgressToastProps) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (duration / 50));
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(onClose, 100);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[300px] max-w-sm",
      "animate-slide-in-right",
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-green-500 transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};