import { Calendar, CheckCircle, Trophy, Eye } from "lucide-react";

interface RuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const RuleCard = ({ icon, title, description }: RuleCardProps) => (
  <div className="bob-card p-6 flex items-start gap-4">
    <div
      className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: "hsl(35, 40%, 92%)" }}
    >
      <div style={{ color: "var(--bob-coral)" }}>{icon}</div>
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

export const HowItWorks = () => {
  const rules = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Pick a date",
      description: "Choose a date between May 8, 2026 and June 5, 2026",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Guess the sex",
      description: "Will it be a boy or a girl?",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Winners are chosen",
      description: "Exact match wins! If no exact match, closest date to actual birth wins.",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "See all guesses",
      description: "After you participate, you can see everyone's guesses (shown separately for privacy).",
    },
  ];

  return (
    <section className="relative z-10 px-6 py-12 md:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold" style={{ color: "var(--bob-text)" }}>
            How It Works
          </h2>
          <p className="mt-3 text-lg" style={{ color: "var(--bob-text-muted)" }}>
            Simple rules, transparent guesses, and all contributions go to the parents.
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {rules.map((rule, index) => (
            <RuleCard key={index} {...rule} />
          ))}
        </div>

        {/* Closing Date Badge */}
        <div className="mt-10 text-center">
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
      </div>
    </section>
  );
};
