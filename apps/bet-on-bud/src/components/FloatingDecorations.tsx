interface DecorationProps {
  className?: string;
  style?: React.CSSProperties;
}

// Star decoration
const Star = ({ className = "", style }: DecorationProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
  </svg>
);

// Heart decoration
const Heart = ({ className = "", style }: DecorationProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={style}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export const FloatingDecorations = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Yellow/amber stars */}
      <Star
        className="absolute w-5 h-5 animate-flicker"
        style={{ top: "8%", left: "10%", color: "hsl(45, 80%, 65%)" }}
      />
      <Star
        className="absolute w-4 h-4 animate-flicker-slow"
        style={{ top: "35%", right: "8%", color: "hsl(40, 70%, 70%)", animationDelay: "0.5s" }}
      />
      <Star
        className="absolute w-5 h-5 animate-flicker"
        style={{ bottom: "30%", left: "18%", color: "hsl(45, 75%, 68%)", animationDelay: "1s" }}
      />
      <Star
        className="absolute w-4 h-4 animate-flicker-fast"
        style={{ bottom: "15%", right: "15%", color: "hsl(42, 70%, 65%)", animationDelay: "0.3s" }}
      />

      {/* Coral/pink hearts */}
      <Heart
        className="absolute w-4 h-4 animate-flicker-slow"
        style={{ top: "30%", left: "5%", color: "hsl(350, 60%, 75%)", animationDelay: "0.7s" }}
      />
      <Heart
        className="absolute w-4 h-4 animate-flicker"
        style={{ top: "55%", right: "5%", color: "hsl(355, 55%, 72%)", animationDelay: "1.2s" }}
      />
      <Heart
        className="absolute w-3 h-3 animate-flicker-fast"
        style={{ bottom: "12%", right: "30%", color: "hsl(350, 50%, 78%)", animationDelay: "0.2s" }}
      />

      {/* Blue stars */}
      <Star
        className="absolute w-5 h-5 animate-flicker"
        style={{ top: "50%", left: "3%", color: "hsl(210, 70%, 70%)", animationDelay: "0.8s" }}
      />
      <Star
        className="absolute w-4 h-4 animate-flicker-slow"
        style={{ bottom: "45%", left: "25%", color: "hsl(205, 65%, 75%)", animationDelay: "1.5s" }}
      />

      {/* Coral/peach stars */}
      <Star
        className="absolute w-4 h-4 animate-flicker-fast"
        style={{ top: "15%", right: "12%", color: "hsl(20, 60%, 75%)", animationDelay: "0.4s" }}
      />
      <Star
        className="absolute w-3 h-3 animate-flicker-slow"
        style={{ top: "70%", right: "18%", color: "hsl(25, 55%, 72%)", animationDelay: "1.8s" }}
      />

      {/* Extra decorations for larger screens */}
      <Star
        className="hidden md:block absolute w-3 h-3 animate-flicker"
        style={{ top: "22%", left: "30%", color: "hsl(45, 65%, 72%)", animationDelay: "2s" }}
      />
      <Heart
        className="hidden md:block absolute w-3 h-3 animate-flicker-slow"
        style={{ top: "65%", left: "12%", color: "hsl(350, 50%, 80%)", animationDelay: "0.9s" }}
      />
      <Star
        className="hidden md:block absolute w-4 h-4 animate-flicker-fast"
        style={{ bottom: "35%", right: "25%", color: "hsl(210, 60%, 78%)", animationDelay: "1.3s" }}
      />
    </div>
  );
};
