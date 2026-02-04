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
  // Use progress bar for quizzes with more than 10 questions
  const showProgressDots = totalQuestions <= 10;
  const progressPercent = Math.round((questionNumber / totalQuestions) * 100);

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
        
        {showProgressDots ? (
          <div className="flex gap-1 flex-wrap max-w-[200px] justify-end">
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
        ) : (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {progressPercent}%
            </span>
          </div>
        )}
      </div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-tight">
        {question}
      </h2>
    </div>
  );
};

export default QuestionCard;
