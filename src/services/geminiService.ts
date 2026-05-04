import { GoogleGenAI, Type } from "@google/genai";
import { UserStats, CoachingResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    trainingProgram: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        schedule: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              focus: { type: Type.STRING },
              exercises: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    sets: { type: Type.NUMBER },
                    reps: { type: Type.STRING },
                    rest: { type: Type.STRING },
                    notes: { type: Type.STRING },
                  },
                  required: ["name", "sets", "reps"]
                }
              }
            },
            required: ["day", "focus", "exercises"]
          }
        }
      },
      required: ["title", "description", "schedule"]
    },
    nutritionPlan: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        dailyCalories: { type: Type.NUMBER },
        macros: {
          type: Type.OBJECT,
          properties: {
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ["protein", "carbs", "fat"]
        },
        meals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              time: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
            },
            required: ["name", "time", "ingredients", "calories", "protein", "carbs", "fat"]
          }
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["title", "dailyCalories", "macros", "meals", "recommendations"]
    }
  },
  required: ["trainingProgram", "nutritionPlan"]
};

export async function generateCoachingPlan(stats: UserStats): Promise<CoachingResponse> {
  const prompt = `
    As a world-class health and fitness coach at Trident Coaching, generate a comprehensive and easy-to-follow training and nutrition program.
    
    The program should be professional, data-driven, and clearly branded as a Trident Performance Plan.
    
    User Profile:
    - Age: ${stats.age}
    - Weight: ${stats.weight}lbs
    - Height: ${stats.height}in
    - Gender: ${stats.gender}
    - Activity Level: ${stats.activityLevel}
    - Goal: ${stats.goal}
    
    Requirements:
    1. Training Program: 7-day schedule (including rest days). Exercises should be appropriate for the user's profile.
       - Workout types MUST be categorized as either: Hypertrophy, Strength, Power, or Cardio.
       - Ensure the "focus" field clearly indicates one of these 4 types (e.g., "Full Body Strength", "Upper Body Hypertrophy", "Cardio Recovery").
    2. Nutrition Plan: Detailed meal plan with breakfast, lunch, dinner, and snacks. Include total calories and macro breakdown (Protein, Carbs, Fat).
    3. Ensure the formatting is "very easy to understand" as requested.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema as any,
    },
  });

  if (!response.text) {
    throw new Error("Failed to generate coaching plan");
  }

  return JSON.parse(response.text) as CoachingResponse;
}
