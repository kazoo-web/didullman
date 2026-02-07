import { useState, useEffect } from "react";
import { HomePage } from "./pages/HomePage";
import { GuessPage } from "./pages/GuessPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { submitGuess, getGuessById, updatePaymentStatus, TimeOfDay } from "./lib/guessService";
import { redirectToCheckout } from "./lib/stripe";

export type AppView = "home" | "guess" | "confirmation";

export interface GuessData {
  name: string;
  email: string;
  sex: "boy" | "girl";
  date: Date;
  timeOfDay: TimeOfDay;
  contributionAmount: number;
  parentingAdvice?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [submittedGuess, setSubmittedGuess] = useState<GuessData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle payment callback from Stripe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get("payment");

    if (payment === "success") {
      // Get the guessId from localStorage (stored before redirect)
      const guessId = localStorage.getItem("pendingGuessId");

      if (guessId) {
        // Payment successful - update status and show confirmation
        updatePaymentStatus(guessId, "completed").then(() => {
          getGuessById(guessId).then((guess) => {
            if (guess) {
              setSubmittedGuess({
                name: guess.name,
                email: guess.email,
                sex: guess.sex,
                date: new Date(guess.guess_date + "T12:00:00"),
                timeOfDay: guess.time_of_day,
                contributionAmount: guess.contribution_amount,
                parentingAdvice: guess.parenting_advice || undefined,
              });
              setPaymentSuccess(true);
              setCurrentView("confirmation");
            }
          });
        });

        // Clean up
        localStorage.removeItem("pendingGuessId");
      }

      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "cancelled") {
      setSubmitError("Payment was cancelled. Please try again.");
      localStorage.removeItem("pendingGuessId");
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleGuessSubmit = async (guess: GuessData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // First, save the guess to the database
    const result = await submitGuess(guess);

    if (!result.success || !result.data) {
      setIsSubmitting(false);
      setSubmitError(result.error || "Failed to submit guess. Please try again.");
      return;
    }

    // Store guessId in localStorage for after payment redirect
    localStorage.setItem("pendingGuessId", result.data.id);

    // Redirect to Stripe Checkout
    const checkoutResult = await redirectToCheckout({
      amount: guess.contributionAmount,
      guesserName: guess.name,
      guesserEmail: guess.email,
      guessId: result.data.id,
    });

    // If redirect failed (e.g., Stripe not configured), show error
    if (checkoutResult.error) {
      setIsSubmitting(false);
      localStorage.removeItem("pendingGuessId");

      // For testing without Stripe, go directly to confirmation
      if (checkoutResult.error.includes("not configured") || checkoutResult.error.includes("test mode")) {
        console.warn("Stripe not configured, skipping payment for testing");
        setSubmittedGuess(guess);
        setCurrentView("confirmation");
      } else {
        setSubmitError(checkoutResult.error);
      }
    }
    // Note: If successful, user will be redirected to Stripe
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    setSubmitError(null);
  };

  return (
    <>
      {currentView === "home" && (
        <HomePage onNavigate={handleNavigate} />
      )}
      {currentView === "guess" && (
        <GuessPage
          onNavigate={handleNavigate}
          onSubmit={handleGuessSubmit}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}
      {currentView === "confirmation" && submittedGuess && (
        <ConfirmationPage guess={submittedGuess} onNavigate={handleNavigate} paymentSuccess={paymentSuccess} />
      )}
    </>
  );
}

export default App;
