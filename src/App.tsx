/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserStats, CoachingResponse } from './types';
import { generateCoachingPlan } from './services/geminiService';
import { StatsForm } from './components/StatsForm';
import { TrainingView } from './components/TrainingView';
import { NutritionView } from './components/NutritionView';
import { Activity, Apple, LayoutDashboard, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [plan, setPlan] = React.useState<CoachingResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'training' | 'nutrition'>('training');

  const handleStatsSubmit = async (newStats: UserStats) => {
    setIsLoading(true);
    setStats(newStats);
    try {
      const generatedPlan = await generateCoachingPlan(newStats);
      setPlan(generatedPlan);
    } catch (error) {
      console.error(error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStats(null);
    setPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="px-6 md:px-12 pt-10 pb-6 border-b border-stone-200 flex flex-col md:flex-row justify-between items-baseline gap-6">
        <div className="flex flex-col cursor-pointer" onClick={reset}>
          <h1 className="text-6xl md:text-7xl font-logo tracking-tight font-normal text-stone-900 leading-none">Trident</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mt-2 font-oswald">Elite Performance Coaching / v1.0.4</p>
        </div>

        {plan && (
          <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-sm border border-stone-200">
            <button
              onClick={() => setActiveTab('training')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'training' ? "bg-stone-900 text-white" : "text-stone-400 hover:text-stone-900"
              )}
            >
              <Activity size={12} /> Training
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'nutrition' ? "bg-stone-900 text-white" : "text-stone-400 hover:text-stone-900"
              )}
            >
              <Apple size={12} /> Nutrition
            </button>
          </nav>
        )}

        <div className="text-right flex flex-col items-end">
          <p className="text-sm font-bold tracking-tight text-stone-800 italic uppercase font-oswald">Station: North Alpha</p>
          <p className="text-xs font-display italic text-stone-400 font-oswald">Peak Intensity Block / 2026</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 lg:border-x lg:border-stone-100 min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          {!plan ? (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <div className="text-center max-w-3xl mx-auto mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-4 py-1.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold font-holigas uppercase tracking-widest mb-6"
                >
                  AI-Powered Precision Coaching
                </motion.div>
                <h1 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-8 italic">
                  Evolve Your <br />
                  <span className="text-stone-300 font-holigas">Physical Limit</span>
                </h1>
                <p className="text-xl text-stone-500 font-serif italic leading-relaxed">
                  Trident combines advanced AI with elite coaching principles to deliver a training and nutrition system that adapts to your unique biology.
                </p>
              </div>

              <StatsForm onSubmit={handleStatsSubmit} isLoading={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* User Context Bar */}
              <div className="flex items-center justify-between text-stone-400 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                  {[
                    { label: 'Weight', val: `${stats?.weight}kg` },
                    { label: 'Goal', val: stats?.goal.replace('_', ' ') },
                    { label: 'Activity', val: stats?.activityLevel.replace('_', ' ') }
                  ].map((item) => (
                    <div key={item.label} className="flex items-baseline gap-2 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                      <span className="font-mono text-sm text-stone-900 font-bold uppercase">{item.val}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
                >
                  Edit Profile <ChevronRight size={12} />
                </button>
              </div>

              {activeTab === 'training' ? (
                <TrainingView program={plan.trainingProgram} />
              ) : (
                <NutritionView plan={plan.nutritionPlan} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-14 bg-stone-900 text-stone-400 flex items-center px-12 justify-between">
        <div className="flex gap-8 text-[10px] uppercase tracking-widest font-bold">
          <span>Status: Active</span>
          <span>Check-in: Friday 08:00</span>
          <span>Station: LAB-ALPHA</span>
        </div>
        <div className="text-[10px] italic font-serif">
          Designed for clarity. Driven by data.
        </div>
      </footer>
    </div>
  );
}
