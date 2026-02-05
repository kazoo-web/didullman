import { CheckCircle, Home } from "lucide-react";
import { FloatingDecorations } from "../components/FloatingDecorations";
import { BabyIcon } from "../components/BabyIcon";
import { AppView, GuessData } from "../App";

interface ConfirmationPageProps {
  guess: GuessData;
  onNavigate: (view: AppView) => void;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const ConfirmationPage = ({ guess, onNavigate }: ConfirmationPageProps) => {
  return (
    <div className="min-h-screen relative">
      <FloatingDecorations />

      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
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

          {/* Summary Card */}
          <div className="bob-card p-6 mt-8 text-left">
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
                <span style={{ color: "var(--bob-text-muted)" }}>Contribution:</span>
                <span className="font-medium" style={{ color: "var(--bob-text)" }}>
                  ${guess.contributionAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Thank you message */}
          <p className="mt-6 text-sm" style={{ color: "var(--bob-text-muted)" }}>
            DJ & Kaz appreciate your support! You'll receive an email confirmation shortly.
          </p>

          {/* Back to home button */}
          <button
            onClick={() => onNavigate("home")}
            className="bob-btn bob-btn-primary mt-8"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};
