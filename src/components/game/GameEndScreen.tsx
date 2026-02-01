import { GameMode } from "@/hooks/useGameState";
import { Trophy, Clock, Target, Lightbulb, Star, RotateCcw, Home, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface GameEndScreenProps {
  mode: GameMode;
  finalScore: {
    baseScore: number;
    timeBonus: number;
    perfectBonus: number;
    noHintsBonus: number;
    total: number;
  };
  mistakes: number;
  hintsUsed: number;
  timeRemaining: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

const GameEndScreen = ({
  mode,
  finalScore,
  mistakes,
  hintsUsed,
  timeRemaining,
  onPlayAgain,
  onBackToMenu
}: GameEndScreenProps) => {
  const isPerfect = mistakes === 0;
  const noHints = hintsUsed === 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGrade = (total: number) => {
    if (total >= 1500) return { grade: "S", color: "text-yellow-400", bg: "bg-yellow-400/20" };
    if (total >= 1200) return { grade: "A", color: "text-accent", bg: "bg-accent/20" };
    if (total >= 900) return { grade: "B", color: "text-primary", bg: "bg-primary/20" };
    if (total >= 600) return { grade: "C", color: "text-blue-400", bg: "bg-blue-400/20" };
    return { grade: "D", color: "text-muted-foreground", bg: "bg-muted" };
  };

  const grade = getGrade(finalScore.total);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md tech-card animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            {isPerfect ? (
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center animate-bounce-success">
                <Star className="w-10 h-10 text-accent fill-accent" />
              </div>
            ) : (
              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center", grade.bg)}>
                <span className={cn("text-4xl font-bold", grade.color)}>{grade.grade}</span>
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {isPerfect ? "Perfect!" : "Felicitări!"}
          </CardTitle>
          <p className="text-muted-foreground">
            Ai completat asamblarea PC-ului!
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm">Scor Bază</span>
              </div>
              <span className="font-bold">{finalScore.baseScore}</span>
            </div>

            {finalScore.timeBonus > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm">Bonus Timp ({formatTime(timeRemaining)})</span>
                </div>
                <span className="font-bold text-accent">+{finalScore.timeBonus}</span>
              </div>
            )}

            {finalScore.perfectBonus > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Bonus Perfect (×2)</span>
                </div>
                <span className="font-bold text-yellow-400">+{finalScore.perfectBonus}</span>
              </div>
            )}

            {finalScore.noHintsBonus > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-400" />
                  <span className="text-sm">Fără Hint-uri</span>
                </div>
                <span className="font-bold text-orange-400">+{finalScore.noHintsBonus}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center py-3 bg-muted/50 rounded-lg px-3">
              <span className="font-bold">TOTAL</span>
              <span className="text-2xl font-bold gradient-text">{finalScore.total}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-destructive">{mistakes}</div>
              <div className="text-xs text-muted-foreground">Greșeli</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{hintsUsed}</div>
              <div className="text-xs text-muted-foreground">Hint-uri</div>
            </div>
          </div>

          {/* Achievements earned */}
          {(isPerfect || noHints) && (
            <div className="flex justify-center gap-2 flex-wrap">
              {isPerfect && (
                <div className="flex items-center gap-1 px-3 py-1 bg-accent/20 rounded-full text-sm">
                  <Award className="w-3 h-3 text-accent" />
                  <span className="text-accent">Perfect Run</span>
                </div>
              )}
              {noHints && (
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-400/20 rounded-full text-sm">
                  <Lightbulb className="w-3 h-3 text-orange-400" />
                  <span className="text-orange-400">No Hints</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onBackToMenu}
            >
              <Home className="w-4 h-4 mr-2" />
              Meniu
            </Button>
            <Button 
              className="flex-1 neon-glow"
              onClick={onPlayAgain}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Joacă Din Nou
            </Button>
          </div>

          {/* Leaderboard link for ranked */}
          {mode === "ranked" && (
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/leaderboard">
                <Trophy className="w-4 h-4 mr-2" />
                Vezi Clasamentul
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameEndScreen;
