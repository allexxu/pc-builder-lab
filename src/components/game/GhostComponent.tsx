import { GameComponent } from "@/data/gameComponents";
import { cn } from "@/lib/utils";

interface GhostComponentProps {
  component: GameComponent;
  position: { x: number; y: number };
  isValid: boolean;
  isOverZone: boolean;
}

const GhostComponent = ({ component, position, isValid, isOverZone }: GhostComponentProps) => {
  return (
    <div
      className={cn(
        "fixed pointer-events-none z-50 transition-transform duration-75",
        "w-[60px] h-[60px] rounded-lg overflow-hidden",
        "shadow-2xl transform scale-110",
        isOverZone && isValid && "ring-4 ring-accent animate-pulse-valid",
        isOverZone && !isValid && "ring-4 ring-destructive animate-shake-subtle"
      )}
      style={{
        left: position.x,
        top: position.y,
        boxShadow: isOverZone && isValid 
          ? `0 0 30px hsl(var(--accent) / 0.6), 0 20px 40px rgba(0,0,0,0.4)`
          : isOverZone && !isValid
            ? `0 0 30px hsl(var(--destructive) / 0.6), 0 20px 40px rgba(0,0,0,0.4)`
            : `0 0 20px hsl(var(--primary) / 0.4), 0 20px 40px rgba(0,0,0,0.4)`,
        transform: `translate(0, 0) scale(${isOverZone ? 1.15 : 1.1})`
      }}
    >
      <img 
        src={component.image} 
        alt={component.name}
        className="w-full h-full object-cover"
        draggable={false}
      />
      
      {/* Validity indicator overlay */}
      {isOverZone && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center",
          isValid ? "bg-accent/20" : "bg-destructive/20"
        )}>
          <span className="text-2xl">
            {isValid ? "✓" : "✗"}
          </span>
        </div>
      )}
    </div>
  );
};

export default GhostComponent;
