import { useRef } from "react";
import { GameComponent, ComponentId } from "@/data/gameComponents";
import { cn } from "@/lib/utils";

interface DraggableComponentProps {
  component: GameComponent;
  isPlaced: boolean;
  canPlace: boolean;
  reason?: string;
  isDragging: boolean;
  showHint?: boolean;
  onDragStart: (
    componentId: ComponentId,
    clientX: number,
    clientY: number,
    elementRect: DOMRect
  ) => void;
}

const DraggableComponent = ({
  component,
  isPlaced,
  canPlace,
  reason,
  isDragging,
  showHint = false,
  onDragStart
}: DraggableComponentProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  if (isPlaced) {
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canPlace || !elementRef.current) return;
    e.preventDefault();
    const rect = elementRef.current.getBoundingClientRect();
    onDragStart(component.id, e.clientX, e.clientY, rect);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canPlace || !elementRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = elementRef.current.getBoundingClientRect();
    onDragStart(component.id, touch.clientX, touch.clientY, rect);
  };

  return (
    <div
      ref={elementRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={cn(
        "relative p-3 rounded-lg border-2 transition-all duration-200",
        "flex items-center gap-3 select-none",
        canPlace && "cursor-grab active:cursor-grabbing hover:scale-[1.02]",
        canPlace && "border-border hover:border-primary/50 hover:bg-primary/5",
        !canPlace && "border-border/50 opacity-50 cursor-not-allowed",
        isDragging && "opacity-30 scale-95",
        showHint && "ring-2 ring-accent ring-offset-2 ring-offset-background animate-pulse"
      )}
    >
      {/* Component Image */}
      <div 
        className={cn(
          "w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
          "transition-transform duration-200 bg-background/50"
        )}
        style={{ 
          borderColor: component.color,
          borderWidth: "1px"
        }}
      >
        <img 
          src={component.image} 
          alt={component.name}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Component Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{component.name}</h4>
        <p className="text-xs text-muted-foreground truncate">{component.description}</p>
        {!canPlace && reason && (
          <p className="text-[10px] text-destructive mt-1 truncate">⚠️ {reason}</p>
        )}
      </div>

      {/* Order badge */}
      <div 
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{ 
          backgroundColor: component.color,
          color: "hsl(var(--background))"
        }}
      >
        {component.order}
      </div>

      {/* Hint indicator */}
      {showHint && (
        <div className="absolute -top-1 -left-1 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded">
          HINT
        </div>
      )}

      {/* Drag affordance */}
      {canPlace && (
        <div className="absolute inset-0 rounded-lg border-2 border-transparent hover:border-primary/30 pointer-events-none" />
      )}
    </div>
  );
};

export default DraggableComponent;
