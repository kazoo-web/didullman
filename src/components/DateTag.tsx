import { Calendar } from "lucide-react";

interface DateTagProps {
  date: string;
}

export const DateTag = ({ date }: DateTagProps) => {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/90 backdrop-blur-sm rounded-full border border-border shadow-sm">
      <Calendar className="w-4 h-4 text-gold" />
      <span className="text-sm font-medium text-foreground">{date}</span>
    </div>
  );
};
