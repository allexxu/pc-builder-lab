import { GameMode, GamePhase } from "@/hooks/useGameState";
import { GAME_CONFIG, GAME_COMPONENTS } from "@/data/gameComponents";
import { Timer, Heart, HelpCircle, Trophy, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface GameHUDProps {
  mode: GameMode;
  phase: GamePhase;
  score: number;
  timeRemaining: number;
  lives: number;
  hintsUsed: number;
  placedCount: number;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onHint: () => void;
}

const GameHUD = ({
  mode,
  phase,
  score,
  timeRemaining,
  lives,
  hintsUsed,
  placedCount,
  onPause,
  onResume,
  onReset,
  onHint
}: GameHUDProps) => {
  const config = GAME_CONFIG[mode];
  const totalComponents = GAME_COMPONENTS.length;
  const progress = (placedCount / totalComponents) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case "training": return "Training";
      case "challenge": return "Challenge";
      case "ranked": return "Ranked";
    }
  };

  const getModeColor = (mode: GameMode) => {
    switch (mode) {
      case "training": return "text-primary";
      case "challenge": return "text-accent";
      case "ranked": return "text-destructive";
    }
  };

  return (
    <div className="w-full bg-card/80 backdrop-blur-sm border-b border-border p-3">
      <div className="container mx-auto">
        {/* Top row: Mode, Score, Controls */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Mode indicator */}
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-bold uppercase", getModeColor(mode))}>
              {getModeLabel(mode)}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="font-bold text-lg">{score}</span>
            <span className="text-xs text-muted-foreground">puncte</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {phase === "playing" ? (
              <Button variant="ghost" size="icon" onClick={onPause}>
                <Pause className="w-4 h-4" />
              </Button>
            ) : phase === "paused" ? (
              <Button variant="ghost" size="icon" onClick={onResume}>
                <Play className="w-4 h-4" />
              </Button>
            ) : null}
            <Button variant="ghost" size="icon" onClick={onReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bottom row: Timer, Lives, Progress, Hints */}
        <div className="flex items-center justify-between gap-4">
          {/* Timer (for timed modes) */}
          {config.timeLimit > 0 && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-lg",
              timeRemaining <= 30 ? "bg-destructive/20 text-destructive" : "bg-muted/50"
            )}>
              <Timer className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          )}

          {/* Lives (for challenge mode) */}
          {mode === "challenge" && (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(i => (
                <Heart
                  key={i}
                  className={cn(
                    "w-5 h-5 transition-all",
                    i <= lives 
                      ? "text-destructive fill-destructive" 
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Progres</span>
              <span className="text-xs font-medium">{placedCount}/{totalComponents}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Hint button (if enabled) */}
          {config.hintsEnabled && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onHint}
              className="gap-2"
              disabled={phase !== "playing"}
            >
              <HelpCircle className="w-4 h-4" />
              Hint
              {hintsUsed > 0 && (
                <span className="text-xs text-muted-foreground">({hintsUsed})</span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
