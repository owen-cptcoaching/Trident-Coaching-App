import express from "express";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY environment variable is required");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2023-10-16" as any,
    });
  }
  return stripeClient;
}

const app = express();

// Stripe Webhook Endpoint (must use raw body)
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).send("Webhook secret or signature missing");
    }

    try {
      const stripe = getStripe();
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        webhookSecret
      );

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          // Fulfill the purchase, e.g., update Supabase database
          console.log("Payment successful for session:", session.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// Use JSON parsing for normal API routes
app.use("/api", express.json());

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Basic Stripe Checkout Endpoint
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const stripe = getStripe();
    
    const baseUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Trident Coaching Plan",
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Generate Coaching Plan via Gemini
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { GoogleGenAI, Type } = await import("@google/genai");
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing on the server. Please check Settings > Secrets.");
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

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

    const stats = req.body.stats;
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
      - Category & Equipment on exercise: Do NOT generate difficulty ratings or performance cues under notes. Keep them professional, structured, beautiful and clean.
      - Training Program: 7-day schedule (including rest days). Exercises should be appropriate for the user's profile.
         - Workout types MUST be categorized as either: Hypertrophy, Strength, Power, or Cardio.
         - Ensure the "focus" field clearly indicates one of these 4 types (e.g., "Full Body Strength", "Upper Body Hypertrophy", "Cardio Recovery").
      - Nutrition Plan: Detailed meal plan with breakfast, lunch, dinner, and snacks. Include total calories and macro breakdown (Protein, Carbs, Fat).
      - Ensure the formatting is "very easy to understand" as requested.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      },
    });

    if (!response.text) {
      throw new Error("Failed to generate coaching plan");
    }

    const plan = JSON.parse(response.text);
    res.json({ plan });
  } catch (error: any) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
