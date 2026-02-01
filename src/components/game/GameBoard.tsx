import { useState, useEffect } from "react";
import { useGameState, GameMode } from "@/hooks/useGameState";
import { GAME_COMPONENTS, ComponentId, ZoneId } from "@/data/gameComponents";
import MotherboardSVG from "./MotherboardSVG";
import ComponentCard from "./ComponentCard";
import GameHUD from "./GameHUD";
import GameEndScreen from "./GameEndScreen";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface GameBoardProps {
  mode: GameMode;
  onExit: () => void;
}

const GameBoard = ({ mode, onExit }: GameBoardProps) => {
  const [state, actions] = useGameState();
  const [highlightedZone, setHighlightedZone] = useState<ZoneId | null>(null);
  const [hintComponent, setHintComponent] = useState<ComponentId | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Start game on mount
  useEffect(() => {
    actions.startGame(mode);
  }, [mode]);

  // Clear hint after a delay
  useEffect(() => {
    if (hintComponent) {
      const timer = setTimeout(() => setHintComponent(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [hintComponent]);

  // Show feedback toast
  useEffect(() => {
    if (state.lastPlacementResult) {
      const result = state.lastPlacementResult;
      if (result.success) {
        toast.success(result.message, {
          description: `+${result.points} puncte`,
          duration: 2000
        });
        setShowFeedback({ type: "success", message: `+${result.points}` });
      } else {
        toast.error(result.message, {
          description: result.points < 0 ? `${result.points} puncte` : undefined,
          duration: 3000
        });
        setShowFeedback({ type: "error", message: result.message });
      }
      
      setTimeout(() => setShowFeedback(null), 1500);
    }
  }, [state.lastPlacementResult]);

  const handleZoneClick = (zoneId: ZoneId) => {
    if (!state.selectedComponent) {
      toast.info("Selectează mai întâi o componentă din lista din stânga");
      return;
    }

    actions.placeComponent(state.selectedComponent, zoneId);
  };

  const handleComponentSelect = (componentId: ComponentId) => {
    if (state.selectedComponent === componentId) {
      actions.selectComponent(null);
    } else {
      actions.selectComponent(componentId);
    }
  };

  const handleHint = () => {
    const hint = actions.useHint();
    if (hint) {
      setHintComponent(hint.id);
      toast.info(`Hint: ${hint.name}`, {
        description: hint.hint,
        duration: 5000
      });
    }
  };

  const handlePlayAgain = () => {
    actions.startGame(mode);
    setHintComponent(null);
    setShowFeedback(null);
  };

  const availableComponents = actions.getAvailableComponents();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* HUD */}
      <GameHUD
        mode={state.mode}
        phase={state.phase}
        score={state.score}
        timeRemaining={state.timeRemaining}
        lives={state.lives}
        hintsUsed={state.hintsUsed}
        placedCount={state.placedComponents.length}
        onPause={actions.pauseGame}
        onResume={actions.resumeGame}
        onReset={handlePlayAgain}
        onHint={handleHint}
      />

      {/* Main game area */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Back button and instructions */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onExit} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </Button>
          
          {state.selectedComponent && (
            <Alert className="max-w-md border-primary/50 bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary text-sm">
                Click pe zona corectă de pe placa de bază pentru a plasa componenta
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Game content */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Components panel */}
          <div className="order-2 lg:order-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Componente Disponibile
            </h3>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {GAME_COMPONENTS.map(component => {
                const isPlaced = actions.isComponentPlaced(component.id);
                const { canPlace, reason } = actions.canPlaceComponent(component.id);
                
                return (
                  <ComponentCard
                    key={component.id}
                    component={component}
                    isSelected={state.selectedComponent === component.id}
                    isPlaced={isPlaced}
                    canPlace={canPlace}
                    reason={reason}
                    onSelect={handleComponentSelect}
                    showHint={hintComponent === component.id}
                  />
                );
              })}
              
              {availableComponents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Toate componentele au fost plasate! 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Motherboard area */}
          <div className="order-1 lg:order-2 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Placă de Bază
            </h3>
            
            <div className={cn(
              "relative p-4 rounded-2xl border-2 border-border bg-card/50",
              "transition-all duration-300",
              showFeedback?.type === "success" && "border-accent animate-bounce-success",
              showFeedback?.type === "error" && "border-destructive animate-shake"
            )}>
              <MotherboardSVG
                placedComponents={state.placedComponents}
                selectedComponent={state.selectedComponent}
                highlightedZone={highlightedZone}
                onZoneClick={handleZoneClick}
                onZoneHover={setHighlightedZone}
              />
              
              {/* Floating score indicator */}
              {showFeedback && (
                <div className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "text-3xl font-bold pointer-events-none animate-fade-in",
                  showFeedback.type === "success" ? "text-accent" : "text-destructive"
                )}>
                  {showFeedback.type === "success" ? showFeedback.message : "✗"}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-primary" />
                <span>CPU/Cooler</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-accent" />
                <span>RAM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(270, 100%, 65%)" }} />
                <span>GPU</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(45, 100%, 50%)" }} />
                <span>Alimentare</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {state.phase === "paused" && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Pauză</h2>
            <p className="text-muted-foreground mb-6">Jocul este în pauză</p>
            <Button onClick={actions.resumeGame} size="lg" className="neon-glow">
              Continuă
            </Button>
          </div>
        </div>
      )}

      {/* End screen */}
      {state.phase === "completed" && (
        <GameEndScreen
          mode={state.mode}
          finalScore={actions.getFinalScore()}
          mistakes={state.mistakes}
          hintsUsed={state.hintsUsed}
          timeRemaining={state.timeRemaining}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={onExit}
        />
      )}
    </div>
  );
};

export default GameBoard;
