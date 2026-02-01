import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

interface ScorePopupProps {
  points: number;
  isCorrect: boolean;
  show: boolean;
}

const ScorePopup = ({ points, isCorrect, show }: ScorePopupProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center z-50 pointer-events-none",
        "transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-4 p-8 rounded-3xl",
          "transform transition-all duration-500",
          show ? "scale-100 translate-y-0" : "scale-75 translate-y-8",
          isCorrect
            ? "bg-green-500/90 text-white"
            : "bg-red-500/90 text-white"
        )}
      >
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center",
            isCorrect ? "bg-green-400" : "bg-red-400"
          )}
        >
          {isCorrect ? (
            <Check className="w-12 h-12" strokeWidth={3} />
          ) : (
            <X className="w-12 h-12" strokeWidth={3} />
          )}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold mb-1">
            {isCorrect ? "Corect!" : "Greșit!"}
          </p>
          <p className="text-4xl font-bold">
            +{points} puncte
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScorePopup;
