/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { UserStats, CoachingResponse } from './types';
import { generateCoachingPlan } from './services/geminiService';
import { StatsForm } from './components/StatsForm';
import { TrainingView } from './components/TrainingView';
import { NutritionView } from './components/NutritionView';
import { CoachDashboard } from './components/CoachDashboard';
import { ClientDashboard } from './components/ClientDashboard';
import { Activity, Apple, LayoutDashboard, ChevronRight, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { getStripe } from './lib/stripe';
import { supabase } from './lib/supabase';
import { AuthScreen } from './components/AuthScreen';
import { User } from '@supabase/supabase-js';

export default function App() {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [plan, setPlan] = React.useState<CoachingResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'assessment' | 'training' | 'nutrition'>('assessment');
  const [currentView, setCurrentView] = React.useState<'client' | 'coach-dashboard'>('client');

  const [isCoach, setIsCoach] = React.useState(true);
  const [isHeadCoach, setIsHeadCoach] = React.useState(false);

  const [user, setUser] = React.useState<User | null>(null);
  const [isInitializingAuth, setIsInitializingAuth] = React.useState(true);
  const [isInitializingProfile, setIsInitializingProfile] = React.useState(false);

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      setIsInitializingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) throw error;
        
        let isUserCoach = true; // Default to coach
        let isUserHeadCoach = false;
        if (data) {
          if (data.role === 'coach') {
            isUserCoach = true;
          } else if (data.role === 'head_coach') {
            isUserCoach = true;
            isUserHeadCoach = true;
          } else if (data.role === 'client') {
            isUserCoach = false;
          }
        }
        
        setIsCoach(isUserCoach);
        setIsHeadCoach(isUserHeadCoach);

        // Fetch stats and plan for everyone
        const { data: currentStats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (currentStats) {
          setStats({
            age: currentStats.age,
            weight: currentStats.weight,
            height: currentStats.height,
            gender: currentStats.gender as any,
            activityLevel: currentStats.activity_level as any,
            goal: currentStats.goal as any,
            accessCode: undefined, // no need to load this
          });
        }

        const { data: currentPlan } = await supabase
          .from('coaching_plans')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (currentPlan) {
          setPlan({
            trainingProgram: currentPlan.training_program,
            nutritionPlan: currentPlan.nutrition_plan
          });
          setActiveTab('assessment');
        } else {
          setActiveTab('assessment');
        }

        setCurrentView('client'); // Default to client view so they stay on the "assessment / start" page
      } catch (error) {
        console.error("Error fetching profile role:", error);
      } finally {
        setIsInitializingAuth(false);
        setIsInitializingProfile(false);
      }
    };

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setIsInitializingAuth(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id);
      } else {
        setStats(null);
        setPlan(null);
        setActiveTab('assessment');
      }
    });

    // Listen for popup messages
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        supabase.auth.getSession().then(({ data: { session } }) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            fetchUserProfile(currentUser.id);
          }
        });
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    // Check for Stripe checkout success
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      alert('Payment successful! You now have full access to Trident Coaching.');
    }
    if (query.get('canceled')) {
      alert('Payment canceled.');
    }
  }, []);

  const handleStatsSubmit = async (newStats: UserStats) => {
    if (newStats.accessCode !== '1234-5678') {
      alert('Invalid coach code. Please try again.');
      return;
    }
    setIsLoading(true);
    setStats(newStats);
    try {
      const generatedPlan = await generateCoachingPlan(newStats);
      
      if (user) {
        // Save stats
        await supabase.from('user_stats').insert({
          user_id: user.id,
          age: newStats.age,
          weight: newStats.weight,
          height: newStats.height,
          gender: newStats.gender,
          activity_level: newStats.activityLevel,
          goal: newStats.goal
        });

        // Save plan
        await supabase.from('coaching_plans').insert({
          user_id: user.id,
          training_program: generatedPlan.trainingProgram,
          nutrition_plan: generatedPlan.nutritionPlan
        });
      }

      setPlan(generatedPlan);
      setActiveTab('dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const session = await response.json();
      
      if (session.error) {
        throw new Error(session.error);
      }
      
      const stripe = await getStripe();
      if (stripe) {
        await (stripe as any).redirectToCheckout({ sessionId: session.id });
      }
    } catch (error: any) {
      alert("Failed to initiate checkout: " + error.message);
    } finally {
      setIsCheckingOut(false);
    }
  }

  const reset = () => {
    setStats(null);
    setPlan(null);
    setActiveTab('assessment');
  };

  if (isInitializingAuth || isInitializingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F8F6] font-sans">
        <p className="text-sm font-bold uppercase tracking-widest text-stone-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  if (currentView === 'coach-dashboard') {
    return (
      <CoachDashboard 
        isHeadCoach={isHeadCoach} 
        onExit={() => {
          setCurrentView('client');
          setActiveTab('assessment');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="px-6 md:px-12 pt-10 pb-6 border-b border-stone-200 flex flex-col md:flex-row justify-between items-baseline gap-6">
        <div 
          className={`flex flex-col ${activeTab === 'assessment' ? '' : 'cursor-pointer hover:opacity-70 transition-opacity'}`} 
          onClick={() => {
            if (activeTab !== 'assessment') {
              setActiveTab('assessment');
            }
          }}
        >
          <h1 className="text-6xl md:text-7xl font-logo tracking-tight font-normal text-stone-900 leading-none">Trident</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mt-2 font-oswald">Elite Performance Coaching</p>
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
          <p className="text-sm font-bold tracking-tight text-stone-800 italic uppercase font-oswald cursor-pointer hover:text-stone-500 transition-colors" onClick={() => {
            if (plan) {
              setActiveTab('dashboard');
            } else if (isCoach) {
              setCurrentView('coach-dashboard');
            }
          }}>
            {plan ? 'My Dashboard' : (isCoach ? 'Open Dashboard' : 'Program Start')}
          </p>
          <p className="text-xs font-display italic text-stone-400 font-oswald">Peak Intensity Block / 2026</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 lg:border-x lg:border-stone-100 min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          {activeTab === 'assessment' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              {plan ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-6 italic">
                      Welcome Back to <br />
                      <span className="text-stone-300 font-holigas">Trident</span>
                    </h1>
                    <p className="text-lg text-stone-500 font-serif italic max-w-xl mx-auto">
                      Your highly personalized elite physical performance program is active. 
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full max-w-md bg-stone-900 text-white py-6 font-bold uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all cursor-pointer font-oswald"
                  >
                    Open Program <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    {isCoach ? (
                      <>
                        <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-6 italic">
                          Welcome Back to <br />
                          <span className="text-stone-300 font-holigas">Trident</span>
                        </h1>
                        <p className="text-lg text-stone-500 font-serif italic max-w-xl mx-auto">
                          Access your coach dashboard to manage clients, programs, and performance data.
                        </p>
                      </>
                    ) : (
                      <>
                        <h1 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-8 italic">
                          Evolve Your <br />
                          <span className="text-stone-300 font-holigas">Physical Limits</span>
                        </h1>
                        <p className="text-xl text-stone-500 font-serif italic leading-relaxed">
                          Trident combines elite coaching expertise with advanced AI tools to deliver a training and nutrition system that adapts to your unique biology.
                        </p>
                      </>
                    )}
                  </div>

                  {isCoach ? (
                    <div className="flex flex-col items-center justify-center">
                      <button
                        onClick={() => setCurrentView('coach-dashboard')}
                        className="w-full max-w-md bg-stone-900 text-white py-6 font-bold uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all cursor-pointer font-oswald"
                      >
                        Open Dashboard <ArrowRight size={16} />
                      </button>
                    </div>
                  ) : (
                    <StatsForm onSubmit={handleStatsSubmit} isLoading={isLoading} />
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {plan && (
                <div className="flex items-center justify-between text-stone-400 pb-6 border-b border-stone-200 mb-12">
                  <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {[
                      { label: 'Weight', val: `${stats?.weight}lbs` },
                      stats?.goal ? { label: 'Goal', val: stats?.goal.replace('_', ' ') } : null,
                      stats?.activityLevel ? { label: 'Activity', val: stats?.activityLevel.replace('_', ' ') } : null
                    ].filter(Boolean).map((item: any) => (
                      <div key={item.label} className="flex items-baseline gap-2 shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                        <span className="font-mono text-sm text-stone-900 font-bold uppercase">{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="flex items-center gap-2 text-[10px] bg-stone-900 text-white px-4 py-2 font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
                    >
                      <Lock size={12} /> {isCheckingOut ? 'Loading...' : 'Add Ons'}
                    </button>
                  </div>
                </div>
              )}
              
              <ClientDashboard 
                hasProgram={!!plan}
                onOpenTraining={() => setActiveTab('training')}
                onOpenNutrition={() => setActiveTab('nutrition')}
                onGenerateProgram={() => setActiveTab('assessment')}
              />
            </motion.div>
          )}

          {(activeTab === 'training' || activeTab === 'nutrition') && plan && (
            <motion.div
              key="program-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* User Context Bar */}
              <div className="flex items-center justify-between text-stone-400 pb-6 border-b border-stone-200">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                  {[
                    { label: 'Weight', val: `${stats?.weight}lbs` },
                    stats?.goal ? { label: 'Goal', val: stats?.goal.replace('_', ' ') } : null,
                    stats?.activityLevel ? { label: 'Activity', val: stats?.activityLevel.replace('_', ' ') } : null
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="flex items-baseline gap-2 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                      <span className="font-mono text-sm text-stone-900 font-bold uppercase">{item.val}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('assessment')}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
                  >
                    Edit Profile <ChevronRight size={12} />
                  </button>
                  <button 
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="flex items-center gap-2 text-[10px] bg-stone-900 text-white px-4 py-2 font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
                  >
                    <Lock size={12} /> {isCheckingOut ? 'Loading...' : 'Add Ons'}
                  </button>
                </div>
              </div>

              {activeTab === 'training' ? (
                <TrainingView program={plan.trainingProgram} isCoach={isCoach} />
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
          <span 
            className="cursor-pointer hover:text-white transition-colors"
            onClick={() => {
              if (isCoach) {
                setIsCoach(false);
                setPlan({
                  trainingProgram: { blocks: [], warmup: [], cooldown: [] },
                  nutritionPlan: { dailyTargets: { calories: 2000, protein: 150, carbs: 200, fat: 60 }, meals: [], recommendations: [] }
                });
              } else if (plan) {
                reset();
              } else {
                setIsCoach(true);
              }
            }}
          >
            Role: {isCoach ? 'Coach' : (plan ? 'Recurring Client' : 'New Client')}
          </span>
          <span 
            className="cursor-pointer hover:text-white transition-colors"
            onClick={() => setIsHeadCoach(!isHeadCoach)}
          >
            Type: {isHeadCoach ? 'Head Coach' : 'Regular Coach'}
          </span>
          <span 
            className="cursor-pointer hover:text-white transition-colors underline"
            onClick={() => setCurrentView('coach-dashboard')}
          >
            Open Dashboard
          </span>
          <span 
            className="cursor-pointer hover:text-red-400 text-stone-500 transition-colors underline"
            onClick={() => supabase.auth.signOut()}
          >
            Sign Out
          </span>
        </div>
        <div className="text-[10px] italic font-serif flex gap-6">
          Designed for clarity. Driven by data.
        </div>
      </footer>
    </div>
  );
}
