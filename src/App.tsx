/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { UserStats, CoachingResponse } from "./types";
import { generateCoachingPlan } from "./services/geminiService";
import { StatsForm } from "./components/StatsForm";
import { TrainingView } from "./components/TrainingView";
import { NutritionView } from "./components/NutritionView";
import { CoachDashboard } from "./components/CoachDashboard";
import { ClientDashboard } from "./components/ClientDashboard";
import {
  Activity,
  Apple,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { getStripe } from "./lib/stripe";
import { supabase } from "./lib/supabase";
import { AuthScreen } from "./components/AuthScreen";
import { User } from "@supabase/supabase-js";

export default function App() {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [plan, setPlan] = React.useState<CoachingResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    "dashboard" | "assessment" | "training" | "nutrition" | "no-code" | "coach-match"
  >("assessment");
  const [currentView, setCurrentView] = React.useState<
    "client" | "coach-dashboard"
  >("client");
  const [isQuickView, setIsQuickView] = React.useState(false);

  const [isCoach, setIsCoach] = React.useState(false);
  const [isHeadCoach, setIsHeadCoach] = React.useState(false);

  const [user, setUser] = React.useState<User | null>(null);
  const [isInitializingAuth, setIsInitializingAuth] = React.useState(true);
  const [isInitializingProfile, setIsInitializingProfile] =
    React.useState(false);

  useEffect(() => {
    const fetchUserProfile = async (userId: string, email?: string) => {
      setIsInitializingProfile(true);
      let isUserCoach = false;
      try {
        const normalizedEmail = email?.toLowerCase().trim();
        isUserCoach = normalizedEmail === "owen.cpt1@gmail.com";
        let isUserHeadCoach = normalizedEmail === "owen.cpt1@gmail.com";

        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", userId)
            .maybeSingle();

          if (!error && data) {
            if (data.role === "coach") {
              isUserCoach = true;
            } else if (data.role === "head_coach") {
              isUserCoach = true;
              isUserHeadCoach = true;
            } else if (data.role === "client" && normalizedEmail !== "owen.cpt1@gmail.com") {
              isUserCoach = false;
            }
          }
        } catch (dbError) {
          console.error("Supabase profile fetch error:", dbError);
        }

        console.log("User email:", email, "isCoach:", isUserCoach);

        setIsCoach(isUserCoach);
        setIsHeadCoach(isUserHeadCoach);

        // Fetch stats and plan for everyone
        const { data: currentStats } = await supabase
          .from("user_stats")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
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
          .from("coaching_plans")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (currentPlan) {
          // Normalize nutrition plan data for backward compatibility
          const nPlan = currentPlan.nutrition_plan;
          const normalizedNutritionPlan = {
            ...nPlan,
            title: nPlan.title || "Nutrition Plan",
            dailyCalories:
              nPlan.dailyCalories || nPlan.dailyTargets?.calories || 2000,
            macros: nPlan.macros || {
              protein: nPlan.dailyTargets?.protein || 0,
              carbs: nPlan.dailyTargets?.carbs || 0,
              fat: nPlan.dailyTargets?.fat || 0,
            },
          };

          setPlan({
            trainingProgram: currentPlan.training_program,
            nutritionPlan: normalizedNutritionPlan,
          });
          setActiveTab("assessment");
        } else {
          setActiveTab("assessment");
        }

      } catch (error) {
        console.error("Error fetching profile role:", error);
      } finally {
        setIsInitializingAuth(false);
        setIsInitializingProfile(false);
        setCurrentView("client");
      }
    };

    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
        // If there's an error like invalid refresh token, clear out the session
        supabase.auth.signOut();
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id, currentUser.email);
      } else {
        setIsInitializingAuth(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.id, currentUser.email);
      } else {
        setStats(null);
        setPlan(null);
        setActiveTab("assessment");
      }
    });

    // Listen for popup messages
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        supabase.auth.getSession().then(({ data: { session }, error }) => {
          if (error) {
            console.error("Error getting session from popup:", error);
            supabase.auth.signOut();
          }
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            fetchUserProfile(currentUser.id, currentUser.email);
          }
        });
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    // Check for Stripe checkout success
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      alert(
        "Payment successful! You now have full access to Trident Coaching.",
      );
    }
    if (query.get("canceled")) {
      alert("Payment canceled.");
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const handleStatsSubmit = async (newStats: UserStats) => {
    if (newStats.accessCode !== "1234-5678") {
      alert("Invalid coach code. Please try again.");
      return;
    }
    setIsLoading(true);
    setStats(newStats);
    try {
      const generatedPlan = await generateCoachingPlan(newStats);

      if (user) {
        // Save stats
        await supabase.from("user_stats").insert({
          user_id: user.id,
          age: newStats.age,
          weight: newStats.weight,
          height: newStats.height,
          gender: newStats.gender,
          activity_level: newStats.activityLevel,
          goal: newStats.goal,
        });

        // Save plan
        await supabase.from("coaching_plans").insert({
          user_id: user.id,
          training_program: generatedPlan.trainingProgram,
          nutrition_plan: generatedPlan.nutritionPlan,
        });
      }

      setPlan(generatedPlan);
      setActiveTab("dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to generate plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  };

  const reset = () => {
    setStats(null);
    setPlan(null);
    setActiveTab("assessment");
  };

  if (isInitializingAuth || isInitializingProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F9F8F6] font-sans">
        <p className="text-sm font-bold uppercase tracking-widest text-stone-500">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={() => {}} />;
  }

  if (currentView === "coach-dashboard") {
    return (
      <CoachDashboard
        isHeadCoach={isHeadCoach}
        onExit={() => {
          setCurrentView("client");
          setActiveTab("assessment");
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Header */}
      <header className="px-6 md:px-12 pt-10 pb-6 border-b border-stone-200 flex flex-col md:flex-row justify-between items-baseline gap-6">
        <div
          className={`flex flex-col ${activeTab === "assessment" ? "" : "cursor-pointer hover:opacity-70 transition-opacity"}`}
          onClick={() => {
            if (activeTab !== "assessment") {
              setActiveTab("assessment");
            }
          }}
        >
          <h1 className="text-6xl md:text-7xl font-logo tracking-tight font-normal text-stone-900 leading-none">
            Trident
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mt-2 font-oswald">
            Elite Performance Coaching
          </p>
        </div>

        <div className="flex flex-col items-end justify-end gap-3 text-right">
          {!isQuickView &&
          (activeTab === "training" ||
            activeTab === "nutrition") ? null : plan &&
            activeTab !== "assessment" ? (
            <>
              <div className="flex flex-col items-start gap-1 w-full pl-1 text-left">
                {!isCoach && (
                  <p
                    className="text-sm font-bold tracking-tight text-stone-800 italic uppercase font-oswald cursor-pointer hover:text-stone-500 transition-colors leading-none"
                    onClick={() => {
                      setActiveTab("dashboard");
                    }}
                  >
                    My Dashboard
                  </p>
                )}
                <p className="text-[10px] font-display italic text-stone-400 font-oswald uppercase tracking-widest leading-none mt-1">
                  Peak Intensity Block / 2026
                </p>
              </div>
              <nav className="flex items-center gap-1 bg-stone-100 p-1 rounded-sm border border-stone-200 mt-1">
                <button
                  onClick={() => {
                    setActiveTab("training");
                    setIsQuickView(true);
                    window.scrollTo(0, 0);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === "training"
                      ? "bg-stone-900 text-white"
                      : "text-stone-400 hover:text-stone-900",
                  )}
                >
                  <Activity size={12} /> Training
                </button>
                <button
                  onClick={() => {
                    setActiveTab("nutrition");
                    setIsQuickView(true);
                    window.scrollTo(0, 0);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === "nutrition"
                      ? "bg-stone-900 text-white"
                      : "text-stone-400 hover:text-stone-900",
                  )}
                >
                  <Apple size={12} /> Nutrition
                </button>
              </nav>
            </>
          ) : (
            <div className="text-right flex flex-col items-end">
              <p className="text-[10px] font-display italic text-stone-400 font-oswald uppercase tracking-widest">
                Peak Intensity Block / 2026
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 lg:border-x lg:border-stone-100 min-h-[calc(100vh-200px)]">
        <AnimatePresence mode="wait">
          {activeTab === "assessment" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              {(plan || isCoach) ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-6 italic">
                      Welcome Back to <br />
                      <span className="text-stone-300 font-holigas">
                        Trident
                      </span>
                    </h1>
                    <p className="text-lg text-stone-500 font-serif italic max-w-xl mx-auto">
                      {isCoach 
                        ? "Your coaching portal is ready." 
                        : "Your highly personalized elite physical performance program is active."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isCoach) {
                        setCurrentView("coach-dashboard");
                      } else {
                        setActiveTab("dashboard");
                      }
                    }}
                    className="w-full max-w-md bg-stone-900 text-white py-6 font-bold uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all cursor-pointer font-oswald"
                  >
                    Open {isCoach ? "Dashboard" : "Program"} <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-7xl md:text-9xl font-display font-black uppercase tracking-tighter leading-[0.85] mb-8 italic">
                      Elevate Your <br />
                      <span className="text-stone-300 font-holigas">
                        Physical Limits
                      </span>
                    </h1>
                    <p className="text-xl text-stone-500 font-serif italic leading-relaxed">
                      Trident combines elite coaching expertise with
                      advanced AI tools to deliver a training and nutrition
                      system that adapts to your unique biology.
                    </p>
                  </div>

                  <StatsForm
                    onSubmit={handleStatsSubmit}
                    isLoading={isLoading}
                    onNoCodeClick={() => setActiveTab("no-code")}
                  />
                </>
              )}
            </motion.div>
          )}

          {activeTab === "no-code" && (
            <motion.div
              key="no-code"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-2xl mx-auto text-center space-y-12 py-12"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-oswald text-stone-900 border-b-2 border-stone-900 inline-block pb-2 mb-4">
                  Connect with a Coach
                </h1>
                <p className="text-lg text-stone-500 font-serif italic max-w-xl mx-auto">
                  Get matched with an expert coach for personalized programming, or purchase a standalone plan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                  onClick={() => setActiveTab("coach-match")}
                  className="border border-stone-200 p-8 flex flex-col items-center justify-center space-y-4 bg-white hover:border-stone-400 transition-colors cursor-pointer group"
                >
                  <h3 className="text-xl font-bold uppercase tracking-tight font-oswald">Connect with a Coach</h3>
                  <p className="text-sm text-stone-500 font-serif italic">Match with a real coach for 1:1 guidance.</p>
                  <ArrowRight size={20} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                </div>
                
                <div className="border border-stone-200 p-8 flex flex-col items-center justify-center space-y-4 bg-white hover:border-stone-400 transition-colors cursor-pointer group">
                  <h3 className="text-xl font-bold uppercase tracking-tight font-oswald">12 Week Plan</h3>
                  <p className="text-sm text-stone-500 font-serif italic">Standalone program to build a foundation.</p>
                  <ArrowRight size={20} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                </div>

                <div className="border border-stone-200 p-8 flex flex-col items-center justify-center space-y-4 bg-white hover:border-stone-400 transition-colors cursor-pointer group">
                  <h3 className="text-xl font-bold uppercase tracking-tight font-oswald">16 Week Plan</h3>
                  <p className="text-sm text-stone-500 font-serif italic">Extended program for serious results.</p>
                  <ArrowRight size={20} className="text-stone-300 group-hover:text-stone-900 transition-colors" />
                </div>
              </div>
              
              <button 
                onClick={() => setActiveTab("assessment")}
                className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors tracking-widest uppercase font-bold font-oswald underline pt-8"
              >
                Back to Access Code
              </button>
            </motion.div>
          )}

          {activeTab === "coach-match" && (
            <motion.div
              key="coach-match"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-4xl mx-auto space-y-12 py-12"
            >
              <div className="space-y-4 text-center">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight font-oswald text-stone-900 border-b-2 border-stone-900 inline-block pb-2 mb-4">
                  Find Your Coach
                </h1>
                <p className="text-lg text-stone-500 font-serif italic max-w-xl mx-auto">
                  Review our coaches and reach out to see if they're a good fit for your goals.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-white border border-stone-200 p-8 flex flex-col hover:border-stone-400 transition-colors">
                  <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-6">
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-tight font-oswald text-stone-900">Owen</h3>
                      <p className="text-stone-500 font-serif italic mt-1 text-sm">Head Coach</p>
                    </div>
                    <span className="bg-stone-100 px-3 py-1 text-[10px] uppercase tracking-widest font-bold text-stone-900">
                      Accepting Clients
                    </span>
                  </div>
                  
                  <div className="space-y-6 mb-8 flex-grow">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2 font-oswald">Specialties</h4>
                      <p className="text-sm font-bold text-stone-800">Strength, Hypertrophy, Body Recomposition</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2 font-oswald">Bio</h4>
                      <p className="text-sm text-stone-600 leading-relaxed font-serif italic">
                        "Dedicated to helping you build strength and muscle through proven, science-based programming and personalized nutrition guidance. Let's get to work."
                      </p>
                    </div>
                  </div>

                  <a 
                    href="mailto:owen.cpt1@gmail.com?subject=Coaching Inquiry from Trident App"
                    className="w-full bg-stone-900 text-white p-4 text-xs font-bold uppercase tracking-widest font-oswald hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                  >
                    Email Coach <ArrowRight size={14} />
                  </a>
                </div>
              </div>
              
              <div className="text-center pt-8">
                <button 
                  onClick={() => setActiveTab("no-code")}
                  className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors tracking-widest uppercase font-bold font-oswald underline"
                >
                  Back to Options
                </button>
              </div>
            </motion.div>
          )}

          {(activeTab === "dashboard" ||
            activeTab === "training" ||
            activeTab === "nutrition") && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {plan && (
                <div className="flex items-start justify-between text-stone-400 pb-6 border-b border-stone-200 mb-12">
                  <div className="flex flex-col items-start gap-2 overflow-x-auto no-scrollbar">
                    {[
                      {
                        label: "Height",
                        val: stats?.height ? `${stats.height}in` : "",
                      },
                      {
                        label: "Weight",
                        val: stats?.weight ? `${stats.weight}lbs` : "",
                      },
                      { label: "Tier", val: "1" },
                    ]
                      .filter(Boolean)
                      .map((item: any) => (
                        <div
                          key={item.label}
                          className="flex items-baseline gap-2 shrink-0"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {item.label}
                          </span>
                          {item.val ? (
                            <span className="font-mono text-sm text-stone-900 font-bold uppercase">
                              {item.val}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    <button
                      onClick={() => setActiveTab("assessment")}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:text-stone-900 transition-colors shrink-0"
                    >
                      Edit Profile <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="flex gap-4 shrink-0 items-center">
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="flex items-center gap-2 text-[10px] bg-stone-900 text-white px-4 py-2 font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors disabled:opacity-50"
                    >
                      <Lock size={12} />{" "}
                      {isCheckingOut ? "Loading..." : "Add Ons"}
                    </button>
                  </div>
                </div>
              )}

              <ClientDashboard
                hasProgram={!!plan}
                onOpenTraining={() => {
                  setActiveTab("training");
                  setIsQuickView(false);
                  window.scrollTo(0, 0);
                }}
                onOpenNutrition={() => {
                  setActiveTab("nutrition");
                  setIsQuickView(false);
                  window.scrollTo(0, 0);
                }}
                onGenerateProgram={() => {
                  setActiveTab("assessment");
                  window.scrollTo(0, 0);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(activeTab === "training" || activeTab === "nutrition") && plan && (
            <motion.div
              key={`modal-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setActiveTab("dashboard")}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#F9F8F6] w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl rounded-sm p-6 sm:p-10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-200">
                  <h2 className="text-2xl font-oswald font-black uppercase tracking-tight">
                    {activeTab === "training"
                      ? "Training Protocol"
                      : "Nutrition Plan"}
                  </h2>
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className="text-stone-400 hover:text-stone-900 transition-colors bg-white p-2 border border-stone-200 rounded-sm"
                  >
                    <X size={20} />
                  </button>
                </div>

                {activeTab === "training" ? (
                  <TrainingView
                    program={plan.trainingProgram}
                    isCoach={isCoach}
                    isQuickView={isQuickView}
                    onEnterFullView={() => {
                      setIsQuickView(false);
                    }}
                  />
                ) : (
                  <NutritionView
                    plan={plan.nutritionPlan}
                    isQuickView={isQuickView}
                    onEnterFullView={() => {
                      setIsQuickView(false);
                    }}
                  />
                )}
              </motion.div>
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
              setIsCoach(!isCoach);
              if (!isCoach) setCurrentView("coach-dashboard");
            }}
          >
            Role: {isCoach ? "Coach" : plan ? "Recurring Client" : "New Client"}
          </span>
          {isCoach && (
            <span 
              className="cursor-pointer hover:text-white transition-colors"
              onClick={() => setIsHeadCoach(!isHeadCoach)}
            >
              Type: {isHeadCoach ? "Head Coach" : "Regular Coach"}
            </span>
          )}
          {isCoach && (
            <span
              className="cursor-pointer hover:text-white transition-colors underline"
              onClick={() => setCurrentView("coach-dashboard")}
            >
              Open Dashboard
            </span>
          )}
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
