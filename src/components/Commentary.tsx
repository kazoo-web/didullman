import { Heart, Star } from "lucide-react";

interface CommentaryProps {
  author: "katherine" | "dj";
  comment: string;
}

export const Commentary = ({ author, comment }: CommentaryProps) => {
  const isKatherine = author === "katherine";
  
  return (
    <div 
      className={`
        relative p-5 rounded-2xl max-w-md
        ${isKatherine ? 'bg-katherine-light border-l-4 border-katherine' : 'bg-dj-light border-l-4 border-dj'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        {isKatherine ? (
          <Heart className="w-4 h-4 text-katherine fill-current" />
        ) : (
          <Star className="w-4 h-4 text-dj fill-current" />
        )}
        <span className={`text-xs font-sans font-semibold uppercase tracking-wider ${isKatherine ? 'text-katherine' : 'text-dj'}`}>
          {isKatherine ? 'Katherine' : 'DJ'}
        </span>
      </div>
      <p className="font-serif text-lg italic text-foreground leading-relaxed">
        "{comment}"
      </p>
    </div>
  );
};
