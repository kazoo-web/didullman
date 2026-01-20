import { MessageCircle } from "lucide-react";

interface CommentaryProps {
  author: "katherine" | "dj";
  comment: string;
}

export const Commentary = ({ author, comment }: CommentaryProps) => {
  const name = author === "katherine" ? "Katherine" : "DJ";
  
  return (
    <div className="relative p-5 rounded-2xl max-w-md bg-gold-light border-l-4 border-gold">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="w-4 h-4 text-gold fill-current" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gold">
          {name}
        </span>
      </div>
      <p className="text-lg italic text-foreground leading-relaxed">
        "{comment}"
      </p>
    </div>
  );
};
