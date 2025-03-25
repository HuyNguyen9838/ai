import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
}

export default function Rating({ value, max = 5 }: RatingProps) {
  return (
    <div className="text-amber-500 flex">
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className="h-5 w-5"
          fill="currentColor"
        />
      ))}
    </div>
  );
}
