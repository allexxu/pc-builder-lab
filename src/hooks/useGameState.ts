import { useState, useCallback, useEffect, useRef } from "react";
import { 
  GAME_COMPONENTS, 
  GAME_CONFIG, 
  POINTS, 
  ComponentId, 
  ZoneId,
  GameComponent 
} from "@/data/gameComponents";

export type GameMode = "training" | "challenge" | "ranked";
export type GamePhase = "idle" | "playing" | "paused" | "completed";

export interface PlacementResult {
  success: boolean;
  message: string;
  points: number;
}

export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  score: number;
  timeRemaining: number;
  lives: number;
  hintsUsed: number;
  placedComponents: ComponentId[];
  currentStep: number;
  mistakes: number;
  selectedComponent: ComponentId | null;
  lastPlacementResult: PlacementResult | null;
}

export interface GameActions {
  startGame: (mode: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  selectComponent: (componentId: ComponentId | null) => void;
  placeComponent: (componentId: ComponentId, zoneId: ZoneId) => PlacementResult;
  useHint: () => GameComponent | null;
  getAvailableComponents: () => GameComponent[];
  isComponentPlaced: (componentId: ComponentId) => boolean;
  canPlaceComponent: (componentId: ComponentId) => { canPlace: boolean; reason?: string };
  getFinalScore: () => { 
    baseScore: number; 
    timeBonus: number; 
    perfectBonus: number; 
    noHintsBonus: number; 
    total: number 
  };
}

const initialState: GameState = {
  mode: "training",
  phase: "idle",
  score: 0,
  timeRemaining: 0,
  lives: 3,
  hintsUsed: 0,
  placedComponents: [],
  currentStep: 0,
  mistakes: 0,
  selectedComponent: null,
  lastPlacementResult: null
};

export function useGameState(): [GameState, GameActions] {
  const [state, setState] = useState<GameState>(initialState);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    if (state.phase === "playing" && state.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            return { ...prev, timeRemaining: 0, phase: "completed" };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [state.phase, state.timeRemaining]);

  // Check for game over (lives)
  useEffect(() => {
    if (state.mode === "challenge" && state.lives <= 0 && state.phase === "playing") {
      setState(prev => ({ ...prev, phase: "completed" }));
    }
  }, [state.lives, state.mode, state.phase]);

  // Check for game completion
  useEffect(() => {
    if (state.placedComponents.length === GAME_COMPONENTS.length && state.phase === "playing") {
      setState(prev => ({ ...prev, phase: "completed" }));
    }
  }, [state.placedComponents.length, state.phase]);

  const startGame = useCallback((mode: GameMode) => {
    const config = GAME_CONFIG[mode];
    setState({
      ...initialState,
      mode,
      phase: "playing",
      timeRemaining: config.timeLimit,
      lives: config.lives === Infinity ? 999 : config.lives
    });
  }, []);

  const pauseGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: "paused" }));
  }, []);

  const resumeGame = useCallback(() => {
    setState(prev => ({ ...prev, phase: "playing" }));
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState);
  }, []);

  const selectComponent = useCallback((componentId: ComponentId | null) => {
    setState(prev => ({ ...prev, selectedComponent: componentId }));
  }, []);

  const canPlaceComponent = useCallback((componentId: ComponentId): { canPlace: boolean; reason?: string } => {
    const component = GAME_COMPONENTS.find(c => c.id === componentId);
    if (!component) {
      return { canPlace: false, reason: "Componentă necunoscută" };
    }

    if (state.placedComponents.includes(componentId)) {
      return { canPlace: false, reason: "Componenta este deja plasată" };
    }

    if (component.dependency && !state.placedComponents.includes(component.dependency)) {
      const depComponent = GAME_COMPONENTS.find(c => c.id === component.dependency);
      return { 
        canPlace: false, 
        reason: `Trebuie să plasezi mai întâi: ${depComponent?.name}` 
      };
    }

    return { canPlace: true };
  }, [state.placedComponents]);

  const placeComponent = useCallback((componentId: ComponentId, zoneId: ZoneId): PlacementResult => {
    const component = GAME_COMPONENTS.find(c => c.id === componentId);
    
    if (!component) {
      const result = { success: false, message: "Componentă necunoscută", points: 0 };
      setState(prev => ({ ...prev, lastPlacementResult: result }));
      return result;
    }

    // Check dependencies
    const canPlace = canPlaceComponent(componentId);
    if (!canPlace.canPlace) {
      const config = GAME_CONFIG[state.mode];
      const result = { 
        success: false, 
        message: canPlace.reason || "Nu poți plasa această componentă acum", 
        points: -config.penaltyPoints 
      };
      
      setState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        lives: prev.mode === "challenge" ? prev.lives - 1 : prev.lives,
        score: Math.max(0, prev.score - config.penaltyPoints),
        lastPlacementResult: result
      }));
      
      return result;
    }

    // Check correct zone
    if (component.targetZone !== zoneId) {
      const config = GAME_CONFIG[state.mode];
      const result = { 
        success: false, 
        message: `Zonă greșită! ${component.name} nu se montează aici.`, 
        points: -config.penaltyPoints 
      };
      
      setState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
        lives: prev.mode === "challenge" ? prev.lives - 1 : prev.lives,
        score: Math.max(0, prev.score - config.penaltyPoints),
        lastPlacementResult: result
      }));
      
      return result;
    }

    // Correct placement!
    const result = { 
      success: true, 
      message: `Corect! ${component.name} montat cu succes!`, 
      points: POINTS.correctPlacement 
    };
    
    setState(prev => ({
      ...prev,
      placedComponents: [...prev.placedComponents, componentId],
      currentStep: prev.currentStep + 1,
      score: prev.score + POINTS.correctPlacement,
      selectedComponent: null,
      lastPlacementResult: result
    }));
    
    return result;
  }, [state.mode, canPlaceComponent]);

  const useHint = useCallback((): GameComponent | null => {
    const config = GAME_CONFIG[state.mode];
    if (!config.hintsEnabled) return null;

    // Find next component to place
    const sortedComponents = [...GAME_COMPONENTS].sort((a, b) => a.order - b.order);
    const nextComponent = sortedComponents.find(c => !state.placedComponents.includes(c.id));
    
    if (nextComponent) {
      setState(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      return nextComponent;
    }
    
    return null;
  }, [state.mode, state.placedComponents]);

  const getAvailableComponents = useCallback((): GameComponent[] => {
    return GAME_COMPONENTS.filter(c => !state.placedComponents.includes(c.id));
  }, [state.placedComponents]);

  const isComponentPlaced = useCallback((componentId: ComponentId): boolean => {
    return state.placedComponents.includes(componentId);
  }, [state.placedComponents]);

  const getFinalScore = useCallback(() => {
    const config = GAME_CONFIG[state.mode];
    const baseScore = state.score;
    
    // Time bonus (only for timed modes)
    let timeBonus = 0;
    if (config.timeLimit > 0 && state.timeRemaining > 0) {
      timeBonus = Math.floor((state.timeRemaining / config.timeLimit) * POINTS.timeBonus);
    }
    
    // Perfect bonus (no mistakes)
    const perfectMultiplier = state.mistakes === 0 ? POINTS.perfectBonus : 1;
    
    // No hints bonus
    const noHintsBonus = state.hintsUsed === 0 ? POINTS.noHintsBonus : 0;
    
    const total = (baseScore + timeBonus + noHintsBonus) * perfectMultiplier;
    
    return {
      baseScore,
      timeBonus,
      perfectBonus: perfectMultiplier > 1 ? baseScore : 0,
      noHintsBonus,
      total
    };
  }, [state.mode, state.score, state.timeRemaining, state.mistakes, state.hintsUsed]);

  const actions: GameActions = {
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    selectComponent,
    placeComponent,
    useHint,
    getAvailableComponents,
    isComponentPlaced,
    canPlaceComponent,
    getFinalScore
  };

  return [state, actions];
}
