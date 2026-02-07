import { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { GuessPage } from "./pages/GuessPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { submitGuess } from "./lib/guessService";

export type AppView = "home" | "guess" | "confirmation";

export interface GuessData {
  name: string;
  email: string;
  sex: "boy" | "girl";
  date: Date;
  contributionAmount: number;
  parentingAdvice?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [submittedGuess, setSubmittedGuess] = useState<GuessData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleGuessSubmit = async (guess: GuessData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitGuess(guess);

    setIsSubmitting(false);

    if (result.success) {
      setSubmittedGuess(guess);
      setCurrentView("confirmation");
    } else {
      setSubmitError(result.error || "Failed to submit guess. Please try again.");
    }
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
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
        <ConfirmationPage guess={submittedGuess} onNavigate={handleNavigate} />
      )}
    </>
  );
}

export default App;
