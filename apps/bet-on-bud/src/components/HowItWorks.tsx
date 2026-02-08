import { Calendar, CheckCircle, Lightbulb, Eye, Gift } from "lucide-react";
import { AppView } from "../App";

interface HowItWorksProps {
  onNavigate: (view: AppView) => void;
}

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const RuleCard = ({ icon, title, description }: RuleCardProps) => (
  <div className="bob-card p-6 flex items-start gap-4">
    <div
      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bob-gradient-bg"
    >
      <div className="text-white">{icon}</div>
    </div>
    <div>
      <h3 className="font-display text-lg font-semibold" style={{ color: "var(--bob-text)" }}>
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--bob-text-muted)" }}>
        {description}
      </p>
    </div>
  </div>
);

export const HowItWorks = ({ onNavigate }: HowItWorksProps) => {
  const rules = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Pick a date and time",
      description: "Choose a date around the due date and pick whether the baby will come morning, afternoon, evening, or overnight!",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Guess the sex",
      description: "Will it be a boy or a girl?",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Send us some wisdom",
      description: "Give us your best parenting advice, we've all either parented or been parented!",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "See all guesses",
      description: "After you participate, you can see what others have guessed!",
    },
  ];

  return (
    <section className="relative z-10 px-6 py-6 md:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--bob-text)" }}>
            How It Works
          </h2>
        </div>

        {/* Rules Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {rules.map((rule, index) => (
            <RuleCard key={index} {...rule} />
          ))}
        </div>

        {/* Closing Date Badge */}
        <div className="mt-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full"
            style={{ backgroundColor: "hsl(24, 80%, 95%)" }}
          >
            <Calendar className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
            <span style={{ color: "var(--bob-coral)" }} className="font-medium">
              Guessing closes: April 30, 2026
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => onNavigate("guess")}
            className="bob-btn bob-btn-primary"
          >
            <Gift className="w-5 h-5" />
            Make Your Guess
          </button>
          <p className="mt-4 text-sm" style={{ color: "var(--bob-text-muted)" }}>
            Minimum contribution: $10
          </p>
        </div>
      </div>
    </section>
  );
};
