import React, { useState } from 'react';
import { TrainingProgram, Exercise } from '../types';
import { Dumbbell, Clock, Info, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TrainingViewProps {
  program: TrainingProgram;
  isCoach?: boolean;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ program, isCoach = false }) => {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [layoutMode, setLayoutMode] = useState<'lifestyle' | 'powerlifting'>('lifestyle');

  const calculateTargetWeight = (setIndex: number) => {
    // Dynamic small range
    const bases = [45, 65, 95, 135, 185, 225];
    const base = bases[Math.min(setIndex, bases.length - 1)];
    return `${base}-${base + 20} lbs`;
  };

  return (
    <div className="space-y-20 relative">
      <div className="max-w-4xl flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-6 mb-4">
            <span className="text-8xl font-display italic text-stone-200 leading-none">01</span>
            <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none italic">
              Training Program
            </h2>
          </div>
          <p className="text-xl text-stone-500 font-serif italic mb-2 pl-6 md:pl-24">
            {program.title}
          </p>
          <p className="text-sm text-stone-400 font-light leading-relaxed pl-6 md:pl-24 max-w-xl">
            {program.description}
          </p>
        </div>

        <div className="flex bg-white p-1 rounded-sm border border-black shrink-0 md:mt-4 ml-6 md:ml-0 self-start">
          <button
            onClick={() => isCoach && setLayoutMode('lifestyle')}
            disabled={!isCoach && layoutMode !== 'lifestyle'}
            className={cn(
              "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
              layoutMode === 'lifestyle' ? "bg-black text-white" : "text-black hover:bg-stone-100",
              !isCoach && layoutMode !== 'lifestyle' && "opacity-30 cursor-not-allowed hover:bg-transparent",
              !isCoach && layoutMode === 'lifestyle' && "cursor-default hover:bg-black hover:text-white"
            )}
          >
            Lifestyle
          </button>
          <button
            onClick={() => isCoach && setLayoutMode('powerlifting')}
            disabled={!isCoach && layoutMode !== 'powerlifting'}
            className={cn(
              "px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
              layoutMode === 'powerlifting' ? "bg-black text-white" : "text-black hover:bg-stone-100",
              !isCoach && layoutMode !== 'powerlifting' && "opacity-30 cursor-not-allowed hover:bg-transparent",
              !isCoach && layoutMode === 'powerlifting' && "cursor-default hover:bg-black hover:text-white"
            )}
          >
            Powerlifting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-20">
        {program.schedule.map((day, dayIdx) => (
          <motion.div
            key={dayIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIdx * 0.1 }}
            className="group"
          >
            <div className="flex items-baseline gap-4 mb-8 border-b-4 border-stone-900 pb-2">
              <span className="text-sm font-black uppercase tracking-[0.3em] text-stone-400">Phase 0{dayIdx + 1}</span>
              <h3 className="text-4xl font-display font-black uppercase italic text-stone-900">
                {day.day}: <span className="text-stone-300">{day.focus}</span>
              </h3>
            </div>

            {layoutMode === 'powerlifting' ? (
              <div className="overflow-x-auto w-full border border-stone-300">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-stone-900 text-stone-100 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="p-4 border-r border-stone-700 w-12 text-center">#</th>
                      <th className="p-4 border-r border-stone-700">Movement</th>
                      <th className="p-4 border-r border-stone-700 text-center">Sets</th>
                      <th className="p-4 border-r border-stone-700 text-center">Reps</th>
                      <th className="p-4 border-r border-stone-700 text-center">Weight</th>
                      <th className="p-4 border-r border-stone-700 text-center">Target RPE</th>
                      <th className="p-4 text-center">Rest</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {day.exercises.length > 0 ? (
                      day.exercises.map((ex, exIdx) => (
                        <tr 
                          key={exIdx} 
                          className="border-b border-stone-200 hover:bg-stone-50 cursor-pointer transition-colors group"
                          onClick={() => setSelectedExercise(ex)}
                        >
                          <td className="p-4 border-r border-stone-200 text-stone-400 font-mono text-center font-bold">
                            {String.fromCharCode(65 + exIdx)}
                          </td>
                          <td className="p-4 border-r border-stone-200">
                            <div className="font-oswald font-bold uppercase text-stone-900 text-base">{ex.name}</div>
                            {ex.notes && <div className="text-[10px] text-stone-500 font-serif italic truncate max-w-xs">{ex.notes}</div>}
                          </td>
                          <td className="p-4 border-r border-stone-200 font-mono text-center font-bold text-stone-700">{ex.sets}</td>
                          <td className="p-4 border-r border-stone-200 font-mono text-center font-bold text-stone-700">{ex.reps}</td>
                          <td className="p-4 border-r border-stone-200 font-mono text-center font-bold text-stone-700 w-32 bg-stone-50/50 group-hover:bg-white transition-colors">
                            <input 
                              type="text" 
                              onClick={(e) => e.stopPropagation()}
                              placeholder={calculateTargetWeight(exIdx)}
                              className="w-full bg-transparent border-b border-dashed border-stone-300 px-1 py-1 text-center font-mono focus:border-stone-900 outline-none transition-all placeholder:text-stone-300"
                            />
                          </td>
                          <td className="p-4 border-r border-stone-200 font-mono text-center text-sm font-bold text-stone-400">
                            {7 + (exIdx % 3)}.5
                          </td>
                          <td className="p-4 font-mono text-center text-stone-500 text-xs">{ex.rest || "Auto"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[10px] font-bold uppercase tracking-[0.4em] text-stone-300 bg-stone-50">
                          Active Recovery / Deload
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {day.exercises.length > 0 ? (
                  day.exercises.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      onClick={() => setSelectedExercise(ex)}
                      className="flex items-baseline border-b border-stone-200 pb-4 transition-all hover:bg-stone-50 px-2 cursor-pointer group/ex"
                    >
                      <span className="w-12 text-xs font-black text-stone-300 uppercase tracking-widest group-hover/ex:text-stone-900 transition-colors">{String.fromCharCode(65 + exIdx)}1</span>
                      <div className="flex-1">
                        <h4 className="text-lg font-oswald font-bold uppercase tracking-tight text-stone-900">{ex.name}</h4>
                        <p className="text-xs text-stone-400 font-serif italic line-clamp-1">
                          {ex.notes || "Control the eccentric movement"} {ex.rest ? `/ Rest: ${ex.rest}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-mono font-medium group-hover/ex:text-stone-600 transition-colors">
                          {ex.sets} x {ex.reps}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-12 text-center border border-stone-200 bg-stone-50 border-dashed">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-300 italic">Central Nervous System Recovery</p>
                  </div>
                )}
              </div>
            )}
            
            {day.exercises.length > 0 && (
              <div className="bg-stone-100 p-8 mt-12 border-l-8 border-stone-900 max-w-2xl">
                <p className="text-[10px] uppercase tracking-widest font-black mb-3 text-stone-400">Coach's Daily Instruction</p>
                <p className="text-lg font-serif italic text-stone-700 leading-relaxed">
                  "Maintain intensity levels at RPE 8. Ensure full hydration before and after session. Focus on the compound movements first."
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedExercise && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 transition-opacity"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto border-l border-stone-200 flex flex-col"
            >
              <div className="p-8 border-b border-stone-100 flex items-start justify-between bg-stone-50 sticky top-0 z-10">
                <div>
                  <h3 className="text-3xl font-oswald font-black uppercase tracking-tight text-stone-900 mb-2">
                    {selectedExercise.name}
                  </h3>
                  <div className="flex gap-4 text-xs font-mono text-stone-500 uppercase font-bold">
                    <span>{selectedExercise.sets} Sets</span>
                    <span>&times;</span>
                    <span>{selectedExercise.reps} Reps</span>
                    {selectedExercise.rest && (
                      <>
                        <span>&times;</span>
                        <span>{selectedExercise.rest} Rest</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-400 hover:text-stone-900"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 flex-1">
                {selectedExercise.notes && (
                  <div className="mb-8 p-4 bg-stone-50 border border-stone-100 text-sm font-serif italic text-stone-600">
                    "{selectedExercise.notes}"
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-stone-100 pb-2">
                    Execution Log
                  </h4>
                  
                  {Array.from({ length: selectedExercise.sets }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-2 p-4 border border-stone-200 bg-white shadow-sm group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-oswald font-bold uppercase text-stone-900 tracking-wider">Set {i + 1}</span>
                        <span className="text-xs font-mono text-stone-400 font-bold bg-stone-100 px-2 py-1 rounded-sm">Target: {calculateTargetWeight(i)}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Weight</label>
                          <input 
                            type="text" 
                            placeholder="lbs"
                            className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-sm font-mono focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">Reps</label>
                          <input 
                            type="number" 
                            placeholder={selectedExercise.reps.replace(/[^0-9]/g, '') || '0'}
                            className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-sm font-mono focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">RPE</label>
                          <input 
                            type="number" 
                            placeholder="1-10"
                            min="1"
                            max="10"
                            className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-sm font-mono focus:border-stone-900 focus:ring-1 focus:ring-stone-900 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-8 border-t border-stone-100 bg-stone-50 sticky bottom-0">
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-oswald font-bold tracking-widest uppercase py-4 transition-colors"
                >
                  Save & Close Set
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

