import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!key) {
      console.warn("VITE_STRIPE_PUBLIC_KEY is not defined");
    }
    stripePromise = loadStripe(key || "");
  }
  return stripePromise;
};
