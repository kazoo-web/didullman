import { Calendar } from "lucide-react";
import { BabyIcon } from "./BabyIcon";

export const Hero = () => {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-6 py-8 md:py-12 text-center">
      {/* Baby Icon */}
      <div className="animate-fade-in">
        <BabyIcon size="lg" />
      </div>

      {/* Title */}
      <h1 className="mt-8 font-display text-4xl md:text-5xl lg:text-6xl font-bold animate-fade-in-delay-1">
        Bet on <span className="bob-gradient-text">B.U.D.</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-2xl text-lg md:text-xl leading-relaxed animate-fade-in-delay-2" style={{ color: "var(--bob-text-muted)" }}>
        Join us, DJ and Kaz, in celebrating the arrival of Baby Ullman DiDonna (aka B.U.D.) with one of our favorite pastimes - betting on silly things! Guess the baby's arrival date, time, and sex, and if you'd like, offer up some wisdom! In lieu of a registry, as we are trying to get as many hand-me-downs and used goods as possible, all contributions will help us with meals, diapers, care, or unexpected needs after baby arrives.
      </p>

      {/* Due Date Badge */}
      <div className="mt-8 animate-fade-in-delay-2">
        <div className="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-full border shadow-sm" style={{ borderColor: "var(--bob-border)" }}>
          <Calendar className="w-5 h-5" style={{ color: "var(--bob-coral)" }} />
          <span style={{ color: "var(--bob-text-muted)" }}>Due date:</span>
          <span className="font-semibold" style={{ color: "var(--bob-text)" }}>May 22, 2026</span>
        </div>
      </div>
    </section>
  );
};
