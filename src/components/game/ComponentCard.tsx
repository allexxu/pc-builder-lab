import { GameComponent, ComponentId } from "@/data/gameComponents";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ComponentCardProps {
  component: GameComponent;
  isSelected: boolean;
  isPlaced: boolean;
  canPlace: boolean;
  reason?: string;
  onSelect: (id: ComponentId) => void;
  showHint?: boolean;
}

const ComponentCard = ({
  component,
  isSelected,
  isPlaced,
  canPlace,
  reason,
  onSelect,
  showHint = false
}: ComponentCardProps) => {

  if (isPlaced) {
    return null; // Don't render placed components
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => canPlace && onSelect(component.id)}
            className={cn(
              "relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer",
              "flex items-center gap-3",
              isSelected && "border-primary neon-glow scale-105",
              !isSelected && canPlace && "border-border hover:border-primary/50 hover:bg-primary/5",
              !canPlace && "border-border/50 opacity-50 cursor-not-allowed",
              showHint && "ring-2 ring-accent ring-offset-2 ring-offset-background animate-pulse"
            )}
            style={{
              backgroundColor: isSelected ? `${component.color}15` : undefined
            }}
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
                className="w-full h-full object-cover"
              />
            </div>

            {/* Component Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{component.name}</h4>
              <p className="text-xs text-muted-foreground truncate">{component.description}</p>
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
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[280px]">
          <div className="flex gap-3">
            <img 
              src={component.image} 
              alt={component.name}
              className="w-16 h-16 rounded object-cover flex-shrink-0"
            />
            <div>
              <p className="font-semibold">{component.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{component.hint}</p>
              {!canPlace && reason && (
                <p className="text-xs text-destructive mt-2">⚠️ {reason}</p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComponentCard;
