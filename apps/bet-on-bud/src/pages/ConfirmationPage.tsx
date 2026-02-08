import { useEffect, useState } from "react";
import { CheckCircle, Home, Loader2 } from "lucide-react";
import { FloatingDecorations } from "../components/FloatingDecorations";
import { BabyIcon } from "../components/BabyIcon";
import { GuessingStats } from "../components/GuessingStats";
import { AppView, GuessData } from "../App";
import { getGuesses, GuessRecord } from "../lib/guessService";

interface ConfirmationPageProps {
  guess: GuessData;
  onNavigate: (view: AppView) => void;
  paymentSuccess?: boolean;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatTimeOfDay = (timeOfDay: string): string => {
  const labels: Record<string, string> = {
    overnight: "Overnight (12am - 6am)",
    morning: "Morning (6am - 12pm)",
    afternoon: "Afternoon (12pm - 6pm)",
    evening: "Evening (6pm - 12am)",
  };
  return labels[timeOfDay] || timeOfDay;
};

export const ConfirmationPage = ({ guess, onNavigate, paymentSuccess }: ConfirmationPageProps) => {
  const [allGuesses, setAllGuesses] = useState<GuessRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuesses = async () => {
      setIsLoading(true);
      const guesses = await getGuesses();
      setAllGuesses(guesses);
      setIsLoading(false);
    };
    fetchGuesses();
  }, []);

  return (
    <div className="min-h-screen relative">
      <FloatingDecorations />

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center">
            {/* Success Icon */}
            <div className="relative inline-block">
              <BabyIcon size="lg" className="mx-auto" />
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "hsl(142, 76%, 45%)" }}
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mt-8 font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--bob-text)" }}>
              You're In!
            </h1>

            <p className="mt-4 text-lg" style={{ color: "var(--bob-text-muted)" }}>
              Thanks for your guess, {guess.name}!
            </p>
          </div>

          {/* Summary Card */}
          <div className="bob-card p-6 mt-8">
            <h2 className="font-display text-lg font-semibold mb-4" style={{ color: "var(--bob-text)" }}>
              Your Prediction
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span style={{ color: "var(--bob-text-muted)" }}>Sex:</span>
                <span className="font-medium capitalize" style={{ color: "var(--bob-text)" }}>
                  {guess.sex}
                </span>
              </div>

              <div className="flex justify-between">
                <span style={{ color: "var(--bob-text-muted)" }}>Birth Date:</span>
                <span className="font-medium" style={{ color: "var(--bob-text)" }}>
                  {formatDate(guess.date)}
                </span>
              </div>

              <div className="flex justify-between">
                <span style={{ color: "var(--bob-text-muted)" }}>Time of Day:</span>
                <span className="font-medium" style={{ color: "var(--bob-text)" }}>
                  {formatTimeOfDay(guess.timeOfDay)}
                </span>
              </div>

              <div className="flex justify-between">
                <span style={{ color: "var(--bob-text-muted)" }}>Contribution:</span>
                <span className="font-medium" style={{ color: "var(--bob-text)" }}>
                  ${guess.contributionAmount}
                </span>
              </div>

              {guess.parentingAdvice && (
                <div className="pt-3 mt-3 border-t" style={{ borderColor: "var(--bob-border)" }}>
                  <span className="text-sm" style={{ color: "var(--bob-text-muted)" }}>Your advice:</span>
                  <p className="mt-1 text-sm italic" style={{ color: "var(--bob-text)" }}>
                    "{guess.parentingAdvice}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Thank you message */}
          <p className="mt-6 text-sm text-center" style={{ color: "var(--bob-text-muted)" }}>
            We appreciate your support! Your guess has been recorded on our end and you'll receive an email receipt shortly. If you want to remember it for your own records, mark it down now!
          </p>

          {/* Stats Section */}
          <div className="mt-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--bob-coral)" }} />
                <p className="mt-4" style={{ color: "var(--bob-text-muted)" }}>Loading stats...</p>
              </div>
            ) : (
              <GuessingStats guesses={allGuesses} />
            )}
          </div>

          {/* Back to home button */}
          <div className="text-center mt-8">
            <button
              onClick={() => onNavigate("home")}
              className="bob-btn bob-btn-primary"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
