interface DecorationProps {
  className?: string;
}

// Star decoration
const Star = ({ className = "" }: DecorationProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
  </svg>
);

// Heart decoration
const Heart = ({ className = "" }: DecorationProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const FloatingDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Top left star - yellow */}
      <Star
        className="absolute w-5 h-5 text-amber-300/60 animate-float"
        style={{ top: "8%", left: "10%" }}
      />

      {/* Top right star - coral */}
      <Star
        className="absolute w-4 h-4 text-rose-300/50 animate-float-slow"
        style={{ top: "12%", right: "15%" }}
      />

      {/* Left heart - coral */}
      <Heart
        className="absolute w-5 h-5 text-rose-300/50 animate-float-slow"
        style={{ top: "28%", left: "5%" }}
      />

      {/* Center left star - blue */}
      <Star
        className="absolute w-6 h-6 text-sky-400/50 animate-float"
        style={{ top: "45%", left: "8%" }}
      />

      {/* Right star - amber */}
      <Star
        className="absolute w-4 h-4 text-amber-400/40 animate-float-slow"
        style={{ top: "35%", right: "8%" }}
      />

      {/* Bottom left star - yellow */}
      <Star
        className="absolute w-5 h-5 text-amber-300/50 animate-float"
        style={{ bottom: "25%", left: "3%" }}
      />

      {/* Bottom center star - blue */}
      <Star
        className="absolute w-4 h-4 text-sky-300/40 animate-float-slow"
        style={{ bottom: "35%", left: "20%" }}
      />

      {/* Right heart - coral */}
      <Heart
        className="absolute w-4 h-4 text-rose-400/40 animate-float"
        style={{ top: "55%", right: "5%" }}
      />

      {/* Bottom right star - amber */}
      <Star
        className="absolute w-5 h-5 text-amber-400/50 animate-float-slow"
        style={{ bottom: "20%", right: "12%" }}
      />

      {/* Bottom right heart - coral */}
      <Heart
        className="absolute w-4 h-4 text-rose-300/40 animate-float"
        style={{ bottom: "10%", right: "25%" }}
      />

      {/* Extra decorations for larger screens */}
      <Star
        className="hidden md:block absolute w-3 h-3 text-amber-200/40 animate-float"
        style={{ top: "20%", left: "25%" }}
      />

      <Heart
        className="hidden md:block absolute w-3 h-3 text-rose-200/30 animate-float-slow"
        style={{ top: "65%", left: "15%" }}
      />

      <Star
        className="hidden md:block absolute w-4 h-4 text-sky-200/30 animate-float"
        style={{ bottom: "40%", right: "20%" }}
      />
    </div>
  );
};
