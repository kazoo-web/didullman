import Stripe from "stripe";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, guesserName, guesserEmail, guessId, successUrl, cancelUrl } = req.body;

    if (!amount || !guessId || !successUrl || !cancelUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Append session_id placeholder to success URL - Stripe replaces {CHECKOUT_SESSION_ID}
    const successUrlWithSession = `${successUrl}&session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Bet on B.U.D. - Baby Pool Contribution",
              description: `Contribution from ${guesserName || "Guest"}`,
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrlWithSession,
      cancel_url: cancelUrl,
      customer_email: guesserEmail || undefined,
      // Enable email receipt for the payment
      payment_intent_data: guesserEmail ? {
        receipt_email: guesserEmail,
      } : undefined,
      metadata: {
        guessId,
        guesserName: guesserName || "",
      },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message });
  }
}
