import React from 'react';
import { Calendar as CalendarIcon, ChevronRight, Activity, Apple, CheckCircle2, ClipboardList, Check, Award, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { ClientTask } from '../types';

interface ClientDashboardProps {
  hasProgram: boolean;
  onOpenTrainingPreview: () => void;
  onEnterTrainingFull: () => void;
  onOpenNutritionPreview: () => void;
  onEnterNutritionFull: () => void;
  onGenerateProgram: () => void;
  tasks: ClientTask[];
  currentClientEmail: string;
  onToggleTask: (taskId: string) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ 
  hasProgram, 
  onOpenTrainingPreview,
  onEnterTrainingFull,
  onOpenNutritionPreview,
  onEnterNutritionFull,
  onGenerateProgram,
  tasks = [],
  currentClientEmail,
  onToggleTask
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

  const clientEmailNormalized = currentClientEmail?.toLowerCase().trim();
  const myTasks = tasks.filter(task => {
    const taskClientNormalized = task.clientId?.toLowerCase().trim();
    if (clientEmailNormalized === "owen.cpt1@gmail.com") {
      return taskClientNormalized === "ronnie coleman" || taskClientNormalized === "owen.cpt1@gmail.com";
    }
    return taskClientNormalized === clientEmailNormalized || taskClientNormalized === "client" || taskClientNormalized === "john doe";
  });

  const completedCount = myTasks.filter(t => t.isCompleted).length;
  const totalCount = myTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-12">
      {hasProgram ? (
        <>
          <div className="w-full bg-white p-4 sm:p-8 border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-6 sm:mb-8 pb-4 border-b border-stone-100">
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
              
              {paddingDays?.map(padding => (
                <div key={`pad-${padding}`} className="w-full aspect-square bg-stone-50/50" />
              ))}
              
              {days?.map(day => {
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
                      "font-mono text-xs sm:text-sm md:text-base",
                      isToday ? "font-bold text-stone-900" : "text-stone-500"
                    )}>
                      {day}
                    </span>
                    
                    {hasWorkout && !isPast && (
                      <div className="absolute bottom-1 sm:bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-stone-900" />
                    )}
                    {hasWorkout && isPast && (
                      <div className="absolute bottom-0.5 sm:bottom-1 md:bottom-3 left-1/2 -translate-x-1/2">
                        <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-stone-900" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tasks & Habits Checklists */}
          <div className="w-full bg-white p-4 sm:p-8 border border-stone-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h2 className="text-2xl font-oswald font-bold uppercase tracking-tight text-stone-900 flex items-center gap-2">
                  <ClipboardList className="text-stone-900" size={22} />
                  Performance Tasks & Habits
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm font-mono uppercase tracking-widest mt-1">
                  Assigned Protocols for daily execution
                </p>
              </div>
              
              {totalCount > 0 && (
                <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-3 rounded-sm sm:self-start">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-1">Daily Completion</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-xl font-black text-stone-900">{completedCount}</span>
                      <span className="font-sans text-xs text-stone-400">/</span>
                      <span className="font-mono text-sm text-stone-500">{totalCount}</span>
                      <span className="font-mono text-xs ml-2 text-stone-400">({completionPercentage}%)</span>
                    </div>
                  </div>
                  {completionPercentage === 100 ? (
                    <Award className="text-stone-900 shrink-0" size={32} />
                  ) : (
                    <div className="w-8 h-8 rounded-full border-4 border-stone-100 border-t-stone-900 rotate-45 shrink-0 animate-[spin_6s_linear_infinite]" style={{ transform: `rotate(${(completionPercentage / 100) * 360}deg)` }} />
                  )}
                </div>
              )}
            </div>

            {totalCount > 0 && (
              <div className="w-full bg-stone-100 h-1.5 rounded-sm overflow-hidden">
                <div 
                  className="bg-stone-900 h-full transition-all duration-500 ease-out"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            )}

            {myTasks.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {myTasks.map((task) => {
                  const categoryColors: Record<string, string> = {
                    Nutrition: "border-stone-950 text-stone-950 bg-stone-50",
                    Hydration: "border-sky-300 text-sky-800 bg-sky-50/50",
                    Recovery: "border-teal-300 text-teal-800 bg-teal-50/50",
                    Training: "border-stone-900 text-stone-900 bg-stone-50/50"
                  };
                  
                  return (
                    <div 
                      key={task.id} 
                      className={cn(
                        "py-4 flex items-start gap-4 transition-all group hover:bg-stone-50/60 px-2 rounded-sm",
                        task.isCompleted ? "opacity-75" : ""
                      )}
                    >
                      <button 
                        onClick={() => onToggleTask(task.id)}
                        className={cn(
                          "w-5 h-5 mt-0.5 border flex items-center justify-center transition-all cursor-pointer select-none rounded-sm shrink-0",
                          task.isCompleted 
                            ? "bg-stone-900 border-stone-900 text-white" 
                            : "border-stone-300 hover:border-stone-900 bg-white"
                        )}
                        id={`task-check-${task.id}`}
                      >
                        {task.isCompleted && <Check size={12} strokeWidth={3} />}
                      </button>
                      
                      <div className="flex-grow space-y-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span 
                            className={cn(
                              "font-bold text-sm sm:text-base tracking-tight font-sans transition-all",
                              task.isCompleted ? "line-through text-stone-400 font-normal" : "text-stone-900"
                            )}
                          >
                            {task.title}
                          </span>
                          <span className={cn(
                            "text-[8px] sm:text-[9px] uppercase font-bold tracking-[0.1em] border px-2 py-0.5 rounded-sm font-mono shrink-0",
                            categoryColors[task.category] || "border-stone-200 text-stone-500"
                          )}>
                            {task.category}
                          </span>
                        </div>
                        {task.description && (
                          <p className={cn(
                            "text-xs font-serif italic text-stone-500 mt-1",
                            task.isCompleted ? "text-stone-400 line-through" : ""
                          )}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] text-stone-400 font-mono uppercase tracking-widest pt-1">
                          <span>Assigned by: {task.assignedBy || "Advisor"}</span>
                          {task.clientId === "Ronnie Coleman" && (
                            <>
                              <span>•</span>
                              <span className="text-stone-500 font-bold bg-stone-100 px-1 rounded-sm">Ronnie Coleman (Simulated Profile)</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-stone-200 bg-stone-50/50 rounded-sm">
                <ClipboardList className="mx-auto text-stone-300 mb-3" size={32} />
                <p className="text-stone-500 italic font-serif text-sm">No active tasks or habit protocols currently assigned.</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-mono mt-1">Your elite coach will assign habits upon review.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Training Box */}
            <div 
              onClick={onEnterTrainingFull}
              className="group cursor-pointer bg-stone-900 text-white p-8 border border-stone-900 relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg shadow-stone-200/50 hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
              <div className="relative z-10 flex justify-between items-start">
                <h2 className="text-4xl font-oswald font-black uppercase tracking-tight group-hover:text-stone-300 transition-colors">Training</h2>
                <Activity className="text-stone-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <div className="relative z-10 mt-8 space-y-4">
                <p className="text-sm font-serif italic text-stone-400">View your active training block, structured sessions, and track performance.</p>
                <div 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-200 hover:text-white transition-colors cursor-pointer"
                >
                  Enter Protocol <ChevronRight size={14} />
                </div>
              </div>
            </div>

            {/* Nutrition Box */}
            <div 
              onClick={onEnterNutritionFull}
              className="group cursor-pointer bg-stone-900 text-white p-8 border border-stone-900 relative overflow-hidden flex flex-col justify-between min-h-[240px] shadow-lg shadow-stone-200/50 hover:shadow-xl transition-all"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
              <div className="relative z-10 flex justify-between items-start">
                <h2 className="text-4xl font-oswald font-black uppercase tracking-tight group-hover:text-stone-300 transition-colors">Nutrition</h2>
                <Apple className="text-stone-500 group-hover:text-white transition-colors" size={28} />
              </div>
              <div className="relative z-10 mt-8 space-y-4">
                <p className="text-sm font-serif italic text-stone-400">Review your daily macros, meal targets, and supplementation guidance.</p>
                <div 
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-200 hover:text-white transition-colors cursor-pointer"
                >
                  View Meal Plan <ChevronRight size={14} />
                </div>
              </div>
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
