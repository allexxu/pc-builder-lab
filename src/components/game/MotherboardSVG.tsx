import { DROP_ZONES, ZoneId, ComponentId } from "@/data/gameComponents";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MotherboardSVGProps {
  placedComponents: ComponentId[];
  selectedComponent: ComponentId | null;
  highlightedZone: ZoneId | null;
  onZoneClick: (zoneId: ZoneId) => void;
  onZoneHover: (zoneId: ZoneId | null) => void;
}

const MotherboardSVG = ({
  placedComponents,
  selectedComponent,
  highlightedZone,
  onZoneClick,
  onZoneHover
}: MotherboardSVGProps) => {
  
  const isZoneOccupied = (zoneId: ZoneId) => {
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    return zone ? placedComponents.includes(zone.acceptsComponent) : false;
  };

  const canDropOnZone = (zoneId: ZoneId) => {
    if (!selectedComponent) return false;
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    return zone?.acceptsComponent === selectedComponent;
  };

  return (
    <TooltipProvider>
      <div className="relative w-full max-w-[500px] aspect-[5/4]">
        <svg
          viewBox="0 0 450 360"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 20px hsl(var(--primary) / 0.3))" }}
        >
          {/* Motherboard base */}
          <rect
            x="20"
            y="20"
            width="410"
            height="320"
            rx="8"
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
          />
          
          {/* PCB texture pattern */}
          <defs>
            <pattern id="circuit" patternUnits="userSpaceOnUse" width="20" height="20">
              <path
                d="M 0 10 L 10 10 L 10 0 M 10 20 L 10 10 L 20 10"
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                fill="none"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect
            x="20"
            y="20"
            width="410"
            height="320"
            fill="url(#circuit)"
            rx="8"
          />

          {/* Chipset area */}
          <rect
            x="200"
            y="220"
            width="60"
            height="50"
            rx="4"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          <text x="230" y="250" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="8">
            CHIPSET
          </text>

          {/* I/O Shield area */}
          <rect
            x="25"
            y="25"
            width="25"
            height="80"
            rx="2"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
          />
          <text x="37" y="70" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="6" transform="rotate(-90, 37, 70)">
            I/O
          </text>

          {/* SATA ports */}
          {[0, 1, 2, 3].map(i => (
            <rect
              key={`sata-${i}`}
              x={330}
              y={200 + i * 18}
              width="35"
              height="12"
              rx="2"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--destructive))"
              strokeWidth="1"
            />
          ))}
          <text x="347" y="195" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="7">
            SATA
          </text>

          {/* Drop zones */}
          {DROP_ZONES.map(zone => {
            const isOccupied = isZoneOccupied(zone.id);
            const isHighlighted = highlightedZone === zone.id;
            const canDrop = canDropOnZone(zone.id);
            
            // Don't show cooler mount if CPU not placed
            if (zone.id === "cooler-mount" && !placedComponents.includes("cpu")) {
              return null;
            }
            // Hide CPU socket once cooler is placed
            if (zone.id === "cpu-socket" && placedComponents.includes("cooler")) {
              return null;
            }

            return (
              <Tooltip key={zone.id}>
                <TooltipTrigger asChild>
                  <g
                    onClick={() => !isOccupied && onZoneClick(zone.id)}
                    onMouseEnter={() => onZoneHover(zone.id)}
                    onMouseLeave={() => onZoneHover(null)}
                    style={{ cursor: isOccupied ? "default" : "pointer" }}
                  >
                    <rect
                      x={zone.x}
                      y={zone.y}
                      width={zone.width}
                      height={zone.height}
                      rx="4"
                      fill={isOccupied ? zone.color : "hsl(var(--muted))"}
                      stroke={zone.color}
                      strokeWidth={isHighlighted || canDrop ? 3 : 2}
                      strokeDasharray={isOccupied ? "0" : "5,3"}
                      opacity={isOccupied ? 0.9 : 0.7}
                      className={cn(
                        "transition-all duration-200",
                        isHighlighted && !isOccupied && "animate-pulse",
                        canDrop && "animate-pulse"
                      )}
                      style={{
                        filter: (isHighlighted || canDrop) && !isOccupied 
                          ? `drop-shadow(0 0 10px ${zone.color})` 
                          : "none"
                      }}
                    />
                    {/* Zone label */}
                    {!isOccupied && (
                      <text
                        x={zone.x + zone.width / 2}
                        y={zone.y + zone.height / 2 + 3}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize="7"
                        opacity="0.7"
                      >
                        {zone.name.length > 12 ? zone.name.slice(0, 10) + ".." : zone.name}
                      </text>
                    )}
                    {/* Placed component indicator */}
                    {isOccupied && (
                      <text
                        x={zone.x + zone.width / 2}
                        y={zone.y + zone.height / 2 + 4}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        ✓
                      </text>
                    )}
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p className="font-semibold">{zone.name}</p>
                  <p className="text-xs text-muted-foreground">{zone.description}</p>
                  {isOccupied && <p className="text-xs text-accent mt-1">✓ Componentă plasată</p>}
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Labels for major sections */}
          <text x="220" y="105" textAnchor="middle" fill="hsl(var(--primary))" fontSize="10" fontWeight="bold">
            CPU
          </text>
          <text x="315" y="75" textAnchor="middle" fill="hsl(var(--accent))" fontSize="8">
            RAM
          </text>
          <text x="160" y="245" textAnchor="middle" fill="hsl(30, 100%, 50%)" fontSize="8">
            M.2
          </text>
          <text x="160" y="295" textAnchor="middle" fill="hsl(270, 100%, 65%)" fontSize="8">
            PCIe x16
          </text>
        </svg>
      </div>
    </TooltipProvider>
  );
};

export default MotherboardSVG;
