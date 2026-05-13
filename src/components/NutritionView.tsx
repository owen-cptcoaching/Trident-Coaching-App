import React from 'react';
import { NutritionPlan } from '../types';
import { Coffee, Utensils, PieChart, Info, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NutritionViewProps {
  plan: NutritionPlan;
  isQuickView?: boolean;
  onEnterFullView?: () => void;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ plan, isQuickView = false, onEnterFullView }) => {
  return (
    <div className="space-y-20">
      <div className="max-w-3xl flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-6 mb-4">
            <span className="text-8xl font-display italic text-stone-200 leading-none">02</span>
            <h2 className="text-6xl font-display font-black uppercase tracking-tighter leading-none italic">
              Nutrition Plan
            </h2>
          </div>
          <p className="text-xl text-stone-500 font-serif italic mb-8 pl-24">
            {plan.title}
          </p>
        </div>
        
        {isQuickView && (
          <div className="flex bg-white p-1 rounded-sm border border-black shrink-0 md:mt-4 ml-24 md:ml-0 self-start">
            <button
               onClick={onEnterFullView}
               className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors"
            >
               View Macros
            </button>
          </div>
        )}
      </div>

      <div className="pl-24 max-w-3xl grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="border-t-4 border-stone-900 pt-6">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Energy Budget</p>
                <p className="text-4xl font-mono font-black">{plan.dailyCalories}<span className="text-sm font-sans ml-1 text-stone-300 italic uppercase">kcal</span></p>
            </div>
            {[
                { label: 'Protien', val: plan.macros.protein, color: 'border-stone-900' },
                { label: 'Carbs', val: plan.macros.carbs, color: 'border-stone-200' },
                { label: 'Fats', val: plan.macros.fat, color: 'border-stone-200' }
            ].map((macro) => (
                <div key={macro.label} className={cn("border-t-4 pt-6 transition-all", macro.color)}>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{macro.label}</p>
                    <p className="text-4xl font-mono font-black">{macro.val}<span className="text-sm font-sans ml-1 text-stone-300 italic uppercase">g</span></p>
                </div>
            ))}
        </div>

      {isQuickView && (
        <div className="pl-24 mt-8 flex flex-wrap gap-2">
          {plan?.meals?.map((meal, idx) => (
            <span key={idx} className="bg-stone-100 text-stone-600 px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-sm border border-stone-200">
              {meal.time} - {meal.name}
            </span>
          ))}
        </div>
      )}

      {!isQuickView && (
        <>
          <div className="space-y-12">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 border-b border-stone-100 pb-4">Scheduled Feedings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {plan?.meals?.map((meal, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative group"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-4xl font-display italic text-stone-100 italic">0{idx + 1}</span>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300 mb-1">{meal.time}</p>
                    <h3 className="text-2xl font-bold uppercase tracking-tighter text-stone-900 leading-tight">
                        {meal.name}
                    </h3>
                </div>
              </div>

              <div className="pl-12 space-y-4">
                  <ul className="space-y-2 mb-6 min-h-[100px]">
                      {meal.ingredients?.map((ing, i) => (
                          <li key={i} className="text-xs text-stone-500 font-serif italic border-b border-stone-50 pb-1">
                              {ing}
                          </li>
                      ))}
                  </ul>
                  
                  <div className="flex items-center justify-between border-t border-stone-200 pt-4">
                    <span className="text-xl font-mono font-bold">{meal.calories} <span className="text-[10px] font-sans">KCAL</span></span>
                    <div className="flex gap-3 text-[10px] font-mono font-bold text-stone-400">
                        <span>P:{meal.protein}</span>
                        <span>C:{meal.carbs}</span>
                        <span>F:{meal.fat}</span>
                    </div>
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-20 pt-12 border-t border-stone-200 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl font-display italic text-stone-200">03</span>
            <h3 className="text-2xl font-display font-black uppercase tracking-tight italic">Protocol Directives</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ul className="space-y-6">
                {plan?.recommendations?.map((rec, i) => (
                    <li key={i} className="flex gap-6 items-start">
                        <span className="text-xs font-black text-stone-200 uppercase tracking-widest mt-1">Ref_{i+1}</span>
                        <p className="text-stone-600 font-serif italic italic leading-relaxed text-sm">
                          "{rec}"
                        </p>
                    </li>
                ))}
            </ul>
            <div className="bg-stone-900 text-white p-10 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 text-stone-500">Hydration Coefficient</p>
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-7xl font-mono font-black italic">3.5</span>
                    <span className="text-xl font-serif italic opacity-50">Liters Daily</span>
                </div>
                <div className="w-full h-1 bg-stone-800">
                    <div className="w-4/5 h-full bg-white transition-all duration-1000"></div>
                </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};
