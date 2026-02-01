import { cn } from "@/lib/utils";
import { ANSWER_COLORS, ANSWER_ICONS } from "@/lib/quiz-utils";

interface AnswerButtonProps {
  index: number;
  text: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
  correct?: boolean | null;
  showResult?: boolean;
}

const AnswerButton = ({
  index,
  text,
  onClick,
  disabled = false,
  selected = false,
  correct = null,
  showResult = false,
}: AnswerButtonProps) => {
  const colorIndex = index % ANSWER_COLORS.length;
  const color = ANSWER_COLORS[colorIndex];
  const icon = ANSWER_ICONS[colorIndex];

  const getButtonClasses = () => {
    if (showResult) {
      if (correct === true) {
        return "bg-green-500 ring-4 ring-green-300 scale-105";
      }
      if (selected && correct === false) {
        return "bg-red-500 ring-4 ring-red-300 opacity-75";
      }
      if (!selected) {
        return "opacity-50";
      }
    }

    if (selected) {
      return cn(color.bg, "ring-4 ring-white scale-105");
    }

    return cn(color.bg, !disabled && color.hover);
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-full h-full min-h-[100px] md:min-h-[120px] rounded-xl p-4",
        "flex items-center justify-center gap-3",
        "text-lg md:text-xl font-bold transition-all duration-200",
        "shadow-lg transform active:scale-95",
        color.text,
        getButtonClasses(),
        disabled && !showResult && "cursor-not-allowed opacity-60"
      )}
    >
      <span className="text-2xl md:text-3xl opacity-80">{icon}</span>
      <span className="text-center leading-tight">{text}</span>
    </button>
  );
};

export default AnswerButton;
