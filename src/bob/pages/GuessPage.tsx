import { FloatingDecorations } from "../components/FloatingDecorations";
import { GuessForm } from "../components/GuessForm";
import { AppView, GuessData } from "../App";

interface GuessPageProps {
  onNavigate: (view: AppView) => void;
  onSubmit: (guess: GuessData) => void;
}

export const GuessPage = ({ onNavigate, onSubmit }: GuessPageProps) => {
  return (
    <div className="min-h-screen relative">
      <FloatingDecorations />
      <GuessForm onNavigate={onNavigate} onSubmit={onSubmit} />
    </div>
  );
};
