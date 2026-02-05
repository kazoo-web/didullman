import { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { GuessPage } from "./pages/GuessPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";

export type AppView = "home" | "guess" | "confirmation";

export interface GuessData {
  name: string;
  email: string;
  sex: "boy" | "girl";
  date: Date;
  contributionAmount: number;
}

function App() {
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [submittedGuess, setSubmittedGuess] = useState<GuessData | null>(null);

  const handleGuessSubmit = (guess: GuessData) => {
    setSubmittedGuess(guess);
    setCurrentView("confirmation");
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
        <GuessPage onNavigate={handleNavigate} onSubmit={handleGuessSubmit} />
      )}
      {currentView === "confirmation" && submittedGuess && (
        <ConfirmationPage guess={submittedGuess} onNavigate={handleNavigate} />
      )}
    </>
  );
}

export default App;
