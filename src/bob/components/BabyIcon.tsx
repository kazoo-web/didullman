interface BabyIconProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BabyIcon = ({ className = "", size = "md" }: BabyIconProps) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  return (
    <div
      className={`bob-gradient-bg rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3/5 h-3/5"
      >
        {/* Baby face outline */}
        <circle cx="12" cy="12" r="9" />
        {/* Left eye */}
        <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
        {/* Right eye */}
        <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
        {/* Smile */}
        <path d="M8.5 14.5c1 1.5 5.5 1.5 7 0" />
        {/* Little hair tuft */}
        <path d="M10 3.5c0.5-0.5 1.5-1 2-1s1.5 0.5 2 1" />
      </svg>
    </div>
  );
};
