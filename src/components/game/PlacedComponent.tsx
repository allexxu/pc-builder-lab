import { GameComponent, DropZone } from "@/data/gameComponents";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PlacedComponentProps {
  component: GameComponent;
  zone: DropZone;
  scale?: number;
  showBadge?: boolean;
}

/**
 * PlacedComponent renders a component that has been placed on the motherboard
 * with 3D effects, shadows, and interactive hover states
 */
const PlacedComponent = ({ 
  component, 
  zone, 
  scale = 1.33,
  showBadge = true 
}: PlacedComponentProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const scaledX = zone.x * scale;
  const scaledY = zone.y * scale;
  const scaledW = zone.width * scale;
  const scaledH = zone.height * scale;

  // Generate unique filter ID for this component
  const filterId = `shadow-${component.id}`;
  const glowId = `glow-${component.id}`;

  return (
    <g
      className={cn(
        "animate-snap-in-3d component-hover-lift cursor-pointer",
        isHovered && "animate-glow-pulse"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG Filters for this component */}
      <defs>
        {/* Drop shadow filter */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="4"
            stdDeviation="3"
            floodColor="rgba(0,0,0,0.4)"
          />
        </filter>
        
        {/* Glow filter for hover */}
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor={zone.color} floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Slot base - visible behind component for depth */}
      <rect
        x={scaledX - 2}
        y={scaledY - 2}
        width={scaledW + 4}
        height={scaledH + 4}
        rx="6"
        fill="hsl(var(--muted) / 0.8)"
        stroke="hsl(var(--border))"
        strokeWidth="1"
      />

      {/* Inner slot shadow */}
      <rect
        x={scaledX}
        y={scaledY}
        width={scaledW}
        height={scaledH}
        rx="4"
        fill="hsl(var(--background))"
        opacity="0.5"
      />

      {/* Component container with 3D effect */}
      <g filter={isHovered ? `url(#${glowId})` : `url(#${filterId})`}>
        {/* Component background plate */}
        <rect
          x={scaledX + 2}
          y={scaledY + 2}
          width={scaledW - 4}
          height={scaledH - 4}
          rx="3"
          fill="hsl(var(--card))"
          stroke={zone.color}
          strokeWidth={isHovered ? 2 : 1.5}
          style={{
            filter: isHovered 
              ? `drop-shadow(0 0 10px ${zone.color})` 
              : `drop-shadow(0 0 5px ${zone.color})`
          }}
        />

        {/* Component image */}
        <image
          href={component.image}
          x={scaledX + 3}
          y={scaledY + 3}
          width={scaledW - 6}
          height={scaledH - 6}
          preserveAspectRatio="xMidYMid slice"
          style={{
            clipPath: `inset(0 round 3px)`,
          }}
        />

        {/* Top highlight for 3D effect */}
        <rect
          x={scaledX + 3}
          y={scaledY + 3}
          width={scaledW - 6}
          height={Math.min(8, scaledH * 0.15)}
          rx="2"
          fill="white"
          opacity="0.15"
        />

        {/* Bottom shadow for 3D effect */}
        <rect
          x={scaledX + 3}
          y={scaledY + scaledH - Math.min(6, scaledH * 0.1) - 3}
          width={scaledW - 6}
          height={Math.min(6, scaledH * 0.1)}
          rx="2"
          fill="black"
          opacity="0.2"
        />
      </g>

      {/* Mounted badge */}
      {showBadge && (
        <g opacity={isHovered ? 1 : 0.8}>
          <rect
            x={scaledX + scaledW - 28}
            y={scaledY + 4}
            width="24"
            height="14"
            rx="7"
            fill="hsl(var(--accent))"
          />
          <text
            x={scaledX + scaledW - 16}
            y={scaledY + 14}
            textAnchor="middle"
            fill="hsl(var(--accent-foreground))"
            fontSize="8"
            fontWeight="bold"
          >
            ✓
          </text>
        </g>
      )}

      {/* Hover tooltip info */}
      {isHovered && (
        <g className="pointer-events-none">
          {/* Background */}
          <rect
            x={scaledX}
            y={scaledY + scaledH + 5}
            width={Math.max(scaledW, 120)}
            height="28"
            rx="4"
            fill="hsl(var(--popover))"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.95"
          />
          {/* Component name */}
          <text
            x={scaledX + 5}
            y={scaledY + scaledH + 18}
            fill="hsl(var(--popover-foreground))"
            fontSize="9"
            fontWeight="500"
          >
            {component.name}
          </text>
          {/* Status */}
          <text
            x={scaledX + 5}
            y={scaledY + scaledH + 28}
            fill="hsl(var(--accent))"
            fontSize="7"
          >
            Montat ✓
          </text>
        </g>
      )}
    </g>
  );
};

export default PlacedComponent;
