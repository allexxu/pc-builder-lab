import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Cpu, Cable, Timer, Star, Trophy, LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  unlocked_at?: string;
}

// Achievement definitions
const ACHIEVEMENTS_CONFIG: Omit<Achievement, "unlocked" | "unlocked_at">[] = [
  { id: "first_step", name: "Primul Pas", description: "Completează prima lecție", icon: BookOpen },
  { id: "ram_whisperer", name: "RAM Whisperer", description: "Plasează RAM-ul corect de 10 ori", icon: Cpu },
  { id: "cable_master", name: "Cable Master", description: "Conectează toate cablurile fără greșeli", icon: Cable },
  { id: "speed_demon", name: "Speed Demon", description: "Finalizează jocul în sub 3 minute", icon: Timer },
  { id: "perfect_run", name: "Perfect Run", description: "0 greșeli într-un joc Challenge", icon: Star },
  { id: "top_10", name: "Top 10", description: "Ajunge în Top 10 pe leaderboard", icon: Trophy },
];

export function useAchievements() {
  const { user } = useAuth();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) {
      setUnlockedIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_achievements")
        .select("achievement_id, unlocked_at")
        .eq("user_id", user.id);

      if (error) throw error;
      
      const ids = new Set(data?.map(a => a.achievement_id) || []);
      setUnlockedIds(ids);
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const unlockAchievement = async (achievementId: string): Promise<boolean> => {
    if (!user) return false;
    if (unlockedIds.has(achievementId)) return false; // Already unlocked

    try {
      const { error } = await supabase
        .from("user_achievements")
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - already exists
          return false;
        }
        throw error;
      }

      setUnlockedIds(prev => new Set([...prev, achievementId]));
      return true;
    } catch (err) {
      console.error("Error unlocking achievement:", err);
      return false;
    }
  };

  // Check and unlock achievements based on conditions
  const checkLessonAchievements = async (completedLessonsCount: number) => {
    if (completedLessonsCount >= 1) {
      return await unlockAchievement("first_step");
    }
    return false;
  };

  const checkGameAchievements = async (gameData: {
    mode: string;
    time_seconds: number;
    mistakes: number;
    completed: boolean;
  }) => {
    const unlocked: string[] = [];

    if (gameData.completed) {
      // Speed Demon - under 3 minutes (180 seconds)
      if (gameData.time_seconds < 180) {
        const success = await unlockAchievement("speed_demon");
        if (success) unlocked.push("speed_demon");
      }

      // Perfect Run - 0 mistakes in Challenge mode
      if (gameData.mode === "challenge" && gameData.mistakes === 0) {
        const success = await unlockAchievement("perfect_run");
        if (success) unlocked.push("perfect_run");
      }

      // Cable Master - no cable mistakes (simplified check)
      if (gameData.mistakes === 0) {
        const success = await unlockAchievement("cable_master");
        if (success) unlocked.push("cable_master");
      }
    }

    return unlocked;
  };

  const checkLeaderboardAchievement = async (rank: number) => {
    if (rank <= 10) {
      return await unlockAchievement("top_10");
    }
    return false;
  };

  const getAchievements = (): Achievement[] => {
    return ACHIEVEMENTS_CONFIG.map(config => ({
      ...config,
      unlocked: unlockedIds.has(config.id),
    }));
  };

  const getUnlockedCount = () => unlockedIds.size;
  const getTotalCount = () => ACHIEVEMENTS_CONFIG.length;

  return {
    achievements: getAchievements(),
    loading,
    unlockAchievement,
    checkLessonAchievements,
    checkGameAchievements,
    checkLeaderboardAchievement,
    getUnlockedCount,
    getTotalCount,
    refetch: fetchAchievements,
  };
}
