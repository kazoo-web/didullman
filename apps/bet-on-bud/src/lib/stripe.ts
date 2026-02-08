/**
 * Stripe Integration using Checkout Sessions
 *
 * Setup (Netlify):
 * 1. Deploy to Netlify (it will automatically use the /netlify/functions folder)
 * 2. Set STRIPE_SECRET_KEY in Netlify environment variables
 * 3. Set VITE_API_URL to your Netlify deployment URL (or leave empty for same-origin)
 *
 * Setup (Vercel - alternative):
 * 1. Deploy to Vercel (it will automatically use the /api folder)
 * 2. Set STRIPE_SECRET_KEY in Vercel environment variables
 * 3. Set VITE_API_URL to your Vercel deployment URL
 */

// API URL - empty means same origin (Netlify/Vercel deployment)
const API_URL = import.meta.env.VITE_API_URL || "";

// Use Netlify function path by default, Vercel uses /api
const USE_NETLIFY = import.meta.env.VITE_USE_NETLIFY !== "false";

export interface CreateCheckoutParams {
  amount: number; // in dollars
  guesserName: string;
  guesserEmail: string;
  guessId: string;
}

// Create Stripe Checkout Session and redirect
export const redirectToCheckout = async ({
  amount,
  guesserName,
  guesserEmail,
  guessId,
}: CreateCheckoutParams): Promise<{ error?: string }> => {

  // Determine the API endpoint (Netlify uses /.netlify/functions/, Vercel uses /api/)
  const functionPath = USE_NETLIFY ? "/.netlify/functions/create-checkout" : "/api/create-checkout";
  const apiEndpoint = API_URL ? `${API_URL}${functionPath}` : functionPath;

  // Build success/cancel URLs (include guessId in success URL for reliability)
  const baseUrl = window.location.origin;
  const successUrl = `${baseUrl}/bet-on-bud/?payment=success&guessId=${guessId}`;
  const cancelUrl = `${baseUrl}/bet-on-bud/?payment=cancelled`;

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        guesserName,
        guesserEmail,
        guessId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // If API not available, fall back to test mode
      if (response.status === 404) {
        console.log("[TEST MODE] API not available, skipping payment");
        return { error: "Stripe not configured - test mode" };
      }
      return { error: errorData.error || "Failed to create checkout session" };
    }

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
      return {};
    }

    return { error: "No checkout URL returned" };
  } catch (error) {
    console.error("Checkout error:", error);
    // Network error - likely API not deployed, fall back to test mode
    console.log("[TEST MODE] API not reachable, skipping payment");
    return { error: "Stripe not configured - test mode" };
  }
};

