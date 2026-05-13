import React, { useState, useRef, useEffect } from 'react';
import { UserStats } from '../types';
import { User, Activity, Target, ArrowRight, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StatsFormProps {
  onSubmit: (stats: UserStats) => void;
  isLoading: boolean;
  onNoCodeClick?: () => void;
}

const CustomSelect = ({ 
  value, 
  options, 
  onChange, 
  name, 
  label 
}: { 
  value: string; 
  options: { label: string; value: string }[]; 
  onChange: (name: string, value: string) => void; 
  name: string; 
  label: React.ReactNode; 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="space-y-2 border-b border-stone-100 pb-4 relative" ref={containerRef}>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
        {label}
      </label>
      <div 
        className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-sm font-bold uppercase tracking-widest font-oswald flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown size={14} className={`text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 w-full mt-2 bg-white border border-stone-200 shadow-xl z-50 py-1"
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-widest font-oswald cursor-pointer transition-colors ${
                  value === opt.value ? 'bg-stone-900 text-white' : 'hover:bg-stone-900 hover:text-white'
                }`}
                onClick={() => {
                  onChange(name, opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const StatsForm: React.FC<StatsFormProps> = ({ onSubmit, isLoading, onNoCodeClick }) => {
  const [formData, setFormData] = React.useState<UserStats>({
    age: 30,
    weight: 165,
    height: 70,
    gender: 'male',
    activityLevel: 'moderately_active',
    goal: 'maintenance',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['age', 'weight', 'height'].includes(name) ? Number(value) : value,
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              Weight (lbs)
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
              Height (in)
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
          <CustomSelect
            name="gender"
            label="Gender"
            value={formData.gender}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' }
            ]}
            onChange={handleSelectChange}
          />
          <div className="space-y-2 border-b border-stone-100 pb-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 flex items-center gap-2 font-oswald">
              Access Code
            </label>
            <input
              type="text"
              name="accessCode"
              value={formData.accessCode || ''}
              onChange={handleChange}
              placeholder="Enter Coach Code"
              className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-xl font-oswald uppercase"
              required
            />
            <button 
              type="button"
              className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors tracking-widest uppercase font-bold font-oswald flex block pt-2 underline"
              onClick={onNoCodeClick}
            >
              Don't have a code?
            </button>
          </div>
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

        <div className="flex justify-center mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 bg-white border border-stone-200 text-stone-900 rounded-full text-[10px] font-bold font-holigas uppercase tracking-widest"
          >
            AI-Powered Precision Coaching
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
};
