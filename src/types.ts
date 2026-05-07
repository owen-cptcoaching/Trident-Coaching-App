export interface UserStats {
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'athletic_performance';
  accessCode?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest?: string;
  notes?: string;
}

export interface TrainingDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface TrainingProgram {
  title: string;
  description: string;
  schedule: TrainingDay[];
}

export interface Meal {
  name: string;
  time: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlan {
  title: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Meal[];
  recommendations: string[];
}

export interface CoachingResponse {
  trainingProgram: TrainingProgram;
  nutritionPlan: NutritionPlan;
}
