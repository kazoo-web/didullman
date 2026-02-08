import Stripe from "stripe";
import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { amount, guesserName, guesserEmail, guessId, successUrl, cancelUrl } = body;

    if (!amount || !guessId || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url, sessionId: session.id }),
    };
  } catch (error: any) {
    console.error("Stripe error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };
