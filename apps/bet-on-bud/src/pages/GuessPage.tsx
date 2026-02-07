import { FloatingDecorations } from "../components/FloatingDecorations";
import { GuessForm } from "../components/GuessForm";
import { AppView, GuessData } from "../App";

interface GuessPageProps {
  onNavigate: (view: AppView) => void;
  onSubmit: (guess: GuessData) => void;
  isSubmitting: boolean;
  submitError: string | null;
}

export const GuessPage = ({ onNavigate, onSubmit, isSubmitting, submitError }: GuessPageProps) => {
  return (
    <div className="min-h-screen relative">
      <FloatingDecorations />
      <GuessForm
        onNavigate={onNavigate}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
};
