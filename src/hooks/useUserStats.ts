import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserStats {
  best_score: number;
  best_time_seconds: number | null;
  total_games: number;
  total_accuracy: number;
  lessons_completed: number;
  rank: number | null;
}

const DEFAULT_STATS: UserStats = {
  best_score: 0,
  best_time_seconds: null,
  total_games: 0,
  total_accuracy: 0,
  lessons_completed: 0,
  rank: null,
};

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(DEFAULT_STATS);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setStats({
          best_score: data.best_score,
          best_time_seconds: data.best_time_seconds,
          total_games: data.total_games,
          total_accuracy: data.total_accuracy,
          lessons_completed: data.lessons_completed,
          rank: data.rank,
        });
      } else {
        // Create initial stats if they don't exist
        await supabase
          .from("user_stats")
          .insert({ user_id: user.id });
        setStats(DEFAULT_STATS);
      }
    } catch (err) {
      console.error("Error fetching user stats:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const getAverageAccuracy = (): number => {
    if (stats.total_games === 0) return 0;
    return Math.round(stats.total_accuracy / stats.total_games);
  };

  const formatBestTime = (): string => {
    if (!stats.best_time_seconds) return "--:--";
    const mins = Math.floor(stats.best_time_seconds / 60);
    const secs = stats.best_time_seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    stats,
    loading,
    getAverageAccuracy,
    formatBestTime,
    refetch: fetchStats,
  };
}
