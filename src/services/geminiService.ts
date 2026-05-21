import { UserStats, CoachingResponse } from "../types";

export async function generateCoachingPlan(stats: UserStats): Promise<CoachingResponse> {
  const response = await fetch("/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stats })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate coaching plan");
  }

  const data = await response.json();
  return data.plan;
}
