import { cn } from "@/lib/utils";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  className?: string;
}

const QuestionCard = ({
  questionNumber,
  totalQuestions,
  question,
  className,
}: QuestionCardProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto p-6 md:p-8",
        "bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50",
        "shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm md:text-base text-muted-foreground font-medium">
          Întrebarea {questionNumber} din {totalQuestions}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i < questionNumber ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-tight">
        {question}
      </h2>
    </div>
  );
};

export default QuestionCard;
