import { loadStripe } from "@stripe/stripe-js";

// Use test key for development, live key for production
// Test keys start with pk_test_, live keys start with pk_live_
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "";

// Initialize Stripe
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublicKey) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};

export interface CreateCheckoutParams {
  amount: number; // in dollars
  guesserName: string;
  guesserEmail: string;
  guessId: string;
}

// For now, redirect to Stripe Checkout via Supabase Edge Function
export const createCheckoutSession = async ({
  amount,
  guesserName,
  guesserEmail,
  guessId,
}: CreateCheckoutParams): Promise<{ url: string } | { error: string }> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    return { error: "Supabase URL not configured" };
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        guesserName,
        guesserEmail,
        guessId,
        successUrl: `${window.location.origin}/bet-on-bud/?payment=success&guess_id=${guessId}`,
        cancelUrl: `${window.location.origin}/bet-on-bud/?payment=cancelled`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: `Payment setup failed: ${error}` };
    }

    const data = await response.json();
    return { url: data.url };
  } catch (err) {
    console.error("Checkout error:", err);
    return { error: "Failed to connect to payment service" };
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (params: CreateCheckoutParams): Promise<{ error?: string }> => {
  const result = await createCheckoutSession(params);

  if ("error" in result) {
    return { error: result.error };
  }

  // Redirect to Stripe Checkout
  window.location.href = result.url;
  return {};
};
