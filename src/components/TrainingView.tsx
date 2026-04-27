import React from 'react';
import { TrainingProgram } from '../types';
import { Dumbbell, Clock, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface TrainingViewProps {
  program: TrainingProgram;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ program }) => {
  return (
    <div className="space-y-20">
      <div className="max-w-3xl">
        <div className="flex items-center gap-6 mb-4">
          <span className="text-8xl font-display italic text-stone-200 leading-none">01</span>
          <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none italic">
            Training Program
          </h2>
        </div>
        <p className="text-xl text-stone-500 font-serif italic mb-2 pl-24">
          {program.title}
        </p>
        <p className="text-sm text-stone-400 font-light leading-relaxed pl-24">
          {program.description}
        </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {day.exercises.length > 0 ? (
                day.exercises.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className="flex items-baseline border-b border-stone-200 pb-4 transition-all hover:bg-stone-50 px-2"
                  >
                    <span className="w-12 text-xs font-black text-stone-300 uppercase tracking-widest">{String.fromCharCode(65 + exIdx)}1</span>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold uppercase tracking-tight text-stone-900">{ex.name}</h4>
                      <p className="text-xs text-stone-400 font-serif italic">
                        {ex.notes || "Control the eccentric movement"} {ex.rest ? `/ Rest: ${ex.rest}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-mono font-medium">
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
    </div>
  );
};
