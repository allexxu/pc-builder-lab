import { useState, useCallback, useRef, useEffect } from "react";
import { ComponentId, ZoneId, DROP_ZONES, GAME_COMPONENTS } from "@/data/gameComponents";

export interface DragPosition {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  draggedComponent: ComponentId | null;
  ghostPosition: DragPosition;
  startPosition: DragPosition;
  hoveredZone: ZoneId | null;
  isValidDrop: boolean;
}

interface UseDragAndDropOptions {
  onDrop: (componentId: ComponentId, zoneId: ZoneId) => void;
  onInvalidDrop?: (componentId: ComponentId) => void;
  canPlaceComponent: (componentId: ComponentId) => { canPlace: boolean; reason?: string };
  placedComponents: ComponentId[];
  boardRef: React.RefObject<HTMLDivElement>;
}

export function useDragAndDrop({
  onDrop,
  onInvalidDrop,
  canPlaceComponent,
  placedComponents,
  boardRef
}: UseDragAndDropOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedComponent: null,
    ghostPosition: { x: 0, y: 0 },
    startPosition: { x: 0, y: 0 },
    hoveredZone: null,
    isValidDrop: false
  });

  const offsetRef = useRef<DragPosition>({ x: 0, y: 0 });
  const elementStartRef = useRef<DragPosition>({ x: 0, y: 0 });

  // Calculate zone boundaries from SVG coordinates to screen coordinates
  const getZoneBounds = useCallback((zone: typeof DROP_ZONES[0]) => {
    if (!boardRef.current) return null;
    
    const svg = boardRef.current.querySelector('svg');
    if (!svg) return null;
    
    const svgRect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    
    // Scale factors from SVG viewBox to actual pixel dimensions
    const scaleX = svgRect.width / viewBox.width;
    const scaleY = svgRect.height / viewBox.height;
    
    return {
      left: svgRect.left + zone.x * scaleX,
      top: svgRect.top + zone.y * scaleY,
      right: svgRect.left + (zone.x + zone.width) * scaleX,
      bottom: svgRect.top + (zone.y + zone.height) * scaleY,
      centerX: svgRect.left + (zone.x + zone.width / 2) * scaleX,
      centerY: svgRect.top + (zone.y + zone.height / 2) * scaleY,
      width: zone.width * scaleX,
      height: zone.height * scaleY
    };
  }, [boardRef]);

  // Check if ghost center is over a zone
  const getHoveredZone = useCallback((ghostCenter: DragPosition): { zone: ZoneId | null; isValid: boolean } => {
    const draggedComp = dragState.draggedComponent;
    if (!draggedComp) return { zone: null, isValid: false };

    for (const zone of DROP_ZONES) {
      // Skip cooler-mount if CPU not placed
      if (zone.id === "cooler-mount" && !placedComponents.includes("cpu")) continue;
      // Skip already occupied zones
      if (placedComponents.includes(zone.acceptsComponent)) continue;

      const bounds = getZoneBounds(zone);
      if (!bounds) continue;

      if (
        ghostCenter.x >= bounds.left &&
        ghostCenter.x <= bounds.right &&
        ghostCenter.y >= bounds.top &&
        ghostCenter.y <= bounds.bottom
      ) {
        const isValid = zone.acceptsComponent === draggedComp;
        return { zone: zone.id, isValid };
      }
    }

    return { zone: null, isValid: false };
  }, [dragState.draggedComponent, placedComponents, getZoneBounds]);

  // Start dragging
  const startDrag = useCallback((
    componentId: ComponentId,
    clientX: number,
    clientY: number,
    elementRect: DOMRect
  ) => {
    const { canPlace } = canPlaceComponent(componentId);
    if (!canPlace) return;

    // Calculate offset from cursor to element top-left
    offsetRef.current = {
      x: clientX - elementRect.left,
      y: clientY - elementRect.top
    };

    elementStartRef.current = {
      x: elementRect.left,
      y: elementRect.top
    };

    setDragState({
      isDragging: true,
      draggedComponent: componentId,
      ghostPosition: { x: elementRect.left, y: elementRect.top },
      startPosition: { x: elementRect.left, y: elementRect.top },
      hoveredZone: null,
      isValidDrop: false
    });
  }, [canPlaceComponent]);

  // Update ghost position during drag
  const updateDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragState.isDragging) return;

    const ghostX = clientX - offsetRef.current.x;
    const ghostY = clientY - offsetRef.current.y;

    // Ghost center for zone detection (assuming ~60px ghost size)
    const ghostCenter = {
      x: ghostX + 30,
      y: ghostY + 30
    };

    const { zone, isValid } = getHoveredZone(ghostCenter);

    setDragState(prev => ({
      ...prev,
      ghostPosition: { x: ghostX, y: ghostY },
      hoveredZone: zone,
      isValidDrop: isValid
    }));
  }, [dragState.isDragging, getHoveredZone]);

  // End dragging
  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedComponent) {
      setDragState(prev => ({ ...prev, isDragging: false }));
      return;
    }

    const componentId = dragState.draggedComponent;

    if (dragState.hoveredZone && dragState.isValidDrop) {
      // Valid drop - call onDrop handler
      onDrop(componentId, dragState.hoveredZone);
    } else if (dragState.hoveredZone && !dragState.isValidDrop) {
      // Invalid drop - wrong zone
      onInvalidDrop?.(componentId);
    }
    // If dropped in empty space, just return to origin (no penalty)

    setDragState({
      isDragging: false,
      draggedComponent: null,
      ghostPosition: { x: 0, y: 0 },
      startPosition: { x: 0, y: 0 },
      hoveredZone: null,
      isValidDrop: false
    });
  }, [dragState, onDrop, onInvalidDrop]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: MouseEvent) => {
    updateDrag(e.clientX, e.clientY);
  }, [updateDrag]);

  const handleMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // Touch event handlers
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    updateDrag(touch.clientX, touch.clientY);
    e.preventDefault(); // Prevent scrolling while dragging
  }, [updateDrag]);

  const handleTouchEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  // Set up global event listeners when dragging
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Get snap target position for animation
  const getSnapPosition = useCallback((zoneId: ZoneId): DragPosition | null => {
    const zone = DROP_ZONES.find(z => z.id === zoneId);
    if (!zone) return null;
    
    const bounds = getZoneBounds(zone);
    if (!bounds) return null;

    return {
      x: bounds.centerX - 30,
      y: bounds.centerY - 30
    };
  }, [getZoneBounds]);

  return {
    dragState,
    startDrag,
    endDrag,
    getSnapPosition,
    getZoneBounds
  };
}
