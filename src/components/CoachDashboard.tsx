import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Settings, Activity, ArrowRight, ChevronDown, Dumbbell, BookOpen, X, Plus, ClipboardList, Trash2, CheckCircle, AlertCircle, Check } from 'lucide-react';
import { ClientTask } from '../types';
import { cn } from '../lib/utils';

interface CoachDashboardProps {
  isHeadCoach: boolean;
  onExit: () => void;
  tasks: ClientTask[];
  onAddTask: (task: Omit<ClientTask, 'id' | 'createdAt'>) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ 
  isHeadCoach, 
  onExit,
  tasks = [],
  onAddTask,
  onToggleTask,
  onDeleteTask
}) => {
  const [activeTab, setActiveTab ] = useState<'clients' | 'all-clients' | 'coaches' | 'settings' | 'workout-library' | 'program-library' | 'add-client'>('clients');
  const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'yearly' | 'all-time'>('monthly');
  const [isRevenueExpanded, setIsRevenueExpanded] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [selectedCoachForClients, setSelectedCoachForClients] = useState<any>(null);
  const [selectedClientForTasks, setSelectedClientForTasks] = useState<any>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<'Nutrition' | 'Hydration' | 'Recovery' | 'Training'>('Nutrition');
  const [taskErrorMessage, setTaskErrorMessage] = useState('');

  // Placeholder data
  const clients = [
    { id: 1, name: 'John Doe', status: 'Active', phase: 'Hypertrophy', coach: 'Mike Mentzer' },
    { id: 2, name: 'Sarah Connor', status: 'Onboarding', phase: 'Strength', coach: 'Mike Mentzer' },
    { id: 3, name: 'David Goggins', status: 'Active', phase: 'Power', coach: 'Tom Platz' },
    { id: 4, name: 'Ronnie Coleman', status: 'Active', phase: 'Hypertrophy', coach: 'Head Coach' },
  ];

  const coaches = [
    { id: 1, name: 'Mike Mentzer', activeClients: 12, specialization: 'Hypertrophy' },
    { id: 2, name: 'Tom Platz', activeClients: 8, specialization: 'Legs / Strength' },
  ];

  const revenueData = {
    monthly: 12500,
    yearly: 150000,
    'all-time': 350000
  };

  const displayedClients = activeTab === 'all-clients' ? clients : clients.filter(c => c.coach === 'Head Coach');

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      <header className="px-6 md:px-12 pt-10 pb-6 border-b border-stone-200 flex flex-col md:flex-row justify-between items-baseline gap-6 bg-white">
        <div 
          className="flex flex-col cursor-pointer hover:opacity-70 transition-opacity"
          onClick={onExit}
        >
          <h1 className="text-6xl md:text-7xl font-logo tracking-tight font-normal text-stone-900 leading-none">Trident</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400 mt-2 font-oswald">
            {isHeadCoach ? 'Head Coach Dashboard' : 'Coach Dashboard'}
          </p>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-4 md:pb-0 border-b border-stone-200 md:border-b-0">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold font-oswald flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'clients' ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
            }`}
          >
            <Users size={16} />
            My Clients
          </button>
          
          {isHeadCoach && (
            <>
              <button 
                onClick={() => setActiveTab('all-clients')}
                className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold font-oswald flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === 'all-clients' ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
                }`}
              >
                <Users size={16} className="text-stone-400 group-hover:text-current" />
                All Clients
              </button>
              <button 
                onClick={() => setActiveTab('coaches')}
                className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold font-oswald flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${
                  activeTab === 'coaches' ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
                }`}
              >
                <UserPlus size={16} />
                Manage Coaches
              </button>
            </>
          )}

          <button 
            onClick={() => setActiveTab('program-library')}
            className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold font-oswald flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'program-library' ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
            }`}
          >
            <BookOpen size={16} />
            Program Library
          </button>

          <button 
            onClick={() => setActiveTab('workout-library')}
            className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold font-oswald flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'workout-library' ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
            }`}
          >
            <Dumbbell size={16} />
            Workout Library
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`text-left px-4 py-3 text-xs uppercase tracking-widest font-bold font-oswald flex items-center gap-3 transition-colors shrink-0 whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-stone-900 text-white' : 'hover:bg-stone-100'
            }`}
          >
            <Settings size={16} />
            Settings
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {(activeTab === 'clients' || activeTab === 'all-clients') && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-stone-200 pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">
                    {activeTab === 'all-clients' ? 'All Clients' : 'Client Overview'}
                  </h2>
                  <button onClick={() => setActiveTab('add-client')} className="bg-stone-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors">
                    Add Client
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedClients?.map(client => {
                    const clientTasks = tasks.filter(t => t.clientId.toLowerCase().trim() === client.name.toLowerCase().trim());
                    const clientDoneTasks = clientTasks.filter(t => t.isCompleted).length;
                    const clientTotalTasks = clientTasks.length;

                    return (
                      <div 
                        key={client.id} 
                        onClick={() => {
                          setSelectedClientForTasks(client);
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                          setTaskErrorMessage('');
                        }}
                        className="bg-white border border-[#E5E2DC] p-6 flex flex-col group hover:border-stone-900 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="font-bold text-lg">{client.name}</h3>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 bg-stone-100 px-2 py-1">
                            {client.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mt-auto mb-4">
                          <p className="text-xs text-stone-500 font-serif italic">Phase: {client.phase}</p>
                          {isHeadCoach && (
                            <p className="text-xs text-stone-500">Coach: <span className="font-bold">{client.coach}</span></p>
                          )}
                          
                          <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest pt-2 border-t border-stone-100">
                            <span className="text-stone-400">Habits/Tasks:</span>
                            <span className={cn(
                              "font-bold px-1.5 py-0.5 rounded-sm",
                              clientTotalTasks === 0 ? "text-stone-400 bg-stone-50" :
                              clientDoneTasks === clientTotalTasks ? "text-stone-900 bg-stone-100 font-bold border border-stone-900" : "text-stone-700 bg-stone-50"
                            )}>
                              {clientTotalTasks === 0 ? "None" : `${clientDoneTasks}/${clientTotalTasks} OK`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900 transition-colors">
                          Manage Tasks & Plan <ArrowRight size={14} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'coaches' && isHeadCoach && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-stone-200 pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">Coach Management</h2>
                  <button className="bg-stone-900 text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors">
                    Invite Coach
                  </button>
                </div>

                <div className="bg-white border border-stone-200 overflow-x-auto">
                  <table className="w-full text-left min-w-[500px] md:min-w-0">
                    <thead className="bg-stone-100 text-[10px] uppercase tracking-widest font-bold text-stone-500 font-oswald border-b border-stone-200">
                      <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Specialization</th>
                        <th className="px-6 py-4">Active Clients</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {coaches?.map(coach => (
                        <tr key={coach.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                          <td className="px-6 py-4 font-bold">{coach.name}</td>
                          <td className="px-6 py-4 italic font-serif text-stone-500">{coach.specialization}</td>
                          <td className="px-6 py-4 flex items-center gap-2">
                            {coach.activeClients}
                            <button 
                              onClick={() => setSelectedCoachForClients(coach)}
                              className="text-stone-400 hover:text-stone-900 transition-colors bg-white border border-stone-200 rounded-sm p-0.5"
                            >
                              <Plus size={12} />
                            </button>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold uppercase tracking-widest cursor-pointer underline hover:text-stone-500">Edit</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'program-library' && (
              <div className="space-y-6">
                <div className="flex items-center border-b border-stone-200 pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">Program Library</h2>
                </div>
                <div className="bg-white border border-stone-200 p-8 text-center">
                  <BookOpen size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500 italic font-serif text-sm">
                    {isHeadCoach 
                      ? "Program library coming soon. As Head Coach, you can see and duplicate all programs created by any coach."
                      : "Program library coming soon. You can see and duplicate programs you've created for your clients."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center border-b border-stone-200 pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">Settings</h2>
                </div>
                
                {isHeadCoach ? (
                  <div className="bg-white border border-stone-200">
                    <button 
                      onClick={() => setIsRevenueExpanded(!isRevenueExpanded)}
                      className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors"
                    >
                      <h3 className="text-lg font-bold uppercase tracking-tight font-oswald mb-0">Total Revenue</h3>
                      <ChevronDown size={20} className={`text-stone-400 transition-transform duration-200 ${isRevenueExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isRevenueExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 md:px-6 md:pb-8 border-t border-stone-100 mt-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                              <div>
                                <p className="text-xs text-stone-500 font-serif italic">Across all coaches and subscriptions.</p>
                              </div>

                              <div className="relative">
                                <button
                                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                                  className="flex items-center justify-between w-[120px] bg-stone-100 border border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-900 py-2 pl-4 pr-3 rounded-sm cursor-pointer outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
                                >
                                  {revenuePeriod.replace('-', ' ')}
                                  <ChevronDown size={14} className="text-stone-500" />
                                </button>
                                
                                <AnimatePresence>
                                  {isPeriodDropdownOpen && (
                                    <>
                                      <div 
                                        className="fixed inset-0 z-10" 
                                        onClick={() => setIsPeriodDropdownOpen(false)} 
                                      />
                                      <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute right-0 sm:left-0 top-full mt-1 w-[120px] bg-white border border-stone-200 shadow-lg z-20 rounded-sm py-1 flex flex-col"
                                      >
                                        {(['monthly', 'yearly', 'all-time'] as const).map(period => (
                                          <button
                                            key={period}
                                            onClick={() => {
                                              setRevenuePeriod(period);
                                              setIsPeriodDropdownOpen(false);
                                            }}
                                            className={`text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                              revenuePeriod === period
                                                ? 'bg-stone-900 text-white'
                                                : 'text-stone-700 hover:bg-stone-100'
                                            }`}
                                          >
                                            {period.replace('-', ' ')}
                                          </button>
                                        ))}
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl md:text-6xl font-logo tracking-tighter text-stone-900">
                                ${revenueData[revenuePeriod].toLocaleString()}
                              </span>
                              <span className="text-sm font-bold uppercase tracking-widest text-stone-400 font-oswald">
                                USD
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <p className="text-stone-500 italic font-serif text-sm">Settings panel coming soon.</p>
                )}
              </div>
            )}

            {activeTab === 'workout-library' && (
              <div className="space-y-6">
                <div className="flex items-center border-b border-stone-200 pb-4">
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">Workout Library</h2>
                </div>
                <div className="bg-white border border-stone-200 p-8 text-center">
                  <Dumbbell size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500 italic font-serif text-sm">Workout library coming soon. Build and store templates here.</p>
                </div>
              </div>
            )}

            {activeTab === 'add-client' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-6 border-b border-stone-200 pb-4">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setActiveTab('clients')}
                      className="text-xs uppercase tracking-widest font-bold text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight size={14} className="rotate-180" />
                      Back to Dashboard
                    </button>
                  </div>
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">Add New Client</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Send Sign-up Form */}
                  <div className="bg-white border border-stone-200 p-8 flex flex-col items-start h-full">
                    <h3 className="text-lg font-bold font-oswald uppercase tracking-tight mb-2">Send Sign Up Link</h3>
                    <p className="text-stone-500 font-serif italic text-sm mb-8">Send an invitation containing payment info, DocuSign link, and the initial onboarding questionnaire.</p>
                    
                    <div className="w-full space-y-4 mt-auto">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Name</label>
                        <input className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="e.g. John Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email Address</label>
                        <input type="email" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="john@example.com" />
                      </div>
                      <button className="w-full bg-stone-900 text-white mt-4 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors">
                        Send Invitation
                      </button>
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="bg-white border border-stone-200 p-8 flex flex-col items-start h-full">
                    <h3 className="text-lg font-bold font-oswald uppercase tracking-tight mb-2">Manual Registration</h3>
                    <p className="text-stone-500 font-serif italic text-sm mb-8">Create the profile manually if the client has already signed up and completed payment outside the platform.</p>
                    
                    <div className="w-full space-y-4 mt-auto">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Full Name</label>
                        <input className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="e.g. Jane Doe" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email Address</label>
                        <input type="email" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="jane@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Phone Number</label>
                        <input type="tel" className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="(555) 555-5555" />
                      </div>
                      <div className="space-y-4 pt-4 border-t border-stone-100">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Payment Information</label>
                        <div className="space-y-2">
                          <input className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="Card Number" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="MM/YY" />
                          <input className="w-full bg-stone-50 border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-stone-900 transition-colors" placeholder="CVC" />
                        </div>
                      </div>
                      <button className="w-full bg-stone-900 text-white mt-4 py-4 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors">
                        Create Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedCoachForClients && (
            <motion.div
              key="coach-clients-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setSelectedCoachForClients(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#F9F8F6] w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl rounded-sm p-6 sm:p-10"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-200">
                  <h2 className="text-xl font-bold uppercase tracking-tight font-oswald">{selectedCoachForClients.name}'s Clients</h2>
                  <button
                    onClick={() => setSelectedCoachForClients(null)}
                    className="text-stone-400 hover:text-stone-900 transition-colors bg-white p-2 border border-stone-200 rounded-sm cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                {clients.filter(c => c.coach === selectedCoachForClients.name).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.filter(c => c.coach === selectedCoachForClients.name).map(client => (
                      <div key={client.id} className="bg-white border border-stone-200 p-6 flex flex-col group hover:border-stone-400 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start mb-8">
                          <h3 className="font-bold text-lg">{client.name}</h3>
                          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 bg-stone-100 px-2 py-1">
                            {client.status}
                          </span>
                        </div>
                        
                        <div className="space-y-2 mt-auto">
                          <p className="text-xs text-stone-500 font-serif italic">Phase: {client.phase}</p>
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900 transition-colors">
                          View Plan <ArrowRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-500 italic font-serif text-sm">
                    This coach has no active clients.
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {selectedClientForTasks && (
            <motion.div
              key="client-tasks-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/40 backdrop-blur-sm"
              onClick={() => setSelectedClientForTasks(null)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[#F9F8F6] w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-[#E5E2DC] shadow-2xl rounded-sm p-6 sm:p-10 flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-stone-200">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#9C927E] font-bold bg-[#ECE9E0] px-2 py-0.5 rounded-sm">
                      Client Performance Portal
                    </span>
                    <h2 className="text-3xl font-black uppercase tracking-tight font-oswald text-stone-900 mt-2">
                      {selectedClientForTasks.name}
                    </h2>
                    <p className="text-stone-400 text-xs font-serif italic mt-0.5">
                      Phase: {selectedClientForTasks.phase} • Assigned Coach: {selectedClientForTasks.coach}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedClientForTasks(null)}
                    className="text-stone-400 hover:text-stone-900 transition-colors bg-white p-2 border border-stone-200 rounded-sm cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Form to create a task */}
                  <div className="md:col-span-5 bg-white border border-[#E5E2DC] p-6 space-y-4">
                    <h3 className="font-oswald text-lg font-bold uppercase tracking-tight border-b border-stone-100 pb-2 flex items-center gap-2 text-stone-900">
                      <Plus size={18} />
                      Assign Performance Habit
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Task Title Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Habit / Task Title
                        </label>
                        <input 
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => {
                            setNewTaskTitle(e.target.value);
                            if (taskErrorMessage) setTaskErrorMessage('');
                          }}
                          className={cn(
                            "w-full bg-stone-50 border px-3 py-2 text-sm focus:outline-none focus:border-stone-900 transition-colors rounded-sm",
                            taskErrorMessage ? "border-red-500" : "border-[#E5E2DC]"
                          )}
                          placeholder="e.g. Ingest 160g Lean Protein"
                        />
                        {taskErrorMessage && (
                          <p className="text-red-500 text-[10px] font-semibold mt-0.5">{taskErrorMessage}</p>
                        )}
                      </div>

                      {/* Category Selection */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Focus Area
                        </label>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          {(['Nutrition', 'Hydration', 'Recovery', 'Training'] as const).map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setNewTaskCategory(cat)}
                              className={cn(
                                "py-1.5 px-3 text-[10px] font-bold uppercase tracking-widest border transition-all rounded-sm",
                                newTaskCategory === cat 
                                  ? "bg-stone-910 text-white border-stone-900 bg-stone-900" 
                                  : "bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-400"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instructions / Notes textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Instructions / Description (Optional)
                        </label>
                        <textarea
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                          className="w-full bg-stone-50 border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-stone-900 transition-colors h-20 resize-none rounded-sm"
                          placeholder="Add detail (e.g. target sources, optimal time limits, tracking instructions)"
                        />
                      </div>

                      {/* Fast presets selection */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                          Fast Presets (Click to Load)
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[
                            { title: "Hydrate 1 Gallon", cat: "Hydration", desc: "Maintain steady fluid intake, logging throughout active hours." },
                            { title: "Ingest 160g Protein", cat: "Nutrition", desc: "Aim for lean protein sources, minimum 30g intake per meal block." },
                            { title: "Consolidate 8h Sleep", cat: "Recovery", desc: "Ensure optimal CNS recovery, no screen visual loads 1h prior." },
                            { title: "15-Min Prep Sequence", cat: "Training", desc: "Focused mobility on key active joint complexes before loaded sets." }
                          ].map((preset, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setNewTaskTitle(preset.title);
                                setNewTaskCategory(preset.cat as any);
                                setNewTaskDescription(preset.desc);
                              }}
                              className="text-[9px] font-medium bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-sm transition-colors text-left"
                            >
                              + {preset.title}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          if (!newTaskTitle.trim()) {
                            setTaskErrorMessage('Task title is required');
                            return;
                          }
                          onAddTask({
                            clientId: selectedClientForTasks.name,
                            title: newTaskTitle.trim(),
                            description: newTaskDescription.trim() || undefined,
                            category: newTaskCategory,
                            assignedBy: isHeadCoach ? 'Head Coach' : 'Staff Coach',
                            isCompleted: false
                          });
                          setNewTaskTitle('');
                          setNewTaskDescription('');
                          setTaskErrorMessage('');
                        }}
                        className="w-full bg-stone-900 text-white py-3 mt-2 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-colors rounded-sm flex items-center justify-center gap-2"
                      >
                        <Plus size={14} />
                        Assign Habit Protocol
                      </button>
                    </div>
                  </div>

                  {/* Right Column: List of existing tasks */}
                  <div className="md:col-span-7 bg-white border border-[#E5E2DC] p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h3 className="font-oswald text-lg font-bold uppercase tracking-tight flex items-center gap-2 text-stone-900">
                        <ClipboardList size={18} />
                        Current Protocols
                      </h3>
                      
                      {tasks.filter(t => t.clientId.toLowerCase().trim() === selectedClientForTasks.name.toLowerCase().trim()).length > 0 && (
                        <span className="font-mono text-xs text-stone-900 font-bold bg-stone-50 px-2 py-1 rounded-sm border border-stone-200">
                          Completed: {tasks.filter(t => t.clientId.toLowerCase().trim() === selectedClientForTasks.name.toLowerCase().trim() && t.isCompleted).length} / {tasks.filter(t => t.clientId.toLowerCase().trim() === selectedClientForTasks.name.toLowerCase().trim()).length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {tasks.filter(t => t.clientId.toLowerCase().trim() === selectedClientForTasks.name.toLowerCase().trim()).length > 0 ? (
                        tasks.filter(t => t.clientId.toLowerCase().trim() === selectedClientForTasks.name.toLowerCase().trim()).map((task) => (
                          <div 
                            key={task.id} 
                            className="bg-stone-50 p-4 border border-stone-200 flex items-start gap-4 hover:bg-white transition-all group"
                          >
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className={cn(
                                "w-4 h-4 mt-0.5 border flex items-center justify-center transition-all cursor-pointer rounded-sm shrink-0",
                                task.isCompleted 
                                  ? "bg-stone-900 border-stone-900 text-white" 
                                  : "border-stone-300 hover:border-stone-900 bg-white"
                              )}
                            >
                              {task.isCompleted && <Check size={10} strokeWidth={3} />}
                            </button>

                            <div className="flex-grow min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={cn(
                                  "font-bold text-sm tracking-tight text-stone-900 truncate",
                                  task.isCompleted ? "line-through text-stone-400 font-normal" : ""
                                )}>
                                  {task.title}
                                </span>
                                <span className="text-[8px] uppercase font-bold tracking-wider px-1 bg-stone-200 text-stone-700 rounded-sm">
                                  {task.category}
                                </span>
                              </div>
                              {task.description && (
                                <p className="text-xs text-stone-500 italic font-serif mt-1">
                                  {task.description}
                                </p>
                              )}
                              <p className="text-[8px] font-mono uppercase tracking-widest text-[#9C927E] mt-1">
                                Assigned by: {task.assignedBy || "Trainer"} • Added: {new Date(task.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            {/* Delete action button */}
                            <button
                              type="button"
                              onClick={() => onDeleteTask(task.id)}
                              className="text-stone-400 hover:text-red-600 transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100 p-1 bg-transparent hover:bg-stone-100 rounded-sm"
                              title="Delete task assignment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-stone-400 italic font-serif text-xs">
                          <AlertCircle className="mx-auto text-stone-300 mb-2" size={24} />
                          No goals or protocols assigned to {selectedClientForTasks.name} yet.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
