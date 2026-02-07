import { Baby } from "lucide-react";

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

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`bob-gradient-bg rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <Baby className={`${iconSizes[size]} text-white`} strokeWidth={1.5} />
    </div>
  );
};
