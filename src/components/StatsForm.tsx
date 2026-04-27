import React from 'react';
import { UserStats } from '../types';
import { User, Activity, Target, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsFormProps {
  onSubmit: (stats: UserStats) => void;
  isLoading: boolean;
}

export const StatsForm: React.FC<StatsFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<UserStats>({
    age: 30,
    weight: 75,
    height: 175,
    gender: 'male',
    activityLevel: 'moderately_active',
    goal: 'maintenance',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['age', 'weight', 'height'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto bg-white p-12 shadow-sm border border-stone-200"
    >
      <div className="mb-12 border-b border-stone-100 pb-8">
        <h2 className="text-4xl font-oswald font-black mb-2 italic uppercase tracking-tighter">Initialize Your Path</h2>
        <p className="text-stone-400 font-serif italic">Provide your details to generate a high-performance program tailored to your biology and goals.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
              <User size={12} /> Age
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-xl font-oswald"
              required
            />
          </div>
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
              Weight (kg)
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-xl font-oswald"
              required
            />
          </div>
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
              Height (cm)
            </label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-xl font-oswald"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-sm font-bold uppercase tracking-widest appearance-none font-oswald"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
              <Activity size={12} /> Activity Level
            </label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-sm font-bold uppercase tracking-widest appearance-none font-oswald"
            >
              <option value="sedentary">Sedentary</option>
              <option value="lightly_active">Lightly Active</option>
              <option value="moderately_active">Moderately Active</option>
              <option value="very_active">Very Active</option>
              <option value="extra_active">Extra Active</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 border-b border-stone-100 pb-4">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
            <Target size={12} /> Primary Goal
          </label>
          <select
            name="goal"
            value={formData.goal}
            onChange={handleChange}
            className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-sm font-bold uppercase tracking-widest appearance-none font-oswald"
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
            <option value="athletic_performance">Athletic Performance</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-stone-900 text-white py-6 font-bold uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer font-oswald"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generating...
            </>
          ) : (
            <>
              Initialize Plan <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
