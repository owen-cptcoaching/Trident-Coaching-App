import React from 'react';
import { Calendar as CalendarIcon, ChevronRight, Activity, Apple, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ClientDashboardProps {
  hasProgram: boolean;
  onOpenProgram: () => void;
  onGenerateProgram: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  hasProgram, 
  onOpenProgram,
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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar Section */}
        <div className="w-full md:w-2/3 bg-white p-8 border border-stone-200">
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
              <div key={`pad-${padding}`} className="aspect-square bg-stone-50/50" />
            ))}
            
            {days.map(day => {
              const isToday = day === today.getDate();
              const isPast = day < today.getDate();
              const hasWorkout = day % 2 === 0; // Fake some workouts
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "aspect-square relative flex items-center justify-center border transition-all cursor-pointer group",
                    isToday ? "border-stone-900 bg-stone-50" : "border-stone-100 hover:border-stone-300",
                    isPast ? "opacity-50" : ""
                  )}
                >
                  <span className={cn(
                    "font-mono text-sm",
                    isToday ? "font-bold text-stone-900" : "text-stone-500"
                  )}>
                    {day}
                  </span>
                  
                  {hasWorkout && !isPast && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-stone-900" />
                  )}
                  {hasWorkout && isPast && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                      <CheckCircle2 size={10} className="text-stone-900" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Program Preview Section */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-stone-900 text-white p-8 relative overflow-hidden group border border-stone-900">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
            
            <div className="relative z-10 flex flex-col h-full min-h-[300px]">
              <div className="mb-auto">
                <h2 className="text-3xl font-oswald font-black uppercase tracking-tight mb-2">Program</h2>
                <div className="flex gap-4 text-stone-400 font-mono text-[10px] tracking-widest uppercase">
                  <span className="flex items-center gap-1"><Activity size={10} /> Training</span>
                  <span className="flex items-center gap-1"><Apple size={10} /> Nutrition</span>
                </div>
              </div>
              
              <div className="mt-8">
                {hasProgram ? (
                  <div className="space-y-6">
                    <p className="text-stone-400 text-sm font-serif italic">
                      Your personalized elite performance protocol is active.
                    </p>
                    <button 
                      onClick={onOpenProgram}
                      className="w-full bg-white text-stone-900 py-3 uppercase text-xs font-bold tracking-widest hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                    >
                      Enter Protocol <ChevronRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-stone-400 text-sm font-serif italic">
                      Complete your assessment to generate your personalized program.
                    </p>
                    <button 
                      onClick={onGenerateProgram}
                      className="w-full bg-white text-stone-900 py-3 uppercase text-xs font-bold tracking-widest hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                    >
                      Start Assessment <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {hasProgram && (
            <div className="bg-white p-6 border border-stone-200">
              <h3 className="font-oswald font-bold uppercase text-stone-900 mb-4 tracking-tight">Today's Protocol</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-stone-100">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Training</span>
                  <span className="text-sm font-oswald font-bold text-stone-900">Hypertrophy Block</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Macros</span>
                  <span className="text-sm font-oswald font-bold text-stone-900">High Carb</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
