import { DROP_ZONES, GAME_COMPONENTS, GAME_CONFIG, ZoneId, ComponentId } from "@/data/gameComponents";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GameMode } from "@/hooks/useGameState";
import PlacedComponent from "./PlacedComponent";

interface MotherboardSVGProps {
  placedComponents: ComponentId[];
  selectedComponent: ComponentId | null;
  highlightedZone: ZoneId | null;
  onZoneClick: (zoneId: ZoneId) => void;
  onZoneHover: (zoneId: ZoneId | null) => void;
  gameMode?: GameMode;
}

const MotherboardSVG = ({
  placedComponents,
  selectedComponent,
  highlightedZone,
  onZoneClick,
  onZoneHover,
  gameMode = "training"
}: MotherboardSVGProps) => {
  
  // Get mode config for visibility settings
  const modeConfig = GAME_CONFIG[gameMode];
  
  const isZoneOccupied = (zoneId: ZoneId) => {
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    return zone ? placedComponents.includes(zone.acceptsComponent) : false;
  };

  const canDropOnZone = (zoneId: ZoneId) => {
    if (!selectedComponent) return false;
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    return zone?.acceptsComponent === selectedComponent;
  };

  const getComponentForZone = (zoneId: ZoneId) => {
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    if (!zone) return null;
    return GAME_COMPONENTS.find(c => c.id === zone.acceptsComponent);
  };

  // Schematic style colors
  const schematicStroke = "hsl(var(--foreground) / 0.6)";
  const schematicFill = "hsl(var(--background))";
  const labelColor = "hsl(var(--foreground) / 0.8)";
  const accentCyan = "hsl(var(--neon-cyan))";
  const accentGreen = "hsl(var(--neon-green))";
  const accentPurple = "hsl(var(--neon-purple))";

  return (
    <TooltipProvider>
      <div className="relative w-full max-w-none aspect-[5/4]">
        <svg
          viewBox="0 0 600 480"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 0 30px hsl(var(--primary) / 0.2))" }}
        >
          <defs>
            {/* Circuit pattern for PCB texture */}
            <pattern id="schematic-grid" patternUnits="userSpaceOnUse" width="30" height="30">
              <path
                d="M 0 15 L 15 15 M 15 0 L 15 15 L 30 15 M 15 15 L 15 30"
                stroke="hsl(var(--primary) / 0.15)"
                strokeWidth="0.5"
                fill="none"
              />
              <circle cx="15" cy="15" r="1" fill="hsl(var(--primary) / 0.2)" />
            </pattern>
            
            {/* Trace pattern */}
            <pattern id="trace-pattern" patternUnits="userSpaceOnUse" width="60" height="60">
              <path
                d="M 0 30 L 20 30 L 30 20 L 40 20 L 60 20 M 30 0 L 30 20 M 30 40 L 30 60"
                stroke="hsl(var(--neon-cyan) / 0.2)"
                strokeWidth="1"
                fill="none"
              />
            </pattern>
            
            {/* Clip paths for component images */}
            {DROP_ZONES.map(zone => {
              const scale = 1.33; // Scale factor from 450x360 to 600x480
              return (
                <clipPath key={`clip-${zone.id}`} id={`clip-${zone.id}`}>
                  <rect
                    x={zone.x * scale}
                    y={zone.y * scale}
                    width={zone.width * scale}
                    height={zone.height * scale}
                    rx="4"
                  />
                </clipPath>
              );
            })}

            {/* Glow filters */}
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* ===== MOTHERBOARD BASE ===== */}
          <rect
            x="40"
            y="30"
            width="520"
            height="420"
            rx="6"
            fill={schematicFill}
            stroke={schematicStroke}
            strokeWidth="2"
          />
          
          {/* PCB grid texture */}
          <rect
            x="40"
            y="30"
            width="520"
            height="420"
            fill="url(#schematic-grid)"
            rx="6"
          />
          
          {/* Trace decoration */}
          <rect
            x="40"
            y="30"
            width="520"
            height="420"
            fill="url(#trace-pattern)"
            rx="6"
            opacity="0.5"
          />

          {/* Mounting holes */}
          {[[55, 45], [545, 45], [55, 435], [545, 435], [300, 45], [300, 435]].map(([cx, cy], i) => (
            <g key={`mount-${i}`}>
              <circle cx={cx} cy={cy} r="8" fill="none" stroke={schematicStroke} strokeWidth="1.5" />
              <circle cx={cx} cy={cy} r="4" fill="hsl(var(--muted))" stroke={schematicStroke} strokeWidth="1" />
            </g>
          ))}

          {/* ===== I/O SHIELD AREA ===== */}
          <g>
            <rect
              x="45"
              y="40"
              width="35"
              height="120"
              rx="3"
              fill="hsl(var(--muted) / 0.5)"
              stroke={accentCyan}
              strokeWidth="1.5"
              strokeDasharray="4,2"
            />
            {/* I/O port details */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <rect
                key={`io-${i}`}
                x="50"
                y={50 + i * 18}
                width="25"
                height="12"
                rx="2"
                fill="none"
                stroke="hsl(var(--foreground) / 0.3)"
                strokeWidth="0.75"
              />
            ))}
            {/* Label with line */}
            <line x1="25" y1="100" x2="45" y2="100" stroke={accentCyan} strokeWidth="1" />
            <text x="22" y="104" textAnchor="end" fill={accentCyan} fontSize="9" fontWeight="500">I/O PANEL</text>
          </g>

          {/* ===== VRM SECTION ===== */}
          <g>
            <rect
              x="85"
              y="40"
              width="180"
              height="35"
              rx="3"
              fill="hsl(var(--muted) / 0.3)"
              stroke="hsl(var(--foreground) / 0.4)"
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            {/* VRM components */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <rect
                key={`vrm-${i}`}
                x={92 + i * 21}
                y="48"
                width="16"
                height="20"
                rx="1"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--foreground) / 0.3)"
                strokeWidth="0.5"
              />
            ))}
            <text x="175" y="85" textAnchor="middle" fill={labelColor} fontSize="8">VRMs</text>
          </g>

          {/* ===== CPU FAN HEADER ===== */}
          <g>
            <rect
              x="280"
              y="42"
              width="30"
              height="12"
              rx="2"
              fill="hsl(var(--muted) / 0.5)"
              stroke={accentGreen}
              strokeWidth="1"
            />
            <text x="295" y="68" textAnchor="middle" fill={accentGreen} fontSize="7">CPU_FAN</text>
          </g>

          {/* ===== CHIPSET ===== */}
          <g>
            <rect
              x="250"
              y="290"
              width="80"
              height="70"
              rx="4"
              fill="hsl(var(--muted) / 0.6)"
              stroke={schematicStroke}
              strokeWidth="1.5"
            />
            {/* Heatsink lines */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <line
                key={`hs-${i}`}
                x1={260 + i * 10}
                y1="300"
                x2={260 + i * 10}
                y2="350"
                stroke="hsl(var(--foreground) / 0.2)"
                strokeWidth="2"
              />
            ))}
            <text x="290" y="340" textAnchor="middle" fill={labelColor} fontSize="10" fontWeight="500">CHIPSET</text>
          </g>

          {/* ===== SATA PORTS ===== */}
          <g>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <rect
                key={`sata-${i}`}
                x={440}
                y={260 + i * 22}
                width="45"
                height="16"
                rx="2"
                fill="hsl(var(--muted) / 0.4)"
                stroke="hsl(var(--destructive) / 0.7)"
                strokeWidth="1"
              />
            ))}
            {/* Label with line */}
            <line x1="485" y1="320" x2="520" y2="320" stroke="hsl(var(--destructive) / 0.7)" strokeWidth="1" />
            <text x="523" y="324" fill="hsl(var(--destructive))" fontSize="9" fontWeight="500">SATA</text>
          </g>

          {/* ===== USB HEADERS ===== */}
          <g>
            {/* USB 3.0 */}
            <rect
              x="350"
              y="395"
              width="40"
              height="18"
              rx="2"
              fill="hsl(var(--muted) / 0.4)"
              stroke={accentCyan}
              strokeWidth="1"
            />
            <text x="370" y="425" textAnchor="middle" fill={accentCyan} fontSize="7">USB 3.0</text>
            
            {/* USB 2.0 */}
            <rect
              x="400"
              y="395"
              width="30"
              height="14"
              rx="2"
              fill="hsl(var(--muted) / 0.4)"
              stroke="hsl(var(--foreground) / 0.4)"
              strokeWidth="1"
            />
            <text x="415" y="425" textAnchor="middle" fill={labelColor} fontSize="7">USB 2.0</text>
          </g>

          {/* ===== FRONT PANEL HEADER ===== */}
          <g>
            <rect
              x="450"
              y="395"
              width="50"
              height="20"
              rx="2"
              fill="hsl(var(--muted) / 0.3)"
              stroke="hsl(var(--foreground) / 0.4)"
              strokeWidth="1"
              strokeDasharray="2,1"
            />
            {/* Pin grid */}
            {[0, 1, 2, 3, 4].map(col => 
              [0, 1].map(row => (
                <circle
                  key={`fp-${col}-${row}`}
                  cx={458 + col * 8}
                  cy={401 + row * 8}
                  r="2"
                  fill="hsl(var(--foreground) / 0.3)"
                />
              ))
            )}
            <text x="475" y="430" textAnchor="middle" fill={labelColor} fontSize="7">F_PANEL</text>
          </g>

          {/* ===== CMOS BATTERY ===== */}
          <g>
            <circle
              cx="520"
              cy="230"
              r="18"
              fill="hsl(var(--muted) / 0.5)"
              stroke={schematicStroke}
              strokeWidth="1.5"
            />
            <text x="520" y="234" textAnchor="middle" fill={labelColor} fontSize="7" fontWeight="500">CMOS</text>
          </g>

          {/* ===== HD AUDIO HEADER ===== */}
          <g>
            <rect
              x="50"
              y="400"
              width="35"
              height="18"
              rx="2"
              fill="hsl(var(--muted) / 0.4)"
              stroke={accentPurple}
              strokeWidth="1"
            />
            <text x="67" y="432" textAnchor="middle" fill={accentPurple} fontSize="7">AUDIO</text>
          </g>

          {/* ===== SYSTEM FAN HEADERS ===== */}
          <g>
            {/* SYS_FAN1 */}
            <rect
              x="500"
              y="80"
              width="25"
              height="10"
              rx="2"
              fill="hsl(var(--muted) / 0.4)"
              stroke={accentGreen}
              strokeWidth="1"
            />
            <text x="512" y="105" textAnchor="middle" fill={accentGreen} fontSize="6">SYS_FAN1</text>
            
            {/* SYS_FAN2 */}
            <rect
              x="500"
              y="420"
              width="25"
              height="10"
              rx="2"
              fill="hsl(var(--muted) / 0.4)"
              stroke={accentGreen}
              strokeWidth="1"
            />
            <text x="512" y="418" textAnchor="middle" fill={accentGreen} fontSize="6">SYS_FAN2</text>
          </g>

          {/* ===== PCIe x1 SLOTS ===== */}
          <g>
            <rect
              x="100"
              y="380"
              width="100"
              height="12"
              rx="2"
              fill="hsl(var(--muted) / 0.3)"
              stroke="hsl(var(--foreground) / 0.3)"
              strokeWidth="1"
            />
            <text x="150" y="405" textAnchor="middle" fill={labelColor} fontSize="7">PCIe x1</text>
          </g>

          {/* ===== DROP ZONES ===== */}
          {DROP_ZONES.map(zone => {
            const scale = 1.33;
            const scaledX = zone.x * scale;
            const scaledY = zone.y * scale;
            const scaledW = zone.width * scale;
            const scaledH = zone.height * scale;
            
            const isOccupied = isZoneOccupied(zone.id);
            const isHighlighted = highlightedZone === zone.id;
            const canDrop = canDropOnZone(zone.id);
            const component = getComponentForZone(zone.id);
            
            // Don't show cooler mount if CPU not placed
            if (zone.id === "cooler-mount" && !placedComponents.includes("cpu")) {
              return null;
            }
            // Hide CPU socket once cooler is placed
            if (zone.id === "cpu-socket" && placedComponents.includes("cooler")) {
              return null;
            }

            // Render placed component with 3D effects
            if (isOccupied && component) {
              return (
                <PlacedComponent
                  key={zone.id}
                  component={component}
                  zone={zone}
                  scale={scale}
                  showBadge={modeConfig.showZoneLabels}
                />
              );
            }

            // Empty zone rendering - conditional based on game mode
            const showZoneVisuals = modeConfig.showZoneHints;
            const showLabel = modeConfig.showZoneLabels;

            return (
              <Tooltip key={zone.id}>
                <TooltipTrigger asChild>
                  <g
                    onClick={() => !isOccupied && onZoneClick(zone.id)}
                    onMouseEnter={() => onZoneHover(zone.id)}
                    onMouseLeave={() => onZoneHover(null)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Zone background */}
                    <rect
                      x={scaledX}
                      y={scaledY}
                      width={scaledW}
                      height={scaledH}
                      rx="4"
                      fill="hsl(var(--muted) / 0.3)"
                      stroke={showZoneVisuals ? zone.color : "hsl(var(--border) / 0.3)"}
                      strokeWidth={showZoneVisuals ? (isHighlighted || canDrop ? 3 : 2) : 1}
                      strokeDasharray={showZoneVisuals ? "6,4" : "3,3"}
                      opacity={showZoneVisuals ? 0.85 : 0.4}
                      className={cn(
                        "transition-all duration-200",
                        showZoneVisuals && isHighlighted && "animate-pulse",
                        showZoneVisuals && canDrop && "animate-pulse"
                      )}
                      style={{
                        filter: showZoneVisuals && (isHighlighted || canDrop)
                          ? `drop-shadow(0 0 12px ${zone.color})` 
                          : "none"
                      }}
                    />
                    
                    {/* Zone label (only when visible in mode) */}
                    {showLabel && (
                      <text
                        x={scaledX + scaledW / 2}
                        y={scaledY + scaledH / 2 + 4}
                        textAnchor="middle"
                        fill="hsl(var(--foreground))"
                        fontSize="9"
                        fontWeight="500"
                        opacity="0.8"
                      >
                        {zone.name.length > 14 ? zone.name.slice(0, 12) + ".." : zone.name}
                      </text>
                    )}
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <div>
                    <p className="font-semibold">{zone.name}</p>
                    <p className="text-xs text-muted-foreground">{zone.description}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* ===== SCHEMATIC LABELS WITH LINES (hidden in Ranked mode) ===== */}
          {modeConfig.showZoneLabels && (
            <>
              {/* CPU Label */}
              <g>
                <line x1="160" y1="145" x2="130" y2="145" stroke={accentCyan} strokeWidth="1" />
                <line x1="130" y1="145" x2="130" y2="110" stroke={accentCyan} strokeWidth="1" />
                <circle cx="160" cy="145" r="3" fill={accentCyan} />
                <text x="130" y="105" textAnchor="middle" fill={accentCyan} fontSize="11" fontWeight="bold">CPU SOCKET</text>
                <text x="130" y="117" textAnchor="middle" fill={labelColor} fontSize="8">LGA 1700</text>
              </g>

              {/* RAM Label */}
              <g>
                <line x1="450" y1="130" x2="520" y2="130" stroke={accentGreen} strokeWidth="1" />
                <circle cx="450" cy="130" r="3" fill={accentGreen} />
                <text x="523" y="125" fill={accentGreen} fontSize="11" fontWeight="bold">DDR5 DIMM</text>
                <text x="523" y="138" fill={labelColor} fontSize="8">4 Slots</text>
              </g>

              {/* GPU Label */}
              <g>
                <line x1="100" y1="350" x2="50" y2="350" stroke={accentPurple} strokeWidth="1" />
                <line x1="50" y1="350" x2="50" y2="320" stroke={accentPurple} strokeWidth="1" />
                <circle cx="100" cy="350" r="3" fill={accentPurple} />
                <text x="50" y="315" textAnchor="middle" fill={accentPurple} fontSize="11" fontWeight="bold">PCIe x16</text>
                <text x="50" y="328" textAnchor="middle" fill={labelColor} fontSize="8">GPU Slot</text>
              </g>

              {/* M.2 Label */}
              <g>
                <line x1="200" y1="305" x2="200" y2="265" stroke="hsl(30, 100%, 50%)" strokeWidth="1" />
                <circle cx="200" cy="305" r="3" fill="hsl(30, 100%, 50%)" />
                <text x="200" y="260" textAnchor="middle" fill="hsl(30, 100%, 50%)" fontSize="10" fontWeight="bold">M.2 NVMe</text>
              </g>

              {/* Power Connectors Labels */}
              <g>
                {/* ATX 24-pin */}
                <line x1="500" y1="180" x2="545" y2="180" stroke="hsl(45, 100%, 50%)" strokeWidth="1" />
                <circle cx="500" cy="180" r="3" fill="hsl(45, 100%, 50%)" />
                <text x="548" y="175" fill="hsl(45, 100%, 50%)" fontSize="10" fontWeight="bold">ATX 24-PIN</text>
                <text x="548" y="188" fill={labelColor} fontSize="8">Main Power</text>
              </g>

              <g>
                {/* EPS 8-pin */}
                <line x1="340" y1="50" x2="340" y2="20" stroke="hsl(45, 100%, 50%)" strokeWidth="1" />
                <circle cx="340" cy="50" r="3" fill="hsl(45, 100%, 50%)" />
                <text x="340" y="15" textAnchor="middle" fill="hsl(45, 100%, 50%)" fontSize="10" fontWeight="bold">EPS 8-PIN</text>
              </g>
            </>
          )}

          {/* Board model text */}
          <text x="290" y="460" textAnchor="middle" fill="hsl(var(--foreground) / 0.4)" fontSize="10" fontFamily="monospace">
            PC BUILDER SIMULATOR • {modeConfig.showZoneLabels ? "SCHEMATIC VIEW" : "RANKED MODE"}
          </text>
        </svg>
      </div>
    </TooltipProvider>
  );
};

export default MotherboardSVG;
