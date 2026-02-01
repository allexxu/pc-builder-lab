import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface GameRecord {
  id: string;
  mode: string;
  score: number;
  time_seconds: number;
  accuracy: number;
  mistakes: number;
  completed: boolean;
  played_at: string;
}

export function useGameHistory() {
  const { user } = useAuth();
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    if (!user) {
      setGames([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("game_history")
        .select("*")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setGames(data || []);
    } catch (err) {
      console.error("Error fetching game history:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const saveGame = async (gameData: {
    mode: string;
    score: number;
    time_seconds: number;
    accuracy: number;
    mistakes: number;
    completed: boolean;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("game_history")
        .insert({
          user_id: user.id,
          ...gameData,
        });

      if (error) throw error;

      // Update user stats
      await updateUserStats(gameData);

      await fetchGames();
      return { error: null };
    } catch (err) {
      console.error("Error saving game:", err);
      return { error: err as Error };
    }
  };

  const updateUserStats = async (gameData: {
    score: number;
    time_seconds: number;
    accuracy: number;
    completed: boolean;
  }) => {
    if (!user || !gameData.completed) return;

    try {
      // Get current stats
      const { data: currentStats } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const newBestScore = Math.max(currentStats?.best_score || 0, gameData.score);
      const newBestTime = currentStats?.best_time_seconds 
        ? Math.min(currentStats.best_time_seconds, gameData.time_seconds)
        : gameData.time_seconds;
      const newTotalGames = (currentStats?.total_games || 0) + 1;
      const newTotalAccuracy = (currentStats?.total_accuracy || 0) + gameData.accuracy;

      await supabase
        .from("user_stats")
        .upsert({
          user_id: user.id,
          best_score: newBestScore,
          best_time_seconds: newBestTime,
          total_games: newTotalGames,
          total_accuracy: newTotalAccuracy,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });
    } catch (err) {
      console.error("Error updating user stats:", err);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Azi";
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `Acum ${diffDays} zile`;
    return date.toLocaleDateString("ro-RO");
  };

  return {
    games,
    loading,
    saveGame,
    formatTime,
    getRelativeDate,
    refetch: fetchGames,
  };
}
