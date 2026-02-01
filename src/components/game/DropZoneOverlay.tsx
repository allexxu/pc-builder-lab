import { DROP_ZONES, ZoneId, ComponentId, GAME_COMPONENTS, GAME_CONFIG } from "@/data/gameComponents";
import { cn } from "@/lib/utils";
import { GameMode } from "@/hooks/useGameState";

interface DropZoneOverlayProps {
  draggedComponent: ComponentId | null;
  hoveredZone: ZoneId | null;
  isValidDrop: boolean;
  placedComponents: ComponentId[];
  gameMode?: GameMode;
}

const DropZoneOverlay = ({
  draggedComponent,
  hoveredZone,
  isValidDrop,
  placedComponents,
  gameMode = "training"
}: DropZoneOverlayProps) => {
  // Get mode config
  const modeConfig = GAME_CONFIG[gameMode];
  
  // In Ranked mode, don't show any overlay hints
  if (!modeConfig.showZoneHints && !modeConfig.showDropIndicators) {
    // Only show minimal feedback when actually hovering over a zone
    if (!draggedComponent || !hoveredZone) return null;
    
    // Minimal feedback only
    const zone = DROP_ZONES.find(z => z.id === hoveredZone);
    if (!zone) return null;
    
    const scale = 1.33; // Same scale as MotherboardSVG
    
    return (
      <svg
        viewBox="0 0 600 480"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      >
        <g>
          <rect
            x={(zone.x - 2) * scale}
            y={(zone.y - 2) * scale}
            width={(zone.width + 4) * scale}
            height={(zone.height + 4) * scale}
            rx="6"
            fill={isValidDrop ? "hsl(var(--accent) / 0.2)" : "hsl(var(--destructive) / 0.2)"}
            stroke={isValidDrop ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
            strokeWidth="2"
          />
          <text
            x={(zone.x + zone.width / 2) * scale}
            y={(zone.y + zone.height / 2 + 4) * scale}
            textAnchor="middle"
            fill={isValidDrop ? "hsl(var(--accent))" : "hsl(var(--destructive))"}
            fontSize="14"
            fontWeight="bold"
          >
            {isValidDrop ? "✓" : "✗"}
          </text>
        </g>
      </svg>
    );
  }
  
  if (!draggedComponent) return null;

  const scale = 1.33; // Same scale as MotherboardSVG

  return (
    <svg
      viewBox="0 0 600 480"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    >
      {DROP_ZONES.map(zone => {
        // Skip cooler-mount if CPU not placed
        if (zone.id === "cooler-mount" && !placedComponents.includes("cpu")) {
          return null;
        }
        // Skip already occupied zones
        if (placedComponents.includes(zone.acceptsComponent)) {
          return null;
        }

        const isHovered = hoveredZone === zone.id;
        const canAccept = zone.acceptsComponent === draggedComponent;

        // Scale coordinates
        const scaledX = zone.x * scale;
        const scaledY = zone.y * scale;
        const scaledW = zone.width * scale;
        const scaledH = zone.height * scale;

        return (
          <g key={zone.id}>
            {/* Highlight for potential drop zones */}
            <rect
              x={scaledX - 4}
              y={scaledY - 4}
              width={scaledW + 8}
              height={scaledH + 8}
              rx="8"
              fill="none"
              stroke={canAccept ? "hsl(var(--accent))" : "hsl(var(--muted-foreground))"}
              strokeWidth={isHovered ? 4 : 2}
              strokeDasharray={isHovered ? "0" : "8,4"}
              opacity={canAccept ? 1 : 0.3}
              className={cn(
                "transition-all duration-200",
                isHovered && canAccept && "animate-glow-valid",
                isHovered && !canAccept && "animate-glow-invalid"
              )}
              style={{
                filter: isHovered && canAccept 
                  ? "drop-shadow(0 0 15px hsl(var(--accent)))" 
                  : isHovered && !canAccept
                    ? "drop-shadow(0 0 15px hsl(var(--destructive)))"
                    : canAccept 
                      ? "drop-shadow(0 0 8px hsl(var(--accent) / 0.5))"
                      : "none"
              }}
            />

            {/* "Drop here" indicator for valid zones */}
            {canAccept && (
              <g opacity={isHovered ? 1 : 0.7}>
                <rect
                  x={scaledX}
                  y={scaledY}
                  width={scaledW}
                  height={scaledH}
                  rx="4"
                  fill={isHovered ? "hsl(var(--accent) / 0.2)" : "hsl(var(--accent) / 0.1)"}
                  className={isHovered ? "animate-pulse" : ""}
                />
              </g>
            )}

            {/* Hovered zone feedback */}
            {isHovered && (
              <>
                {isValidDrop ? (
                  // Valid drop - green glow
                  <>
                    <rect
                      x={scaledX - 2}
                      y={scaledY - 2}
                      width={scaledW + 4}
                      height={scaledH + 4}
                      rx="6"
                      fill="hsl(var(--accent) / 0.3)"
                      className="animate-pulse"
                    />
                    <text
                      x={scaledX + scaledW / 2}
                      y={scaledY + scaledH / 2 + 4}
                      textAnchor="middle"
                      fill="hsl(var(--accent))"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      ✓
                    </text>
                  </>
                ) : (
                  // Invalid drop - red shake
                  <>
                    <rect
                      x={scaledX - 2}
                      y={scaledY - 2}
                      width={scaledW + 4}
                      height={scaledH + 4}
                      rx="6"
                      fill="hsl(var(--destructive) / 0.3)"
                      className="animate-shake-subtle"
                    />
                    <text
                      x={scaledX + scaledW / 2}
                      y={scaledY + scaledH / 2 + 4}
                      textAnchor="middle"
                      fill="hsl(var(--destructive))"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      ✗
                    </text>
                  </>
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default DropZoneOverlay;
