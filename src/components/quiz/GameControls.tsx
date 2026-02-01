import { Play, SkipForward, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameControlsProps {
  status: "waiting" | "active" | "question" | "results" | "finished";
  currentQuestion: number | null;
  totalQuestions: number;
  onStart: () => void;
  onNext: () => void;
  onEnd: () => void;
  loading?: boolean;
}

const GameControls = ({
  status,
  currentQuestion,
  totalQuestions,
  onStart,
  onNext,
  onEnd,
  loading = false,
}: GameControlsProps) => {
  const isLastQuestion = currentQuestion !== null && currentQuestion >= totalQuestions;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {status === "waiting" && (
        <Button
          size="lg"
          onClick={onStart}
          disabled={loading}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          Începe Jocul
        </Button>
      )}

      {(status === "active" || status === "results") && !isLastQuestion && (
        <Button
          size="lg"
          onClick={onNext}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SkipForward className="w-5 h-5" />
          )}
          Întrebarea Următoare
        </Button>
      )}

      {(status === "active" || status === "results") && isLastQuestion && (
        <Button
          size="lg"
          onClick={onEnd}
          disabled={loading}
          className="gap-2 bg-primary"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          Afișează Clasamentul
        </Button>
      )}

      {status !== "waiting" && status !== "finished" && (
        <Button
          variant="destructive"
          size="lg"
          onClick={onEnd}
          disabled={loading}
          className="gap-2"
        >
          <Square className="w-5 h-5" />
          Termină Jocul
        </Button>
      )}
    </div>
  );
};

export default GameControls;
