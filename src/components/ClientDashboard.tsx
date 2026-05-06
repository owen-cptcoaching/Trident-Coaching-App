import React from 'react';
import { Calendar as CalendarIcon, ChevronRight, Activity, Apple, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ClientDashboardProps {
  hasProgram: boolean;
  onOpenTraining: () => void;
  onOpenNutrition: () => void;
  onGenerateProgram: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  hasProgram, 
  onOpenTraining,
  onOpenNutrition,
  onGenerateProgram
}) => {
  // Generate a simple calendar for the current month
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();
  
  // Fake days (e.g. 1 to 30)
  const daysInMonth = new Date(currentYear, today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, today.getMonth(), 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-12">
      {hasProgram ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Training Box */}
            <div 
              onClick={onOpenTraining}
              className="group cursor-pointer bg-stone-900 text-white p-8 border border-stone-900 relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg shadow-stone-200/50 hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
              <div className="relative z-10 flex justify-between items-start">
                <h2 className="text-4xl font-oswald font-black uppercase tracking-tight group-hover:text-stone-300 transition-colors">Training</h2>
                <Activity className="text-stone-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <div className="relative z-10 mt-8 space-y-4">
                <p className="text-sm font-serif italic text-stone-400">View your active training block, structured sessions, and track performance.</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-200 group-hover:text-white transition-colors">
                  Enter Protocol <ChevronRight size={14} />
                </div>
              </div>
            </div>

            {/* Nutrition Box */}
            <div 
              onClick={onOpenNutrition}
              className="group cursor-pointer bg-stone-900 text-white p-8 border border-stone-900 relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg shadow-stone-200/50 hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
              <div className="relative z-10 flex justify-between items-start">
                <h2 className="text-4xl font-oswald font-black uppercase tracking-tight group-hover:text-stone-300 transition-colors">Nutrition</h2>
                <Apple className="text-stone-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <div className="relative z-10 mt-8 space-y-4">
                <p className="text-sm font-serif italic text-stone-400">Review your daily macros, meal targets, and supplementation guidance.</p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-200 group-hover:text-white transition-colors">
                  View Macros <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-white p-8 border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-2xl font-oswald font-bold uppercase tracking-tight text-stone-900">Training Calendar</h2>
                <p className="text-stone-400 text-sm font-mono uppercase tracking-widest mt-1">{currentMonth} {currentYear}</p>
              </div>
              <CalendarIcon className="text-stone-300" size={24} />
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] uppercase font-bold text-stone-400 tracking-widest pb-2">
                  {day}
                </div>
              ))}
              
              {paddingDays.map(padding => (
                <div key={`pad-${padding}`} className="w-full aspect-square bg-stone-50/50" />
              ))}
              
              {days.map(day => {
                const isToday = day === today.getDate();
                const isPast = day < today.getDate();
                const hasWorkout = day % 2 === 0; // Fake some workouts
                
                return (
                  <div 
                    key={day} 
                    className={cn(
                      "w-full aspect-square relative flex items-center justify-center border transition-all cursor-pointer group",
                      isToday ? "border-stone-900 bg-stone-50" : "border-stone-100 hover:border-stone-300",
                      isPast ? "opacity-50" : ""
                    )}
                  >
                    <span className={cn(
                      "font-mono text-sm md:text-base",
                      isToday ? "font-bold text-stone-900" : "text-stone-500"
                    )}>
                      {day}
                    </span>
                    
                    {hasWorkout && !isPast && (
                      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-stone-900" />
                    )}
                    {hasWorkout && isPast && (
                      <div className="absolute bottom-1 md:bottom-3 left-1/2 -translate-x-1/2">
                        <CheckCircle2 size={12} className="text-stone-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full bg-stone-900 text-white p-12 border border-stone-900 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
            <div className="relative z-10 flex flex-col justify-center items-center text-center min-h-[300px]">
              <h2 className="text-4xl font-oswald font-black uppercase tracking-tight mb-4 text-white">No Active Protocol</h2>
              <p className="text-stone-400 text-lg font-serif italic max-w-lg mx-auto mb-10">
                Complete your performance assessment to generate a hyper-personalized training and nutrition program.
              </p>
              <button 
                onClick={onGenerateProgram}
                className="bg-white text-stone-900 px-8 py-4 uppercase text-sm font-bold tracking-widest hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
              >
                Start Assessment <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
