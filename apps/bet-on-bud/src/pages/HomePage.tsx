import { FloatingDecorations } from "../components/FloatingDecorations";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { AppView } from "../App";

interface HomePageProps {
  onNavigate: (view: AppView) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <div className="min-h-screen relative">
      <FloatingDecorations />
      <Hero />
      <HowItWorks onNavigate={onNavigate} />
    </div>
  );
};
