import { useState, useEffect, useRef } from "react";
import { useGameState, GameMode } from "@/hooks/useGameState";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { GAME_COMPONENTS, GAME_CONFIG, ComponentId, ZoneId } from "@/data/gameComponents";
import MotherboardSVG from "./MotherboardSVG";
import DraggableComponent from "./DraggableComponent";
import GhostComponent from "./GhostComponent";
import DropZoneOverlay from "./DropZoneOverlay";
import GameHUD from "./GameHUD";
import GameEndScreen from "./GameEndScreen";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowLeft, Info, GripVertical, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";

interface GameBoardProps {
  mode: GameMode;
  onExit: () => void;
}

const GameBoard = ({ mode, onExit }: GameBoardProps) => {
  const [state, actions] = useGameState();
  const [hintComponent, setHintComponent] = useState<ComponentId | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [floatingScore, setFloatingScore] = useState<{ points: number; x: number; y: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag and drop system
  const { dragState, startDrag, getSnapPosition } = useDragAndDrop({
    onDrop: (componentId, zoneId) => {
      actions.placeComponent(componentId, zoneId);
    },
    onInvalidDrop: (componentId) => {
      // Trigger error feedback for wrong zone
      const comp = GAME_COMPONENTS.find(c => c.id === componentId);
      toast.error("Zonă greșită!", {
        description: `${comp?.name} nu se potrivește aici`,
        duration: 2000
      });
      setShowFeedback({ type: "error", message: "Zonă greșită!" });
      setTimeout(() => setShowFeedback(null), 1000);
    },
    canPlaceComponent: actions.canPlaceComponent,
    placedComponents: state.placedComponents,
    boardRef
  });

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

  // Show feedback toast when component is placed
  useEffect(() => {
    if (state.lastPlacementResult) {
      const result = state.lastPlacementResult;
      if (result.success) {
        toast.success(result.message, {
          description: `+${result.points} puncte`,
          duration: 2000
        });
        setShowFeedback({ type: "success", message: `+${result.points}` });
        
        // Show floating score
        setFloatingScore({ points: result.points, x: 50, y: 50 });
        setTimeout(() => setFloatingScore(null), 1500);
      } else {
        toast.error(result.message, {
          description: result.points < 0 ? `${result.points} puncte` : undefined,
          duration: 3000
        });
        setShowFeedback({ type: "error", message: result.message });
        
        if (result.points < 0) {
          setFloatingScore({ points: result.points, x: 50, y: 50 });
          setTimeout(() => setFloatingScore(null), 1500);
        }
      }
      
      setTimeout(() => setShowFeedback(null), 1500);
    }
  }, [state.lastPlacementResult]);

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
  const draggedComponentData = dragState.draggedComponent 
    ? GAME_COMPONENTS.find(c => c.id === dragState.draggedComponent)
    : null;

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
      <div className="flex-1 w-full max-w-none px-4 py-6">
        {/* Back button and instructions */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onExit} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </Button>
          
          {!dragState.isDragging && (
            <Alert className="max-w-md border-primary/50 bg-primary/10">
              <GripVertical className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary text-sm">
                <strong>Trage</strong> componentele cu mouse-ul și <strong>plasează-le</strong> pe zonele corecte de pe placă
              </AlertDescription>
            </Alert>
          )}

          {dragState.isDragging && draggedComponentData && (
            <Alert className="max-w-md border-accent/50 bg-accent/10 animate-pulse">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent text-sm">
                Tragi: <strong>{draggedComponentData.name}</strong> — plasează pe zona corectă!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Game content */}
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {/* Components panel - Draggable */}
          <div className="order-2 lg:order-1">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Componente Disponibile
              <span className="text-xs text-muted-foreground ml-2">
                (trage pe placă)
              </span>
            </h3>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {GAME_COMPONENTS.map(component => {
                const isPlaced = actions.isComponentPlaced(component.id);
                const { canPlace, reason } = actions.canPlaceComponent(component.id);
                const isDragging = dragState.draggedComponent === component.id;
                
                return (
                  <DraggableComponent
                    key={component.id}
                    component={component}
                    isPlaced={isPlaced}
                    canPlace={canPlace}
                    reason={reason}
                    isDragging={isDragging}
                    showHint={hintComponent === component.id}
                    onDragStart={startDrag}
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

          {/* Motherboard area with drop zones */}
          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-stretch w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold">
                Placă de Bază
                {dragState.isDragging && (
                  <span className="text-accent text-sm ml-2 animate-pulse">
                    — Plasează componenta aici!
                  </span>
                )}
              </h3>
              
              {/* Zoom Control */}
              <div className="flex items-center gap-3 bg-card/50 px-4 py-2 rounded-lg border border-border">
                <ZoomOut className="w-4 h-4 text-muted-foreground" />
                <Slider
                  value={[zoomLevel]}
                  onValueChange={(value) => setZoomLevel(value[0])}
                  min={80}
                  max={180}
                  step={10}
                  className="w-32"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono text-muted-foreground w-12">{zoomLevel}%</span>
                
                {/* Quick zoom buttons */}
                <div className="flex gap-1 ml-2">
                  {[100, 130, 160].map(level => (
                    <Button
                      key={level}
                      variant={zoomLevel === level ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setZoomLevel(level)}
                    >
                      {level}%
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Container that fits viewport properly */}
            <div 
              className="flex items-center justify-center rounded-2xl border-2 border-border bg-card/30 p-4 overflow-hidden"
              style={{
                height: "clamp(450px, calc(100vh - 240px), 700px)",
              }}
            >
              <div 
                ref={boardRef}
                className={cn(
                  "relative transition-all duration-300 h-full w-full flex items-center justify-center",
                  dragState.isDragging && "border-primary/50",
                  showFeedback?.type === "success" && "animate-bounce-success",
                  showFeedback?.type === "error" && "animate-shake"
                )}
              >
                <div 
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: "center center",
                  }}
                >
                  {/* Drop zone overlay - shows when dragging */}
                  <DropZoneOverlay
                    draggedComponent={dragState.draggedComponent}
                    hoveredZone={dragState.hoveredZone}
                    isValidDrop={dragState.isValidDrop}
                    placedComponents={state.placedComponents}
                    gameMode={state.mode}
                  />

                  <MotherboardSVG
                    placedComponents={state.placedComponents}
                    selectedComponent={null}
                    highlightedZone={dragState.hoveredZone}
                    onZoneClick={() => {}} // Disabled - using drag now
                    onZoneHover={() => {}} // Disabled - drag handles this
                    gameMode={state.mode}
                  />
                </div>
                
                {/* Floating score indicator */}
                {floatingScore && (
                  <div 
                    className={cn(
                      "absolute pointer-events-none animate-float-up",
                      "text-3xl font-bold",
                      floatingScore.points > 0 ? "text-accent" : "text-destructive"
                    )}
                    style={{
                      top: "40%",
                      left: "50%",
                      transform: "translateX(-50%)"
                    }}
                  >
                    {floatingScore.points > 0 ? `+${floatingScore.points}` : floatingScore.points}
                  </div>
                )}
              </div>
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

      {/* Ghost component that follows cursor */}
      {dragState.isDragging && draggedComponentData && (
        <GhostComponent
          component={draggedComponentData}
          position={dragState.ghostPosition}
          isValid={dragState.isValidDrop}
          isOverZone={!!dragState.hoveredZone}
        />
      )}

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
